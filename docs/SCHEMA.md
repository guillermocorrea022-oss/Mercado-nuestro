# Modelo de datos

> Tablas principales con columnas claves. Para definición exacta: `supabase/migrations/`.

## Usuarios

- **profiles** (1:1 con `auth.users`): email, first_name, last_name, phone, phone_verified_at, referral_code.
- **user_roles**: roles acumulables (comprador, vendedor_catalogo, revendedor, importador_avanzado, admin, admin_super, admin_operador_campanas, admin_atencion, admin_local).
- **user_addresses**: direcciones múltiples, una `is_primary`.
- **user_verifications**: cédula/rut/comprobante con `status` y `reviewed_by`.
- **phone_verification_codes**: códigos SMS con `expires_at` y `consumed_at`.
- **referrals**: `referrer_id`, `referred_user_id`, `status`, `reward_cents_usd`.

## Productos

- **categories** (árbol con parent_id).
- **products**: catálogo maestro con `attributes` JSONB.
- **product_variants**.

## Campañas

- **campaigns**: `moq`, `max_quantity`, `deposit_percentage`, `opens_at`, `closes_at`, `extended_once`, `status`.
- **campaign_pricing_tiers**: escalones con `min_quantity`, `max_quantity`, `unit_price_cents_usd`.
- **campaign_reservations**: status (activa, cancelada, confirmada, pagada_total, entregada), `attributed_seller_id`.
- **campaign_status_updates**: timeline visible al user.

## Inventario y pedidos

- **inventory_items**: stock disponible (`quantity_available`, `unit_price_cents_usd`).
- **orders** + **order_items** + **payments**: unificadas para todos los tipos.

## Marketplace

- **seller_profiles** (1:1, PK user_id): display_name, slug, rating_avg, total_sales.
- **marketplace_listings**: publicaciones de revendedores.
- **marketplace_orders**: con escrow (`buyer_id`, `seller_id`, `commission_cents_usd`, `seller_amount_cents_usd`).
- **marketplace_messages**: chat 1:1 por listing.
- **marketplace_listing_reviews**.

## Vendedores por catálogo

- **catalog_links** (slug-based atribución).
- **catalog_attributions**: cookie tracking.
- **catalog_sales**: comisiones con `commission_pct`, `commission_cents_usd`, status.
- **commission_payouts**: payouts mensuales con `period_month` único por seller.
- **commission_tiers**: escalones de bonus.

## Otros

- **wishlists**: lista de deseos.
- **reviews**: reseñas de producto.
- **claims**: reclamos con `appealed_at` y `appeal_reason` para apelación.
- **product_proposals** + **product_proposal_interests**.
- **user_credits**: saldo a favor.
- **credit_movements**: historial.
- **notifications**: in-app.
- **notification_preferences**: (user_id, notification_type) → channels array.
- **settings**: tipo de cambio, comisiones, umbrales.
- **admin_actions_log**: auditoría.

## Vistas

- **campaign_progress_view**: cantidad reservada, % MOQ, segundos al cierre.
- **user_stats_view**: reservas activas, marketplace orders, crédito, notifs sin leer.
- **seller_dashboard_view**: comisión pendiente, pagada, atribuciones pendientes.

## Funciones SQL

- `has_role(user_id, role)` — chequeo desde RLS.
- `close_campaign(id)` — cierre con ajuste de precios o cancelación.
- `pay_campaign_balance(reservation_id, method)` — paga el 70% restante.
- `refund_failed_campaign_reservation(reservation_id, mode)` — refund cash o credit + 5%.
- `extend_campaign(id, new_closes_at)` — solo si >= 85% MOQ y < 7 días.
- `appeal_claim(claim_id, reason)` — apelar una vez.
- `release_marketplace_escrow(order_id)` — libera fondos al revendedor.
- `auto_release_marketplace_escrow()` — admin/cron, libera órdenes despachadas hace 3+ días.
- `auto_close_expired_campaigns()` — cron, corre `close_campaign` sobre vencidas.
- `process_monthly_seller_payouts(min_amount_cents)` — genera payouts mensuales.
- `compute_seller_monthly_bonus_pct(seller_id, month_start)` — bonus por volumen.
- `reservation_balance_cents(id)` — calcula saldo pendiente.
- `purchase_inventory_item(item_id, qty, address_id, method)` — checkout atómico de stock.
- `generate_referral_code(user_id)` — interno para nuevos perfiles.
