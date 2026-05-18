-- ============================================================================
-- Migración inicial — Mercado Nuestro
-- ----------------------------------------------------------------------------
-- Crea el esqueleto del modelo de datos: usuarios, roles, direcciones,
-- verificaciones, productos, categorías y campañas de importación con sus
-- escalones de precio y reservas.
--
-- Convenciones (ver CLAUDE.md §9):
--   - snake_case en tablas y columnas, tablas en plural
--   - IDs como uuid generados con gen_random_uuid()
--   - timestamps en UTC con default timezone('utc', now())
--   - updated_at mantenido por trigger handle_updated_at()
--   - dinero en bigint de centavos, NUNCA floats
--   - RLS obligatorio en toda tabla con datos de usuarios
-- ============================================================================


-- ============================================================================
-- HELPERS
-- ============================================================================

-- Mantiene updated_at sincronizado en UPDATE. Usar como trigger por tabla.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


-- ============================================================================
-- ENUMS
-- ============================================================================

create type public.user_role as enum (
  'comprador',
  'vendedor_catalogo',
  'revendedor',
  'importador_avanzado',
  'admin'
);

create type public.user_status as enum (
  'activa',
  'suspendida',
  'eliminada'
);

create type public.verification_type as enum (
  'cedula',
  'rut',
  'comprobante_domicilio'
);

create type public.verification_status as enum (
  'pendiente',
  'aprobado',
  'rechazado'
);

create type public.campaign_status as enum (
  'borrador',
  'activa',
  'cerrada_exitosa',
  'cerrada_fallida',
  'en_proceso',
  'entregada',
  'finalizada',
  'cancelada'
);

create type public.reservation_status as enum (
  'activa',
  'cancelada',
  'confirmada',
  'pagada_total',
  'entregada'
);


-- ============================================================================
-- profiles  (extensión 1:1 de auth.users)
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  birth_date date,
  avatar_url text,
  status public.user_status not null default 'activa',
  last_active_at timestamptz default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- ============================================================================
-- user_roles  (roles acumulables por usuario)
-- ============================================================================

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  assigned_at timestamptz not null default timezone('utc', now()),
  assigned_by uuid references public.profiles(id),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, role)
);

create trigger user_roles_updated_at
  before update on public.user_roles
  for each row execute function public.handle_updated_at();

create index user_roles_user_id_idx on public.user_roles(user_id);

alter table public.user_roles enable row level security;

create policy "user_roles_select_own"
  on public.user_roles for select
  using ((select auth.uid()) = user_id);

-- Helper SQL para chequear roles desde RLS de otras tablas.
-- SECURITY DEFINER porque el caller no tiene SELECT sobre user_roles ajenos.
create or replace function public.has_role(check_user_id uuid, check_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user_id
      and role = check_role
      and active = true
  );
$$;


-- ============================================================================
-- Trigger: al crear un user en auth.users → profile + rol comprador
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.user_roles (user_id, role, assigned_by)
  values (new.id, 'comprador', new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- user_addresses
-- ============================================================================

create table public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  street text not null,
  street_number text,
  apartment text,
  city text not null,
  department text not null,
  postal_code text,
  instructions text,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger user_addresses_updated_at
  before update on public.user_addresses
  for each row execute function public.handle_updated_at();

create index user_addresses_user_id_idx on public.user_addresses(user_id);

alter table public.user_addresses enable row level security;

create policy "user_addresses_all_own"
  on public.user_addresses for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- user_verifications
-- ============================================================================

create table public.user_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.verification_type not null,
  file_url text not null,
  status public.verification_status not null default 'pendiente',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger user_verifications_updated_at
  before update on public.user_verifications
  for each row execute function public.handle_updated_at();

create index user_verifications_user_id_idx on public.user_verifications(user_id);

alter table public.user_verifications enable row level security;

create policy "user_verifications_select_own"
  on public.user_verifications for select
  using ((select auth.uid()) = user_id);

create policy "user_verifications_insert_own"
  on public.user_verifications for insert
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- categories  (árbol de categorías)
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete restrict,
  icon text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

create index categories_parent_id_idx on public.categories(parent_id);
create index categories_slug_idx on public.categories(slug);

alter table public.categories enable row level security;

create policy "categories_select_active_public"
  on public.categories for select
  to anon, authenticated
  using (active = true);


-- ============================================================================
-- products  (catálogo maestro)
-- ============================================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  long_description text,
  category_id uuid references public.categories(id) on delete restrict,
  brand text,
  main_image_url text,
  additional_image_urls text[] not null default '{}',
  attributes jsonb not null default '{}'::jsonb,
  weight_grams integer,
  dimensions jsonb,
  supplier_reference text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

create index products_category_id_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);

alter table public.products enable row level security;

create policy "products_select_active_public"
  on public.products for select
  to anon, authenticated
  using (active = true);


-- ============================================================================
-- product_variants
-- ============================================================================

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  image_url text,
  sku text unique,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.handle_updated_at();

create index product_variants_product_id_idx on public.product_variants(product_id);

alter table public.product_variants enable row level security;

create policy "product_variants_select_active_public"
  on public.product_variants for select
  to anon, authenticated
  using (active = true);


-- ============================================================================
-- campaigns
-- ============================================================================

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text,
  hero_image_url text,
  moq integer not null check (moq > 0),
  max_quantity integer check (max_quantity is null or max_quantity >= moq),
  -- Porcentaje de seña requerido al reservar (default 30%, ver §5.2)
  deposit_percentage smallint not null default 30
    check (deposit_percentage > 0 and deposit_percentage <= 100),
  opens_at timestamptz not null default timezone('utc', now()),
  closes_at timestamptz not null,
  actually_closed_at timestamptz,
  estimated_arrival_at date,
  status public.campaign_status not null default 'borrador',
  return_policy text,
  internal_notes text,
  created_by uuid not null references public.profiles(id),
  -- Una sola extensión permitida (§5.4)
  extended_once boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint campaigns_closes_after_opens check (closes_at > opens_at)
);

create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.handle_updated_at();

create index campaigns_product_id_idx on public.campaigns(product_id);
create index campaigns_status_idx on public.campaigns(status);
create index campaigns_closes_at_idx on public.campaigns(closes_at);

alter table public.campaigns enable row level security;

-- Borradores y canceladas sólo se ven internamente; el resto es público.
create policy "campaigns_select_public_visible"
  on public.campaigns for select
  to anon, authenticated
  using (status in (
    'activa', 'cerrada_exitosa', 'cerrada_fallida',
    'en_proceso', 'entregada', 'finalizada'
  ));


-- ============================================================================
-- campaign_pricing_tiers
-- ============================================================================

create table public.campaign_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  tier_number smallint not null,
  min_quantity integer not null check (min_quantity > 0),
  max_quantity integer check (max_quantity is null or max_quantity >= min_quantity),
  -- Precio unitario en centavos de USD (siempre integer para dinero).
  unit_price_cents_usd bigint not null check (unit_price_cents_usd > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, tier_number)
);

create trigger campaign_pricing_tiers_updated_at
  before update on public.campaign_pricing_tiers
  for each row execute function public.handle_updated_at();

create index campaign_pricing_tiers_campaign_id_idx
  on public.campaign_pricing_tiers(campaign_id);

alter table public.campaign_pricing_tiers enable row level security;

create policy "campaign_pricing_tiers_select_with_campaign"
  on public.campaign_pricing_tiers for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.campaigns c
      where c.id = campaign_id
        and c.status in (
          'activa', 'cerrada_exitosa', 'cerrada_fallida',
          'en_proceso', 'entregada', 'finalizada'
        )
    )
  );


-- ============================================================================
-- campaign_reservations
-- ============================================================================

create table public.campaign_reservations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- Precio mostrado al reservar (referencia, en centavos USD).
  -- El precio FINAL se aplica al cerrar la campaña al mejor escalón alcanzado.
  unit_price_at_reservation_cents_usd bigint not null
    check (unit_price_at_reservation_cents_usd > 0),
  -- Seña esperada al momento de reservar (centavos USD).
  expected_deposit_cents_usd bigint not null
    check (expected_deposit_cents_usd >= 0),
  status public.reservation_status not null default 'activa',
  reserved_at timestamptz not null default timezone('utc', now()),
  cancelled_at timestamptz,
  cancellation_reason text,
  -- Atribuciones para tracking de viralidad y comisiones.
  attributed_seller_id uuid references public.profiles(id),
  share_referral_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger campaign_reservations_updated_at
  before update on public.campaign_reservations
  for each row execute function public.handle_updated_at();

create index campaign_reservations_campaign_id_idx
  on public.campaign_reservations(campaign_id);
create index campaign_reservations_user_id_idx
  on public.campaign_reservations(user_id);
create index campaign_reservations_status_idx
  on public.campaign_reservations(status);

alter table public.campaign_reservations enable row level security;

create policy "campaign_reservations_select_own"
  on public.campaign_reservations for select
  using ((select auth.uid()) = user_id);

create policy "campaign_reservations_insert_own"
  on public.campaign_reservations for insert
  with check ((select auth.uid()) = user_id);

create policy "campaign_reservations_update_own"
  on public.campaign_reservations for update
  using ((select auth.uid()) = user_id);


-- ============================================================================
-- VISTA: campaign_progress_view
-- ----------------------------------------------------------------------------
-- Estado en tiempo real de cada campaña para mostrar en home y detalle:
-- cantidad reservada, % al MOQ, segundos hasta cierre.
-- Hereda RLS de campaigns vía join implícito.
-- ============================================================================

create or replace view public.campaign_progress_view
with (security_invoker = true)
as
select
  c.id as campaign_id,
  c.title,
  c.slug,
  c.moq,
  c.max_quantity,
  c.opens_at,
  c.closes_at,
  c.status,
  coalesce(
    sum(r.quantity) filter (where r.status <> 'cancelada'),
    0
  )::integer as reserved_quantity,
  count(distinct r.user_id) filter (where r.status <> 'cancelada') as unique_reservers,
  case
    when c.moq = 0 then 0
    else round(
      least(
        100,
        (coalesce(sum(r.quantity) filter (where r.status <> 'cancelada'), 0) * 100.0) / c.moq
      ),
      2
    )
  end as moq_progress_pct,
  extract(epoch from (c.closes_at - timezone('utc', now())))::bigint as seconds_until_close
from public.campaigns c
left join public.campaign_reservations r on r.campaign_id = c.id
group by c.id, c.title, c.slug, c.moq, c.max_quantity, c.opens_at, c.closes_at, c.status;
