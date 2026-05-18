-- ============================================================================
-- Migración Phase 1 — Resto del modelo de datos del MVP
-- ----------------------------------------------------------------------------
-- Agrega las tablas que faltaban del bloque 4 del MASTER para cerrar la
-- Fase 1: orders unificadas, payments, inventory, marketplace, vendedores
-- por catálogo, comisiones, reseñas, wishlists, propuestas, reclamos,
-- notificaciones, settings, auditoría y status updates de campañas.
--
-- Convenciones (idénticas a la migración inicial):
--   - snake_case, plural, uuid + gen_random_uuid()
--   - timestamps UTC, trigger handle_updated_at()
--   - dinero en bigint de centavos
--   - RLS obligatorio en datos de usuarios
-- ============================================================================


-- ============================================================================
-- ENUMS adicionales
-- ============================================================================

create type public.order_status as enum (
  'pendiente_pago',
  'pagada',
  'en_proceso',
  'enviada',
  'entregada',
  'cancelada',
  'reembolsada'
);

create type public.order_item_type as enum (
  'campaign_reservation',
  'inventory_item',
  'marketplace_listing'
);

create type public.payment_method as enum (
  'mercado_pago',
  'transferencia',
  'abitab',
  'redpagos',
  'credito_cuenta',
  'manual'
);

create type public.payment_status as enum (
  'pendiente',
  'aprobado',
  'rechazado',
  'reembolsado',
  'expirado'
);

create type public.credit_movement_type as enum (
  'ajuste_precio_campana',
  'devolucion_sena_campana_fallida',
  'bonus_campana_fallida',
  'reembolso',
  'uso_en_compra',
  'regalo',
  'ajuste_manual'
);

create type public.listing_status as enum (
  'activa',
  'pausada',
  'agotada',
  'eliminada'
);

create type public.marketplace_order_status as enum (
  'pagada',
  'despachada',
  'entregada',
  'cancelada',
  'reembolsada'
);

create type public.catalog_sale_status as enum (
  'pendiente',
  'consolidada',
  'pagada',
  'descartada'
);

create type public.commission_payout_status as enum (
  'solicitado',
  'pagado',
  'rechazado'
);

create type public.review_status as enum (
  'visible',
  'oculto_admin',
  'reportado'
);

create type public.proposal_status as enum (
  'abierta',
  'en_revision',
  'aprobada',
  'rechazada',
  'convertida'
);

create type public.ticket_status as enum (
  'abierto',
  'en_proceso',
  'cerrado'
);

create type public.ticket_priority as enum (
  'baja',
  'normal',
  'alta',
  'urgente'
);

create type public.claim_type as enum (
  'defectuoso',
  'no_llego',
  'llego_equivocado',
  'faltante',
  'no_corresponde_descripcion',
  'otro'
);

create type public.claim_status as enum (
  'abierto',
  'en_revision',
  'resuelto_a_favor_usuario',
  'resuelto_a_favor_vendedor',
  'apelado',
  'cerrado'
);

create type public.notification_channel as enum (
  'in_app',
  'email',
  'sms',
  'whatsapp'
);

create type public.campaign_update_type as enum (
  'pedido_confirmado_proveedor',
  'producto_despachado_origen',
  'en_transito',
  'llego_aduana',
  'despacho_aduanero',
  'llego_deposito',
  'listo_entrega',
  'mensaje_general'
);


-- ============================================================================
-- Stock disponible (inventory_items)
-- ============================================================================

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  location text not null default 'paysandu',
  unit_price_cents_usd bigint not null check (unit_price_cents_usd > 0),
  cost_cents_usd bigint check (cost_cents_usd is null or cost_cents_usd >= 0),
  source_campaign_id uuid references public.campaigns(id) on delete set null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.handle_updated_at();

create index inventory_items_product_id_idx on public.inventory_items(product_id);
create index inventory_items_active_idx on public.inventory_items(active) where active = true;

alter table public.inventory_items enable row level security;

create policy "inventory_items_select_active_public"
  on public.inventory_items for select
  to anon, authenticated
  using (active = true and quantity_available > 0);


-- ============================================================================
-- Órdenes unificadas (orders, order_items, payments)
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  total_cents_usd bigint not null check (total_cents_usd >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'UYU')),
  status public.order_status not null default 'pendiente_pago',
  shipping_address_id uuid references public.user_addresses(id) on delete set null,
  shipping_method text,
  attributed_seller_id uuid references public.profiles(id) on delete set null,
  share_referral_code text,
  customer_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  using ((select auth.uid()) = user_id);

create policy "orders_insert_own"
  on public.orders for insert
  with check ((select auth.uid()) = user_id);


create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type public.order_item_type not null,
  reference_id uuid not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents_usd bigint not null check (unit_price_cents_usd >= 0),
  subtotal_cents_usd bigint not null check (subtotal_cents_usd >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "order_items_select_via_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );


create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  reservation_id uuid references public.campaign_reservations(id) on delete set null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'UYU' check (currency in ('USD', 'UYU')),
  method public.payment_method not null,
  status public.payment_status not null default 'pendiente',
  external_id text,
  external_status text,
  raw_payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

create index payments_order_id_idx on public.payments(order_id);
create index payments_reservation_id_idx on public.payments(reservation_id);
create index payments_external_id_idx on public.payments(external_id);
create index payments_status_idx on public.payments(status);

alter table public.payments enable row level security;

create policy "payments_select_via_order_or_reservation"
  on public.payments for select
  using (
    (
      order_id is not null and exists (
        select 1 from public.orders o
        where o.id = order_id and o.user_id = (select auth.uid())
      )
    )
    or (
      reservation_id is not null and exists (
        select 1 from public.campaign_reservations r
        where r.id = reservation_id and r.user_id = (select auth.uid())
      )
    )
  );


-- ============================================================================
-- User credits
-- ============================================================================

create table public.user_credits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available_cents_usd bigint not null default 0 check (available_cents_usd >= 0),
  reserved_cents_usd bigint not null default 0 check (reserved_cents_usd >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger user_credits_updated_at
  before update on public.user_credits
  for each row execute function public.handle_updated_at();

alter table public.user_credits enable row level security;

create policy "user_credits_select_own"
  on public.user_credits for select
  using ((select auth.uid()) = user_id);


create table public.credit_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount_cents_usd bigint not null,
  type public.credit_movement_type not null,
  reference_type text,
  reference_id uuid,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create index credit_movements_user_id_idx on public.credit_movements(user_id);
create index credit_movements_created_at_idx on public.credit_movements(created_at desc);

alter table public.credit_movements enable row level security;

create policy "credit_movements_select_own"
  on public.credit_movements for select
  using ((select auth.uid()) = user_id);


-- ============================================================================
-- Vendedores (seller_profiles)
-- ============================================================================

create table public.seller_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  public_avatar_url text,
  rating_avg numeric(3,2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  total_sales integer not null default 0,
  payout_method text,
  payout_data jsonb,
  joined_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger seller_profiles_updated_at
  before update on public.seller_profiles
  for each row execute function public.handle_updated_at();

create index seller_profiles_slug_idx on public.seller_profiles(slug);

alter table public.seller_profiles enable row level security;

create policy "seller_profiles_select_public"
  on public.seller_profiles for select
  to anon, authenticated
  using (true);

create policy "seller_profiles_update_own"
  on public.seller_profiles for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Marketplace (listings, orders, messages)
-- ============================================================================

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity_available integer not null check (quantity_available >= 0),
  quantity_total integer not null check (quantity_total >= 0),
  price_cents_usd bigint not null check (price_cents_usd > 0),
  additional_image_urls text[] not null default '{}',
  description text,
  status public.listing_status not null default 'activa',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger marketplace_listings_updated_at
  before update on public.marketplace_listings
  for each row execute function public.handle_updated_at();

create index marketplace_listings_seller_id_idx on public.marketplace_listings(seller_id);
create index marketplace_listings_product_id_idx on public.marketplace_listings(product_id);
create index marketplace_listings_status_idx on public.marketplace_listings(status);

alter table public.marketplace_listings enable row level security;

create policy "marketplace_listings_select_active_public"
  on public.marketplace_listings for select
  to anon, authenticated
  using (status = 'activa');

create policy "marketplace_listings_all_own"
  on public.marketplace_listings for all
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);


create table public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents_usd bigint not null check (unit_price_cents_usd > 0),
  total_cents_usd bigint not null check (total_cents_usd > 0),
  commission_cents_usd bigint not null default 0 check (commission_cents_usd >= 0),
  seller_amount_cents_usd bigint not null check (seller_amount_cents_usd >= 0),
  status public.marketplace_order_status not null default 'pagada',
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  tracking_code text,
  shipping_address jsonb,
  shipping_method text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger marketplace_orders_updated_at
  before update on public.marketplace_orders
  for each row execute function public.handle_updated_at();

create index marketplace_orders_buyer_id_idx on public.marketplace_orders(buyer_id);
create index marketplace_orders_seller_id_idx on public.marketplace_orders(seller_id);
create index marketplace_orders_status_idx on public.marketplace_orders(status);

alter table public.marketplace_orders enable row level security;

create policy "marketplace_orders_select_buyer_or_seller"
  on public.marketplace_orders for select
  using ((select auth.uid()) in (buyer_id, seller_id));


create table public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create index marketplace_messages_conversation_idx
  on public.marketplace_messages(conversation_id, sent_at desc);

alter table public.marketplace_messages enable row level security;

create policy "marketplace_messages_select_participant"
  on public.marketplace_messages for select
  using ((select auth.uid()) in (sender_id, recipient_id));

create policy "marketplace_messages_insert_own"
  on public.marketplace_messages for insert
  with check ((select auth.uid()) = sender_id);


-- ============================================================================
-- Catálogo de vendedor (links, attributions, sales, comisiones)
-- ============================================================================

create table public.catalog_links (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  internal_name text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index catalog_links_seller_idx on public.catalog_links(seller_id);

alter table public.catalog_links enable row level security;

create policy "catalog_links_select_public"
  on public.catalog_links for select
  to anon, authenticated
  using (active = true);

create policy "catalog_links_all_own"
  on public.catalog_links for all
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);


create table public.catalog_attributions (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.catalog_links(id) on delete cascade,
  visitor_token text,
  user_id uuid references public.profiles(id) on delete set null,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null
);

create index catalog_attributions_link_idx on public.catalog_attributions(link_id);
create index catalog_attributions_user_idx on public.catalog_attributions(user_id);
create index catalog_attributions_visitor_idx on public.catalog_attributions(visitor_token);

alter table public.catalog_attributions enable row level security;

-- Solo el vendedor dueño del link puede ver sus atribuciones.
create policy "catalog_attributions_select_via_link_owner"
  on public.catalog_attributions for select
  using (
    exists (
      select 1 from public.catalog_links l
      where l.id = link_id and l.seller_id = (select auth.uid())
    )
  );


create table public.catalog_sales (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  reservation_id uuid references public.campaign_reservations(id) on delete set null,
  attributable_cents_usd bigint not null check (attributable_cents_usd >= 0),
  commission_pct numeric(5,2) not null check (commission_pct >= 0 and commission_pct <= 100),
  commission_cents_usd bigint not null check (commission_cents_usd >= 0),
  status public.catalog_sale_status not null default 'pendiente',
  consolidated_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger catalog_sales_updated_at
  before update on public.catalog_sales
  for each row execute function public.handle_updated_at();

create index catalog_sales_seller_idx on public.catalog_sales(seller_id);
create index catalog_sales_status_idx on public.catalog_sales(status);

alter table public.catalog_sales enable row level security;

create policy "catalog_sales_select_own"
  on public.catalog_sales for select
  using ((select auth.uid()) = seller_id);


create table public.commission_tiers (
  id uuid primary key default gen_random_uuid(),
  level smallint not null unique,
  min_monthly_cents_usd bigint not null check (min_monthly_cents_usd >= 0),
  base_pct numeric(5,2) not null check (base_pct >= 0 and base_pct <= 100),
  excluded_category_ids uuid[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger commission_tiers_updated_at
  before update on public.commission_tiers
  for each row execute function public.handle_updated_at();

alter table public.commission_tiers enable row level security;

create policy "commission_tiers_select_public"
  on public.commission_tiers for select
  to anon, authenticated
  using (true);


create table public.commission_payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  period_month date not null,
  total_cents_usd bigint not null check (total_cents_usd >= 0),
  method text,
  requested_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz,
  proof_url text,
  status public.commission_payout_status not null default 'solicitado',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (seller_id, period_month)
);

create trigger commission_payouts_updated_at
  before update on public.commission_payouts
  for each row execute function public.handle_updated_at();

create index commission_payouts_seller_idx on public.commission_payouts(seller_id);

alter table public.commission_payouts enable row level security;

create policy "commission_payouts_select_own"
  on public.commission_payouts for select
  using ((select auth.uid()) = seller_id);


-- ============================================================================
-- Reseñas
-- ============================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  photos text[] not null default '{}',
  status public.review_status not null default 'visible',
  admin_response text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

create index reviews_product_idx on public.reviews(product_id);
create index reviews_user_idx on public.reviews(user_id);

alter table public.reviews enable row level security;

create policy "reviews_select_visible_public"
  on public.reviews for select
  to anon, authenticated
  using (status = 'visible');

create policy "reviews_insert_own"
  on public.reviews for insert
  with check ((select auth.uid()) = user_id);


create table public.marketplace_listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  order_id uuid references public.marketplace_orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  body text,
  created_at timestamptz not null default timezone('utc', now())
);

create index marketplace_listing_reviews_listing_idx on public.marketplace_listing_reviews(listing_id);

alter table public.marketplace_listing_reviews enable row level security;

create policy "marketplace_listing_reviews_select_public"
  on public.marketplace_listing_reviews for select
  to anon, authenticated
  using (true);

create policy "marketplace_listing_reviews_insert_own"
  on public.marketplace_listing_reviews for insert
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Wishlists
-- ============================================================================

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  notify_price_drop boolean not null default false,
  notify_back_in_stock boolean not null default false,
  added_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create index wishlists_user_idx on public.wishlists(user_id);

alter table public.wishlists enable row level security;

create policy "wishlists_all_own"
  on public.wishlists for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Propuestas comunitarias
-- ============================================================================

create table public.product_proposals (
  id uuid primary key default gen_random_uuid(),
  proposed_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  reference_url text,
  photo_url text,
  category_id uuid references public.categories(id) on delete set null,
  my_quantity integer check (my_quantity is null or my_quantity > 0),
  max_price_cents_usd bigint check (max_price_cents_usd is null or max_price_cents_usd > 0),
  status public.proposal_status not null default 'abierta',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger product_proposals_updated_at
  before update on public.product_proposals
  for each row execute function public.handle_updated_at();

create index product_proposals_status_idx on public.product_proposals(status);

alter table public.product_proposals enable row level security;

create policy "product_proposals_select_public"
  on public.product_proposals for select
  to anon, authenticated
  using (status in ('abierta', 'en_revision', 'aprobada', 'convertida'));

create policy "product_proposals_insert_own"
  on public.product_proposals for insert
  with check ((select auth.uid()) = proposed_by);


create table public.product_proposal_interests (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.product_proposals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  max_price_cents_usd bigint check (max_price_cents_usd is null or max_price_cents_usd > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (proposal_id, user_id)
);

create index product_proposal_interests_proposal_idx on public.product_proposal_interests(proposal_id);

alter table public.product_proposal_interests enable row level security;

create policy "product_proposal_interests_select_public"
  on public.product_proposal_interests for select
  to anon, authenticated
  using (true);

create policy "product_proposal_interests_insert_own"
  on public.product_proposal_interests for insert
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Soporte y reclamos
-- ============================================================================

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  category text,
  body text not null,
  status public.ticket_status not null default 'abierto',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  satisfaction_rating smallint check (satisfaction_rating is null or satisfaction_rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.handle_updated_at();

create index support_tickets_user_idx on public.support_tickets(user_id);
create index support_tickets_status_idx on public.support_tickets(status);

alter table public.support_tickets enable row level security;

create policy "support_tickets_select_own"
  on public.support_tickets for select
  using ((select auth.uid()) = user_id);

create policy "support_tickets_insert_own"
  on public.support_tickets for insert
  with check ((select auth.uid()) = user_id);


create table public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  sent_at timestamptz not null default timezone('utc', now()),
  internal boolean not null default false
);

create index support_ticket_messages_ticket_idx on public.support_ticket_messages(ticket_id);

alter table public.support_ticket_messages enable row level security;

create policy "support_ticket_messages_select_via_ticket"
  on public.support_ticket_messages for select
  using (
    not internal
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = (select auth.uid())
    )
  );

create policy "support_ticket_messages_insert_own"
  on public.support_ticket_messages for insert
  with check ((select auth.uid()) = sender_id);


create table public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  item_reference text,
  type public.claim_type not null,
  description text not null,
  photos text[] not null default '{}',
  status public.claim_status not null default 'abierto',
  resolution text,
  refund_amount_cents_usd bigint check (refund_amount_cents_usd is null or refund_amount_cents_usd >= 0),
  resolution_notes text,
  resolved_at timestamptz,
  opened_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger claims_updated_at
  before update on public.claims
  for each row execute function public.handle_updated_at();

create index claims_user_idx on public.claims(user_id);
create index claims_status_idx on public.claims(status);

alter table public.claims enable row level security;

create policy "claims_select_own"
  on public.claims for select
  using ((select auth.uid()) = user_id);

create policy "claims_insert_own"
  on public.claims for insert
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Notificaciones
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  context_data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz not null default timezone('utc', now()),
  channel public.notification_channel not null default 'in_app'
);

create index notifications_user_unread_idx on public.notifications(user_id, sent_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_all_own"
  on public.notifications for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


create table public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  channels public.notification_channel[] not null default array['in_app']::public.notification_channel[],
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, notification_type)
);

create trigger notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.handle_updated_at();

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_all_own"
  on public.notification_preferences for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ============================================================================
-- Configuración y auditoría
-- ============================================================================

create table public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  value_type text,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null
);

create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.handle_updated_at();

alter table public.settings enable row level security;

-- Settings es solo lectura para usuarios autenticados (algunas claves
-- públicas se exponen al sitio). Escritura solo admins (vía service_role).
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

-- Seed inicial de settings
insert into public.settings (key, value, description, value_type) values
  ('default_currency', '"USD"'::jsonb, 'Moneda base del sistema', 'string'),
  ('exchange_rate_usd_uyu', '40.5'::jsonb, 'Tipo de cambio USD->UYU (manual)', 'number'),
  ('marketplace_commission_default_pct', '8'::jsonb, 'Comisión default del marketplace (%)', 'number'),
  ('campaign_commission_default_pct', '12'::jsonb, 'Comisión default sobre valor FOB (%)', 'number'),
  ('catalog_seller_min_payout_cents_usd', '2000'::jsonb, 'Monto mínimo para retirar comisión (USD 20)', 'number'),
  ('reseller_auto_threshold', '5'::jsonb, 'Unidades del mismo producto para auto-rol revendedor', 'number'),
  ('campaign_cancellation_hours_before_close', '72'::jsonb, 'Horas antes del cierre para cancelar', 'number'),
  ('campaign_balance_payment_business_days', '5'::jsonb, 'Días hábiles para pagar saldo tras cierre', 'number')
on conflict (key) do nothing;


create table public.admin_actions_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip_address text,
  performed_at timestamptz not null default timezone('utc', now())
);

create index admin_actions_log_admin_idx on public.admin_actions_log(admin_id);
create index admin_actions_log_performed_at_idx on public.admin_actions_log(performed_at desc);

alter table public.admin_actions_log enable row level security;
-- Solo admins ven el audit log.
create policy "admin_actions_log_select_admin"
  on public.admin_actions_log for select
  using (public.has_role((select auth.uid()), 'admin'));


-- ============================================================================
-- Campañas - actualizaciones de estado
-- ============================================================================

create table public.campaign_status_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  type public.campaign_update_type not null,
  description text not null,
  photo_url text,
  visible_to_users boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index campaign_status_updates_campaign_idx
  on public.campaign_status_updates(campaign_id, created_at desc);

alter table public.campaign_status_updates enable row level security;

create policy "campaign_status_updates_select_visible_public"
  on public.campaign_status_updates for select
  to anon, authenticated
  using (visible_to_users = true);
