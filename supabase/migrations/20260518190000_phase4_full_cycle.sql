-- ============================================================================
-- Phase 4 — Cierre del ciclo completo de Mercado Nuestro
--
-- Cubre:
--   1. Pago del saldo de campaña (70% al cerrar exitosa, regla §5.2)
--   2. Reembolso / crédito + 5% al fallar MOQ (regla §5.3)
--   3. Extensión de plazo (regla §5.4)
--   4. Apelación de reclamos (regla §5.8)
--   5. Comisiones escalonadas por volumen mensual (regla §5.7)
--   6. Cron-like: cierre automático de campañas vencidas
--   7. Cron-like: procesamiento mensual de payouts a vendedores catálogo
--   8. Vistas agregadas: user_stats_view, seller_dashboard_view
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Pago de saldo de campaña
-- Crea una payment row, marca la reserva como 'pagada_total'.
-- ----------------------------------------------------------------------------

create or replace function public.pay_campaign_balance(
  p_reservation_id uuid,
  p_method public.payment_method default 'mercado_pago'::public.payment_method
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_reservation record;
  v_paid_so_far bigint;
  v_total bigint;
  v_balance bigint;
  v_payment_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  select r.*, c.status as campaign_status
    into v_reservation
    from public.campaign_reservations r
    join public.campaigns c on c.id = r.campaign_id
   where r.id = p_reservation_id
   for update;

  if not found then
    raise exception 'Reserva no encontrada';
  end if;

  if v_reservation.user_id <> v_user_id then
    raise exception 'No es tu reserva';
  end if;

  if v_reservation.status = 'pagada_total' then
    return jsonb_build_object('ok', true, 'already_paid', true);
  end if;

  if v_reservation.campaign_status <> 'cerrada_exitosa' then
    raise exception 'La campaña no cerró exitosamente';
  end if;

  v_total := v_reservation.unit_price_at_reservation_cents_usd * v_reservation.quantity;

  select coalesce(sum(amount_cents), 0)
    into v_paid_so_far
    from public.payments
   where reservation_id = p_reservation_id
     and status = 'aprobado';

  v_balance := v_total - v_paid_so_far;

  if v_balance <= 0 then
    -- Ya pagó todo (puede pasar si el ajuste de precio cerró diferencias).
    update public.campaign_reservations
      set status = 'pagada_total'
      where id = p_reservation_id;
    return jsonb_build_object('ok', true, 'balance_cents', 0);
  end if;

  insert into public.payments (
    reservation_id, amount_cents, currency, method, status, processed_at
  ) values (
    p_reservation_id, v_balance, 'USD', p_method, 'aprobado', now()
  ) returning id into v_payment_id;

  update public.campaign_reservations
    set status = 'pagada_total'
    where id = p_reservation_id;

  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'campaign_balance_paid',
    'Pago de saldo confirmado',
    'Recibimos el saldo de tu reserva. Te avisamos cuando esté lista para entrega.'
  );

  return jsonb_build_object(
    'ok', true,
    'payment_id', v_payment_id,
    'amount_cents', v_balance
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- 2. Reembolso de seña al fallar MOQ (regla §5.3)
-- Modo 'cash' = reembolso al método original (placeholder: pasa a 'reembolsado').
-- Modo 'credit' = saldo a favor + 5% bonus.
-- ----------------------------------------------------------------------------

create or replace function public.refund_failed_campaign_reservation(
  p_reservation_id uuid,
  p_mode text default 'cash'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_reservation record;
  v_deposit bigint;
  v_bonus bigint := 0;
  v_total_credit bigint;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if p_mode not in ('cash', 'credit') then
    raise exception 'Modo invalido: usa cash o credit';
  end if;

  select r.*, c.status as campaign_status
    into v_reservation
    from public.campaign_reservations r
    join public.campaigns c on c.id = r.campaign_id
   where r.id = p_reservation_id
   for update;

  if not found then
    raise exception 'Reserva no encontrada';
  end if;

  if v_reservation.user_id <> v_user_id then
    raise exception 'No es tu reserva';
  end if;

  if v_reservation.campaign_status <> 'cerrada_fallida' then
    raise exception 'La campaña no fallo';
  end if;

  select coalesce(sum(amount_cents), 0)
    into v_deposit
    from public.payments
   where reservation_id = p_reservation_id
     and status = 'aprobado';

  if v_deposit <= 0 then
    -- Nada que reembolsar.
    update public.campaign_reservations
      set status = 'cancelada',
          cancellation_reason = 'campaña no llegó al MOQ'
      where id = p_reservation_id
        and status <> 'cancelada';
    return jsonb_build_object('ok', true, 'refunded_cents', 0);
  end if;

  if p_mode = 'cash' then
    -- Marcamos payments como reembolsadas. El reembolso real al método
    -- original lo dispara el admin con MP (Fase 3 lo automatiza).
    update public.payments
      set status = 'reembolsado',
          updated_at = now()
      where reservation_id = p_reservation_id
        and status = 'aprobado';

    update public.campaign_reservations
      set status = 'cancelada',
          cancellation_reason = 'reembolso por MOQ no alcanzado'
      where id = p_reservation_id;

    insert into public.notifications (user_id, type, title, body)
    values (
      v_user_id,
      'campaign_failed_refund',
      'Reembolso en proceso',
      'La campaña no llegó al MOQ. Estamos procesando el reembolso de tu seña al método de pago original.'
    );

    return jsonb_build_object('ok', true, 'mode', 'cash', 'refunded_cents', v_deposit);
  end if;

  -- Modo credit + 5% bonus.
  v_bonus := floor(v_deposit * 0.05);
  v_total_credit := v_deposit + v_bonus;

  insert into public.user_credits (user_id, available_cents_usd)
  values (v_user_id, v_total_credit)
  on conflict (user_id) do update
    set available_cents_usd = public.user_credits.available_cents_usd + excluded.available_cents_usd;

  insert into public.credit_movements (
    user_id, type, amount_cents_usd,
    reference_type, reference_id, description
  ) values (
    v_user_id, 'devolucion_sena_campana_fallida', v_deposit,
    'campaign_reservation', p_reservation_id,
    'Devolucion de seña como crédito en cuenta'
  );

  insert into public.credit_movements (
    user_id, type, amount_cents_usd,
    reference_type, reference_id, description
  ) values (
    v_user_id, 'bonus_campana_fallida', v_bonus,
    'campaign_reservation', p_reservation_id,
    'Bonus 5% por elegir crédito en cuenta'
  );

  update public.payments
    set status = 'reembolsado', updated_at = now()
    where reservation_id = p_reservation_id and status = 'aprobado';

  update public.campaign_reservations
    set status = 'cancelada',
        cancellation_reason = 'credito en cuenta por MOQ no alcanzado'
    where id = p_reservation_id;

  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'campaign_failed_credit',
    'Crédito acreditado',
    'Te acreditamos la seña + 5% como saldo a favor.'
  );

  return jsonb_build_object(
    'ok', true,
    'mode', 'credit',
    'credit_cents', v_total_credit,
    'bonus_cents', v_bonus
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- 3. Extensión de plazo de campaña (regla §5.4)
-- Solo admin, una vez, si >= 85% del MOQ y faltan < 7 días.
-- ----------------------------------------------------------------------------

create or replace function public.extend_campaign(
  p_campaign_id uuid,
  p_new_closes_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_campaign record;
  v_reserved integer;
  v_pct numeric;
  v_seconds_left numeric;
  v_extension_seconds numeric;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if not public.has_role(v_user_id, 'admin') then
    raise exception 'Solo admin';
  end if;

  select * into v_campaign
    from public.campaigns
   where id = p_campaign_id
   for update;

  if not found then
    raise exception 'Campaña no encontrada';
  end if;

  if v_campaign.status <> 'activa' then
    raise exception 'Solo se pueden extender campañas activas';
  end if;

  if v_campaign.extended_once then
    raise exception 'La campaña ya fue extendida una vez';
  end if;

  if p_new_closes_at <= v_campaign.closes_at then
    raise exception 'La nueva fecha debe ser posterior a la actual';
  end if;

  v_extension_seconds := extract(epoch from (p_new_closes_at - v_campaign.closes_at));
  if v_extension_seconds > 7 * 86400 then
    raise exception 'La extensión maxima es de 7 dias';
  end if;

  select coalesce(sum(quantity), 0)
    into v_reserved
    from public.campaign_reservations
   where campaign_id = p_campaign_id
     and status <> 'cancelada';

  v_pct := (v_reserved::numeric / v_campaign.moq::numeric) * 100;
  if v_pct < 85 then
    raise exception 'La campaña esta en %.1f%% del MOQ; se requiere >= 85%%', v_pct;
  end if;

  v_seconds_left := extract(epoch from (v_campaign.closes_at - now()));
  if v_seconds_left > 7 * 86400 then
    raise exception 'Solo se puede extender en los ultimos 7 dias';
  end if;

  update public.campaigns
    set closes_at = p_new_closes_at,
        extended_once = true
    where id = p_campaign_id;

  insert into public.campaign_status_updates (
    campaign_id, type, description, created_by
  ) values (
    p_campaign_id,
    'mensaje_general',
    'Extendimos el plazo de cierre. Estamos muy cerca del objetivo.',
    v_user_id
  );

  -- Notificación a participantes.
  insert into public.notifications (user_id, type, title, body)
  select distinct user_id,
         'campaign_extended',
         'Extendimos la campaña',
         'La campaña en la que reservaste se extendió. Compartí con amigos para llegar al MOQ.'
    from public.campaign_reservations
   where campaign_id = p_campaign_id
     and status <> 'cancelada';

  insert into public.admin_actions_log (admin_id, action, entity_type, entity_id, after_state)
  values (
    v_user_id, 'extend_campaign', 'campaign', p_campaign_id,
    jsonb_build_object('new_closes_at', p_new_closes_at)
  );

  return jsonb_build_object(
    'ok', true,
    'new_closes_at', p_new_closes_at,
    'reserved_pct', v_pct
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- 4. Apelación de reclamos (regla §5.8 — UNA vez)
-- ----------------------------------------------------------------------------

alter table public.claims
  add column if not exists appealed_at timestamptz,
  add column if not exists appeal_reason text;

create or replace function public.appeal_claim(
  p_claim_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_claim record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if length(coalesce(p_reason, '')) < 10 then
    raise exception 'Contanos al menos 10 caracteres por que apelas';
  end if;

  select * into v_claim
    from public.claims
   where id = p_claim_id
   for update;

  if not found then
    raise exception 'Reclamo no encontrado';
  end if;

  if v_claim.user_id <> v_user_id then
    raise exception 'No es tu reclamo';
  end if;

  if v_claim.appealed_at is not null then
    raise exception 'Ya apelaste una vez este reclamo';
  end if;

  if v_claim.status not in ('resuelto_a_favor_vendedor', 'cerrado') then
    raise exception 'Solo se puede apelar un reclamo ya resuelto';
  end if;

  update public.claims
    set appealed_at = now(),
        appeal_reason = p_reason,
        status = 'apelado',
        updated_at = now()
    where id = p_claim_id;

  return jsonb_build_object('ok', true);
end;
$$;


-- ----------------------------------------------------------------------------
-- 5. Comisiones escalonadas por volumen mensual (regla §5.7)
-- ----------------------------------------------------------------------------

create or replace function public.compute_seller_monthly_bonus_pct(
  p_seller_id uuid,
  p_month_start timestamptz
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_volume_cents bigint;
  v_volume_usd numeric;
begin
  select coalesce(sum(attributable_cents_usd), 0)
    into v_volume_cents
    from public.catalog_sales
   where seller_id = p_seller_id
     and status in ('consolidada', 'pagada')
     and created_at >= p_month_start
     and created_at < p_month_start + interval '1 month';

  v_volume_usd := v_volume_cents::numeric / 100;

  if v_volume_usd >= 3000 then return 5;
  elsif v_volume_usd >= 1500 then return 3;
  elsif v_volume_usd >= 500 then return 2;
  else return 0;
  end if;
end;
$$;


-- ----------------------------------------------------------------------------
-- 6. Cron-like: cierre automatico de campañas vencidas
-- Llamable por endpoint de cron con SUPABASE_SERVICE_ROLE_KEY.
-- ----------------------------------------------------------------------------

create or replace function public.auto_close_expired_campaigns()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign record;
  v_count integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_result jsonb;
begin
  for v_campaign in
    select id from public.campaigns
     where status = 'activa'
       and closes_at < now()
  loop
    v_result := public.close_campaign(v_campaign.id);
    v_results := v_results || jsonb_build_object('campaign_id', v_campaign.id, 'result', v_result);
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('closed', v_count, 'results', v_results);
end;
$$;


-- ----------------------------------------------------------------------------
-- 7. Cron-like: procesamiento mensual de payouts a vendedores catálogo
-- Genera commission_payouts en estado 'solicitado' para cada vendedor que
-- tenga >= 20 USD en comisiones consolidadas sin pagar.
-- ----------------------------------------------------------------------------

create or replace function public.process_monthly_seller_payouts(
  p_min_amount_cents bigint default 2000
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_seller record;
  v_count integer := 0;
  v_total bigint := 0;
begin
  v_user_id := auth.uid();
  -- Permitir desde cron (sin auth.uid) o desde admin autenticado.
  if v_user_id is not null and not public.has_role(v_user_id, 'admin') then
    raise exception 'Solo admin';
  end if;

  for v_seller in
    select sp.user_id,
           coalesce(sum(cs.commission_cents_usd), 0) as pending
      from public.seller_profiles sp
      left join public.catalog_sales cs
        on cs.seller_id = sp.user_id and cs.status = 'consolidada'
     group by sp.user_id
    having coalesce(sum(cs.commission_cents_usd), 0) >= p_min_amount_cents
  loop
    insert into public.commission_payouts (
      seller_id, period_month, total_cents_usd, status, requested_at
    ) values (
      v_seller.user_id,
      date_trunc('month', now())::date,
      v_seller.pending,
      'solicitado',
      now()
    )
    on conflict (seller_id, period_month) do update
      set total_cents_usd = excluded.total_cents_usd,
          status = excluded.status,
          requested_at = excluded.requested_at;

    update public.catalog_sales
      set status = 'pagada', paid_at = now(), updated_at = now()
      where seller_id = v_seller.user_id
        and status = 'consolidada';

    insert into public.notifications (user_id, type, title, body)
    values (
      v_seller.user_id,
      'commission_payout_requested',
      'Pago de comisiones programado',
      'Vamos a transferirte tu comisión consolidada en los próximos 5 días hábiles.'
    );

    v_count := v_count + 1;
    v_total := v_total + v_seller.pending;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'payouts_created', v_count,
    'total_cents', v_total
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- 8. Vistas agregadas
-- ----------------------------------------------------------------------------

create or replace view public.user_stats_view
with (security_invoker = true)
as
select
  p.id as user_id,
  p.email,
  (select count(*) from public.campaign_reservations cr
     where cr.user_id = p.id and cr.status <> 'cancelada') as active_reservations,
  (select count(*) from public.marketplace_orders mo
     where mo.buyer_id = p.id) as marketplace_orders,
  (select coalesce(available_cents_usd, 0) from public.user_credits uc
     where uc.user_id = p.id) as credit_cents_usd,
  (select count(*) from public.notifications n
     where n.user_id = p.id and n.read_at is null) as unread_notifications
from public.profiles p;


create or replace view public.seller_dashboard_view
with (security_invoker = true)
as
select
  sp.user_id as seller_id,
  sp.user_id,
  sp.display_name,
  sp.slug,
  sp.total_sales,
  sp.rating_avg,
  (select coalesce(sum(commission_cents_usd), 0) from public.catalog_sales cs
     where cs.seller_id = sp.user_id and cs.status = 'consolidada') as pending_commission_cents,
  (select coalesce(sum(commission_cents_usd), 0) from public.catalog_sales cs
     where cs.seller_id = sp.user_id and cs.status = 'pagada') as paid_commission_cents,
  (select count(*) from public.catalog_sales cs
     where cs.seller_id = sp.user_id and cs.status = 'pendiente') as pending_attributions
from public.seller_profiles sp;


-- ----------------------------------------------------------------------------
-- 9. Saldo pendiente: helper para mostrar "te falta pagar X"
-- ----------------------------------------------------------------------------

create or replace function public.reservation_balance_cents(p_reservation_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total bigint;
  v_paid bigint;
begin
  select unit_price_at_reservation_cents_usd * quantity
    into v_total
    from public.campaign_reservations
   where id = p_reservation_id;

  select coalesce(sum(amount_cents), 0)
    into v_paid
    from public.payments
   where reservation_id = p_reservation_id
     and status = 'aprobado';

  return greatest(0, v_total - v_paid);
end;
$$;


-- ----------------------------------------------------------------------------
-- 10. Compra de stock disponible: helper transaccional
-- ----------------------------------------------------------------------------

create or replace function public.purchase_inventory_item(
  p_item_id uuid,
  p_quantity integer,
  p_shipping_address_id uuid,
  p_method public.payment_method default 'mercado_pago'::public.payment_method
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_item record;
  v_order_id uuid;
  v_total bigint;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if p_quantity <= 0 then
    raise exception 'Cantidad invalida';
  end if;

  select * into v_item
    from public.inventory_items
   where id = p_item_id
   for update;

  if not found then
    raise exception 'Producto no encontrado';
  end if;

  if not v_item.active or v_item.quantity_available < p_quantity then
    raise exception 'Sin stock suficiente';
  end if;

  v_total := v_item.unit_price_cents_usd * p_quantity;

  insert into public.orders (
    user_id, total_cents_usd, status, shipping_address_id
  ) values (
    v_user_id, v_total, 'pagada', p_shipping_address_id
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, item_type, reference_id, quantity,
    unit_price_cents_usd, subtotal_cents_usd
  ) values (
    v_order_id, 'inventory_item', p_item_id, p_quantity,
    v_item.unit_price_cents_usd, v_total
  );

  insert into public.payments (
    order_id, amount_cents, currency, method, status, processed_at
  ) values (
    v_order_id, v_total, 'USD', p_method, 'aprobado', now()
  );

  update public.inventory_items
    set quantity_available = quantity_available - p_quantity
    where id = p_item_id;

  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'inventory_order_paid',
    'Compra confirmada',
    'Tu pedido está pagado. Te avisamos cuando salga del depósito.'
  );

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'total_cents', v_total);
end;
$$;
