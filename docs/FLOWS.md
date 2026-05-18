# Flujos de usuario

> Referencia rápida. Versión completa en MASTER §3.

## Reservar en una campaña

1. Usuario navega `/campanas/[slug]`.
2. Elige cantidad → `CampaignReserveForm` calcula escalón + seña dinámicamente.
3. Si no está logueado, redirige a `/login?next=/campanas/[slug]?reservar=N`.
4. `createReservationAction` valida cupo y crea `campaign_reservations` status `activa`.
5. Si llegó por cookie `mn_seller`, registra `catalog_sales` pendiente.
6. Notifica al user (in_app + email stub).
7. Redirige a `/campanas/[slug]/reservada`.

## Cerrar campaña (admin)

1. Admin click "Cerrar campaña" en `/admin/campanas`.
2. RPC `close_campaign(id)`:
   - Si `reserved >= moq` → `cerrada_exitosa`, aplica precio mejor escalón, genera `credit_movements`.
   - Si no → `cerrada_fallida`, cancela reservas.
3. Notifica a participantes (saldo o refund).

## Pagar saldo (regla §5.2)

1. Usuario ve `/mis-reservas`.
2. Para reservas de campañas `cerrada_exitosa`, aparece `PayBalanceButton`.
3. `payCampaignBalanceAction` llama RPC `pay_campaign_balance`.
4. Crea `payment` aprobado y marca reserva `pagada_total`.

## Refund por MOQ no alcanzado (regla §5.3)

1. Usuario ve `/mis-reservas`.
2. Para campañas `cerrada_fallida` aparecen 2 botones: cash o credit + 5%.
3. `refundFailedCampaignAction` llama RPC `refund_failed_campaign_reservation`.

## Comprar stock disponible

1. `/disponible` → click producto → `/producto/[slug]`.
2. `BuyInventoryForm` (Server Component pasa addresses, RPC hace todo atómico).
3. RPC `purchase_inventory_item` crea `orders` + `order_items` + `payment` + reduce stock.
4. Redirige a `/pedidos/[id]?nuevo=1`.

## Marketplace

- Publicación: `/perfil/revendedor` → form `createListingAction`.
- Compra: `/marketplace/[id]` → `BuyListingForm` → `createMarketplaceOrderAction`.
- Despacho: revendedor marca despachada en `/perfil/revendedor`.
- Confirmar entrega: buyer en `/perfil/mis-compras` → RPC `release_marketplace_escrow`.
- Auto-release a los 3 días: cron `/api/cron/release-escrow`.

## Catálogo de vendedor

- URL `/v/[slug]` setea cookie `mn_seller` y redirige a `/vendedor/[slug]`.
- Cualquier reserva o compra mientras la cookie viva (30 días) se atribuye.

## Reclamos + apelación

1. `/perfil/reclamos` → form abre `claims` status `abierto`.
2. Admin resuelve en `/admin/reclamos` con `resolveClaimAction`.
3. Si el comprador no está conforme: `AppealClaimButton` → RPC `appeal_claim` (una sola vez).

## Verificación de identidad

1. `/perfil/verificacion-identidad` → form acepta URL externa al documento.
2. Admin revisa en `/admin/verificaciones` y aprueba/rechaza con `reviewVerificationAction`.

## Comisiones

1. Cron mensual `/api/cron/process-payouts` corre RPC `process_monthly_seller_payouts`.
2. Genera `commission_payouts` status `solicitado`.
3. Admin paga en `/admin/comisiones` y marca con `MarkPayoutPaidButton`.
