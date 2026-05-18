-- ============================================================================
-- Función close_campaign — cierra una campaña aplicando reglas de §5 CLAUDE.md
-- ----------------------------------------------------------------------------
-- Reglas:
--   - Si reserved_quantity >= MOQ → status='cerrada_exitosa', se aplica el
--     mejor escalón alcanzado como precio final a TODAS las reservas activas.
--     Diferencia entre precio histórico y precio final se acredita en
--     user_credits + credit_movements (tipo ajuste_precio_campana).
--   - Si reserved_quantity < MOQ → status='cerrada_fallida', se cancelan
--     todas las reservas activas. La devolución de seña la dispara el
--     proceso de pagos (en otra capa).
--
-- Sólo admins pueden invocar esta función (chequeo interno con has_role).
-- ============================================================================

create or replace function public.close_campaign(p_campaign_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_check boolean;
  v_campaign campaigns%rowtype;
  v_reserved integer;
  v_final_tier campaign_pricing_tiers%rowtype;
  v_reservation campaign_reservations%rowtype;
  v_diff_cents bigint;
  v_total_adjusted_cents bigint := 0;
  v_adjusted_count integer := 0;
begin
  -- 1. Sólo admins pueden cerrar campañas.
  select public.has_role((select auth.uid()), 'admin') into v_admin_check;
  if not v_admin_check then
    raise exception 'forbidden: only admins can close campaigns';
  end if;

  -- 2. Lock optimista sobre la campaña.
  select * into v_campaign
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found then
    raise exception 'campaign not found: %', p_campaign_id;
  end if;

  if v_campaign.status <> 'activa' then
    raise exception 'campaign is not active (current status: %)', v_campaign.status;
  end if;

  -- 3. Total reservado (excluyendo canceladas).
  select coalesce(sum(quantity), 0)
  into v_reserved
  from public.campaign_reservations
  where campaign_id = p_campaign_id
    and status <> 'cancelada';

  -- 4a. Cierre fallido (no llegó al MOQ).
  if v_reserved < v_campaign.moq then
    update public.campaigns
    set status = 'cerrada_fallida',
        actually_closed_at = timezone('utc', now())
    where id = p_campaign_id;

    update public.campaign_reservations
    set status = 'cancelada',
        cancelled_at = timezone('utc', now()),
        cancellation_reason = 'Campaña no alcanzó MOQ'
    where campaign_id = p_campaign_id
      and status <> 'cancelada';

    return jsonb_build_object(
      'result', 'fallida',
      'reserved_quantity', v_reserved,
      'moq', v_campaign.moq
    );
  end if;

  -- 4b. Cierre exitoso. Buscar el mejor escalón alcanzado.
  select * into v_final_tier
  from public.campaign_pricing_tiers
  where campaign_id = p_campaign_id
    and v_reserved >= min_quantity
    and (max_quantity is null or v_reserved <= max_quantity)
  order by tier_number desc
  limit 1;

  if not found then
    -- Fallback al primer escalón si por alguna razón no matchea.
    select * into v_final_tier
    from public.campaign_pricing_tiers
    where campaign_id = p_campaign_id
    order by tier_number asc
    limit 1;
  end if;

  if not found then
    raise exception 'campaign has no pricing tiers: %', p_campaign_id;
  end if;

  -- 5. Para cada reserva activa, aplicar precio final.
  for v_reservation in
    select * from public.campaign_reservations
    where campaign_id = p_campaign_id
      and status <> 'cancelada'
  loop
    if v_reservation.unit_price_at_reservation_cents_usd
         > v_final_tier.unit_price_cents_usd
    then
      -- Ajuste retroactivo: se acredita la diferencia.
      v_diff_cents :=
        (v_reservation.unit_price_at_reservation_cents_usd
         - v_final_tier.unit_price_cents_usd)
        * v_reservation.quantity;

      update public.campaign_reservations
      set unit_price_at_reservation_cents_usd = v_final_tier.unit_price_cents_usd,
          status = 'confirmada'
      where id = v_reservation.id;

      insert into public.credit_movements (
        user_id, amount_cents_usd, type, reference_type, reference_id, description
      )
      values (
        v_reservation.user_id,
        v_diff_cents,
        'ajuste_precio_campana',
        'campaign_reservation',
        v_reservation.id,
        format(
          'Ajuste de precio campaña %s: USD %s por %s unidad(es)',
          v_campaign.slug,
          to_char(v_diff_cents / 100.0, 'FM999990.00'),
          v_reservation.quantity
        )
      );

      insert into public.user_credits (user_id, available_cents_usd)
      values (v_reservation.user_id, v_diff_cents)
      on conflict (user_id) do update
      set available_cents_usd = public.user_credits.available_cents_usd + excluded.available_cents_usd;

      v_total_adjusted_cents := v_total_adjusted_cents + v_diff_cents;
      v_adjusted_count := v_adjusted_count + 1;
    else
      -- Sin ajuste necesario.
      update public.campaign_reservations
      set status = 'confirmada'
      where id = v_reservation.id;
    end if;
  end loop;

  -- 6. Marcar la campaña como cerrada exitosa.
  update public.campaigns
  set status = 'cerrada_exitosa',
      actually_closed_at = timezone('utc', now())
  where id = p_campaign_id;

  return jsonb_build_object(
    'result', 'exitosa',
    'reserved_quantity', v_reserved,
    'final_tier_number', v_final_tier.tier_number,
    'final_unit_price_cents_usd', v_final_tier.unit_price_cents_usd,
    'adjusted_reservations', v_adjusted_count,
    'total_credit_issued_cents_usd', v_total_adjusted_cents
  );
end;
$$;

revoke execute on function public.close_campaign(uuid) from anon;
grant execute on function public.close_campaign(uuid) to authenticated;

comment on function public.close_campaign(uuid) is
  'Cierra una campaña activa. Sólo admins pueden invocarla. Si reserved >= moq, '
  'aplica precio retroactivo y acredita diferencias. Si reserved < moq, '
  'cancela todas las reservas activas. Devuelve un resumen JSON.';
