# Decisiones técnicas

> Registro vivo de decisiones tomadas durante el desarrollo. Cada entrada lleva fecha, contexto, opciones consideradas, decisión y motivo. La doc se referencia desde `CLAUDE.md` sección 6.

## 2026-05-18 — Dinero en bigint de centavos USD

**Contexto:** evitar errores de floating point en cálculos de precios escalonados, señas y créditos.
**Decisión:** todas las columnas monetarias son `bigint` en centavos USD. UYU se renderiza solo en visualización con el tipo de cambio guardado en `settings`.
**Motivo:** §15.4 del CLAUDE.md, regla taxativa.

## 2026-05-18 — Server Actions con archivos `state.ts` separados

**Contexto:** Next 16 obliga a que los archivos con `"use server"` exporten solo async functions.
**Decisión:** los `initialState` y los `type` van en archivos `state.ts` paralelos al `actions.ts`.
**Motivo:** mantener el patrón `useActionState` sin romper la convención de Next 16.

## 2026-05-18 — Migrar de `middleware.ts` a `src/proxy.ts`

**Contexto:** Next 16 deprecó `middleware.ts`.
**Decisión:** renombrar a `src/proxy.ts` con export `proxy`. Mantener el helper `updateSession` en `src/lib/supabase/middleware.ts`.
**Motivo:** la build muestra warning si seguimos con el nombre viejo y queremos quedar alineados con las convenciones futuras.

## 2026-05-18 — Stubs de Mercado Pago, Resend, Twilio

**Contexto:** todavía no hay credenciales reales.
**Decisión:** cada integración tiene un detector `HAS_REAL_*` que decide entre llamada real al SDK o un stub que loguea por consola. Para MP además existe `/checkout/mercadopago-stub` que simula el checkout completo y dispara el webhook handler como si MP hubiera respondido.
**Motivo:** poder validar el flujo end-to-end sin tocar dinero real ni APIs externas. Al llegar credenciales, los puntos de cambio son aislados (1 función por integración).

## 2026-05-18 — Verificación de cédula vía URL externa en Fase 0-2

**Contexto:** Supabase Storage requiere bucket + policies + signed URLs para subida segura.
**Decisión:** en Fase 0-2 aceptamos URL externa (Imgur / Drive / etc.) que el usuario pega en el formulario. Admin la abre en un tab nuevo.
**Motivo:** evitar la complejidad de buckets/policies hasta que tengamos los flujos finales decididos. En Fase 3 migramos a Supabase Storage con bucket privado.

## 2026-05-18 — Reembolsos al fallar MOQ con 5% bonus si se elige crédito

**Contexto:** regla §5.3 del CLAUDE.md.
**Decisión:** función SQL `refund_failed_campaign_reservation(reservation_id, mode)` con modo `cash` o `credit`. En `credit` agrega +5% como `bonus_campana_fallida` al `user_credits`.
**Motivo:** dar incentivo a quedarse en la plataforma sin obligar al usuario.

## 2026-05-18 — Cron via Vercel + service role + CRON_SECRET

**Contexto:** necesitamos correr `auto_close_expired_campaigns`, `auto_release_marketplace_escrow` y `process_monthly_seller_payouts` periódicamente.
**Decisión:** route handlers en `/api/cron/*` protegidos por `Authorization: Bearer ${CRON_SECRET}`. La llamada real al SQL se hace con `createAdminClient()` (service role). El `vercel.json` define los schedules.
**Motivo:** Vercel Crons son la forma más simple en este stack; el secret se rota en env vars si se filtra.

## 2026-05-18 — Carrito multi-item postergado a Fase 4 chico

**Contexto:** el MASTER §3.4 menciona un carrito que mezcla disponibles + reservas + marketplace.
**Decisión:** los checkouts directos (BuyInventoryForm, CampaignReserveForm, BuyListingForm) cubren el flujo MVP. El carrito multi-item se diseña como capa por encima cuando haya pedido real de usuarios.
**Motivo:** la complejidad agregada (estado cross-tipo, validación cross-stock, checkout unificado) no justifica el costo hasta confirmar uso. Se documenta como pendiente.
