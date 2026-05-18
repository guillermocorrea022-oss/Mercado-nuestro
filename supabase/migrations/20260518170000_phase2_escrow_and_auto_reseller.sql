-- ============================================================================
-- Phase 2 follow-up: escrow marketplace + auto-revendedor + types DB extras
-- ----------------------------------------------------------------------------
-- 1) release_marketplace_escrow(order_id): suma neto al vendedor a
--    user_credits, registra credit_movement y suma a seller_profiles.total_sales.
--    Llamada desde el server action confirmDeliveryAction.
-- 2) auto_release_marketplace_escrow(): cron-like, marca como entregadas
--    todas las marketplace_orders despachada con shipped_at < now() - 3 days
--    (regla §5.6 del CLAUDE: si pasan 3 días sin reclamo, se libera).
--    Devuelve la lista de IDs liberadas.
-- 3) Trigger after_reservation_delivered: cuando reservation pasa a
--    'entregada' y quantity >= setting.reseller_auto_threshold, asigna rol
--    revendedor (regla §2.5).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. release_marketplace_escrow
-- ----------------------------------------------------------------------------

create or replace function public.release_marketplace_escrow(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order marketplace_orders%rowtype;
  v_product_name text;
begin
  select * into v_order
  from public.marketplace_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'order not found: %', p_order_id;
  end if;

  -- Si ya está entregada y liberada, no hacer nada (idempotente).
  if v_order.status not in ('entregada', 'despachada', 'pagada') then
    raise exception 'order is not in a deliverable state: %', v_order.status;
  end if;

  -- Marcar como entregada si todavía no.
  if v_order.status <> 'entregada' then
    update public.marketplace_orders
    set status = 'entregada',
        delivered_at = coalesce(delivered_at, timezone('utc', now()))
    where id = p_order_id;
  end if;

  -- ¿Ya existe un credit_movement para esta orden? Idempotencia.
  if exists (
    select 1 from public.credit_movements
    where reference_type = 'marketplace_order'
      and reference_id = p_order_id
  ) then
    return jsonb_build_object('result', 'already_released');
  end if;

  -- Nombre del producto para descripción.
  select p.name
  into v_product_name
  from public.marketplace_listings l
  join public.products p on p.id = l.product_id
  where l.id = v_order.listing_id
  limit 1;

  -- Insertar credit_movement.
  insert into public.credit_movements (
    user_id, amount_cents_usd, type, reference_type, reference_id, description
  )
  values (
    v_order.seller_id,
    v_order.seller_amount_cents_usd,
    'ajuste_manual',
    'marketplace_order',
    v_order.id,
    format('Liberación de escrow marketplace (%s)', coalesce(v_product_name, 'producto'))
  );

  -- Acreditar al vendedor (acumulativo).
  insert into public.user_credits (user_id, available_cents_usd)
  values (v_order.seller_id, v_order.seller_amount_cents_usd)
  on conflict (user_id) do update
  set available_cents_usd = public.user_credits.available_cents_usd
    + excluded.available_cents_usd;

  -- Incrementar total_sales del seller_profile (si existe).
  update public.seller_profiles
  set total_sales = total_sales + 1
  where user_id = v_order.seller_id;

  return jsonb_build_object(
    'result', 'released',
    'seller_id', v_order.seller_id,
    'amount_cents_usd', v_order.seller_amount_cents_usd
  );
end;
$$;

revoke execute on function public.release_marketplace_escrow(uuid) from anon;
grant execute on function public.release_marketplace_escrow(uuid) to authenticated;


-- ----------------------------------------------------------------------------
-- 2. auto_release_marketplace_escrow — liberación automática a 3 días
-- ----------------------------------------------------------------------------

create or replace function public.auto_release_marketplace_escrow()
returns table(order_id uuid, result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_check boolean;
  v_order_id uuid;
  v_result jsonb;
begin
  select public.has_role((select auth.uid()), 'admin') into v_admin_check;
  if not v_admin_check then
    raise exception 'forbidden: only admins can run auto-release';
  end if;

  for v_order_id in
    select id from public.marketplace_orders
    where status = 'despachada'
      and shipped_at is not null
      and shipped_at < timezone('utc', now()) - interval '3 days'
  loop
    begin
      v_result := public.release_marketplace_escrow(v_order_id);
      order_id := v_order_id;
      result := v_result->>'result';
      return next;
    exception when others then
      order_id := v_order_id;
      result := 'error';
      return next;
    end;
  end loop;
end;
$$;

revoke execute on function public.auto_release_marketplace_escrow() from anon;
grant execute on function public.auto_release_marketplace_escrow() to authenticated;


-- ----------------------------------------------------------------------------
-- 3. Trigger auto-revendedor (regla §2.5 del CLAUDE.md)
-- ----------------------------------------------------------------------------

create or replace function public.maybe_grant_reseller_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_threshold integer;
  v_threshold_raw jsonb;
begin
  -- Solo dispara cuando cambia a 'entregada'.
  if NEW.status <> 'entregada' or OLD.status = 'entregada' then
    return NEW;
  end if;

  -- Leer threshold desde settings.
  select value into v_threshold_raw
  from public.settings
  where key = 'reseller_auto_threshold';

  v_threshold := coalesce((v_threshold_raw)::int, 5);

  if NEW.quantity >= v_threshold then
    insert into public.user_roles (user_id, role, assigned_by, active)
    values (NEW.user_id, 'revendedor', NEW.user_id, true)
    on conflict (user_id, role) do nothing;

    -- Notificación in-app.
    insert into public.notifications (
      user_id, type, title, body, channel
    )
    values (
      NEW.user_id,
      'reseller_role_granted',
      'Ahora podés revender',
      format('Recibiste %s unidades. Ya podés publicar en el marketplace.', NEW.quantity),
      'in_app'
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_maybe_grant_reseller_role on public.campaign_reservations;
create trigger trg_maybe_grant_reseller_role
  after update of status on public.campaign_reservations
  for each row execute function public.maybe_grant_reseller_role();
