-- ============================================================================
-- Phase 3 extras: sub-roles admin, verificación de teléfono, referidos.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Sub-roles admin (§2.3 del CLAUDE.md)
-- Agregamos los valores al enum user_role.
-- ----------------------------------------------------------------------------

alter type public.user_role add value if not exists 'admin_super';
alter type public.user_role add value if not exists 'admin_operador_campanas';
alter type public.user_role add value if not exists 'admin_atencion';
alter type public.user_role add value if not exists 'admin_local';


-- ----------------------------------------------------------------------------
-- 2. Verificación de teléfono (regla §10 CLAUDE.md)
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

-- Tabla de códigos SMS pendientes (no hay PII más allá del código).
create table if not exists public.phone_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists phone_verification_codes_user_idx
  on public.phone_verification_codes(user_id, created_at desc);

alter table public.phone_verification_codes enable row level security;

create policy "phone_verification_codes_select_own"
  on public.phone_verification_codes for select
  using ((select auth.uid()) = user_id);

create policy "phone_verification_codes_insert_own"
  on public.phone_verification_codes for insert
  with check ((select auth.uid()) = user_id);

create policy "phone_verification_codes_update_own"
  on public.phone_verification_codes for update
  using ((select auth.uid()) = user_id);


-- ----------------------------------------------------------------------------
-- 3. Programa de referidos (Fase 3)
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists referral_code text unique;

-- Genera código aleatorio para nuevos usuarios automáticamente.
create or replace function public.generate_referral_code(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  -- 8 chars aleatorios alfa-numéricos (sin caracteres ambiguos).
  v_code := upper(substr(replace(md5(random()::text || p_user_id::text), '0', 'X'), 1, 8));
  return v_code;
end;
$$;

-- Actualizar el trigger handle_new_user para que también genere referral_code.
-- (Solo replazamos la función; el trigger ya existe.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (new.id, new.email, public.generate_referral_code(new.id));

  insert into public.user_roles (user_id, role, assigned_by)
  values (new.id, 'comprador', new.id);

  return new;
end;
$$;

-- Backfill: usuarios existentes sin código reciben uno.
update public.profiles
set referral_code = public.generate_referral_code(id)
where referral_code is null;


create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete restrict,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pendiente',
  reward_cents_usd bigint not null default 0,
  consolidated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (referred_user_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals(referrer_id);

alter table public.referrals enable row level security;

create policy "referrals_select_own"
  on public.referrals for select
  using ((select auth.uid()) in (referrer_id, referred_user_id));

create policy "referrals_insert_own_referred"
  on public.referrals for insert
  with check ((select auth.uid()) = referred_user_id);
