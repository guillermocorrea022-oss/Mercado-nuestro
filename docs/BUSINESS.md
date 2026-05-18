# Reglas de negocio detalladas

> Apunta al MASTER (Bloque 7) y al CLAUDE.md (§5). Este doc resume lo aplicado a código para consulta rápida.

## Campañas

- MOQ definido por el admin al crear.
- Escalones de precio fijados al crear.
- Al cerrar exitosa: precio retroactivo del mejor escalón alcanzado → función SQL `close_campaign`.
- Seña: 30% por defecto (configurable por campaña).
- Saldo restante: 5 días hábiles desde el cierre → función SQL `pay_campaign_balance`.
- Cancelación: hasta 72hs antes del cierre, devolución al método original.
- Extensión: una vez si >= 85% MOQ y faltan menos de 7 días, máximo 7 días → función SQL `extend_campaign`.
- Si falla MOQ: refund (cash o credit + 5% bonus) → función SQL `refund_failed_campaign_reservation`.

## Marketplace

- Solo revendedores publican (rol `revendedor`).
- Pago vía plataforma (escrow). Liberación al confirmar entrega o a los 3 días desde despacho → función SQL `release_marketplace_escrow`.
- Reseñas mutuas (comprador → vendedor).
- Plazo despacho: 3 días hábiles. Si pasan 7 sin despacho, se cancela y reembolsa.

## Vendedores por catálogo

- Cookie de atribución `mn_seller`, 30 días.
- Comisión consolida al confirmar entrega del pedido atribuido.
- Bonus mensual por volumen:
  - USD 501-1500 → +2%
  - USD 1501-3000 → +3%
  - >USD 3000 → +5%
- Mínimo de retiro: USD 20 (configurable).
- Payouts mensuales → función SQL `process_monthly_seller_payouts`, idealmente día 1 a las 10:00.

## Reclamos

- Plazo: 7 días corridos desde entrega.
- Resolución admin en hasta 5 días hábiles.
- Apelación UNA vez → función SQL `appeal_claim`.

## Verificaciones de identidad

- Comprador: email + teléfono antes del primer pago.
- Vendedor catálogo / revendedor: cédula aprobada antes del primer cobro / despacho.
- Importador avanzado: Fase 3, incluye RUT.

## Auto-promociones

- Al recibir 5+ unidades del mismo producto en una campaña → rol `revendedor` automático (umbral `settings.reseller_auto_threshold`).

## Auditoría

- Toda acción admin sensible se loguea en `admin_actions_log`.
