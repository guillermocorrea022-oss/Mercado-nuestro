# CLAUDE.md — Mercado Nuestro

> Este archivo es el contexto maestro del proyecto Mercado Nuestro. Claude Code lo lee al iniciar cada sesión. Si llegás acá por primera vez, leé este archivo completo antes de hacer cualquier cosa. Si ya lo leíste en una sesión anterior, releelo igual porque puede haber cambiado.

---

## 1. Qué es Mercado Nuestro

Mercado Nuestro es una plataforma web uruguaya de comercio colaborativo que combina cuatro modelos de negocio en una sola aplicación:

1. **Importación grupal:** los usuarios se suman a campañas para importar productos desde el exterior (principalmente China) a precios mayoristas. Cuantas más unidades se reservan, mejor es el precio para todos.
2. **Marketplace de reventa:** usuarios que importaron para revender publican su stock dentro de la misma plataforma.
3. **Venta directa de stock disponible:** productos físicamente en el local de Paysandú o en depósito, para entrega rápida.
4. **Red de vendedores por catálogo:** personas que comparten un catálogo digital personalizado y cobran comisión por las ventas que generan.

El objetivo es democratizar el acceso a precios de importación al por mayor que hoy solo tienen las grandes empresas, permitiendo que personas comunes y pequeños comerciantes uruguayos se beneficien del modelo.

La plataforma opera bajo el nombre comercial **Mercado Nuestro** con local físico en Leandro Gómez 1076, Paysandú, Uruguay. Operación inicial solo en Uruguay.

---

## 2. Estado actual del proyecto

> **IMPORTANTE: esta sección se actualiza constantemente. Antes de empezar a trabajar, revisá qué está hecho y qué no.**

**Fase actual:** Fase 0 — Preparación · Cimientos técnicos en curso (Semana 3 del plan en bloque 9 del MASTER).

**Funcionalidades implementadas:**

- Proyecto Next.js 16.2.6 inicializado con TypeScript estricto, Tailwind CSS v4, App Router, Turbopack y ESLint.
- Estructura de carpetas armada según sección 7:
  - `src/app/` con grupos de rutas `(public)`, `(auth)`, `(user)`, `(revendedor)`, `admin`, `api`.
  - `src/components/` con subcarpetas `ui`, `campanas`, `productos`, `marketplace`, `usuario`, `admin`.
  - `src/lib/` con subcarpetas `supabase`, `mercadopago`, `email`, `notifications`, `validations`, `constants` y archivo `utils.ts` (helper `cn` de shadcn).
  - `src/hooks/`, `src/types/`.
  - `supabase/migrations/`, `docs/`, `.github/workflows/`.
- shadcn/ui inicializado (preset `base-nova`, base color `neutral`, icon library Lucide, CSS variables habilitadas). Primer componente `Button` instalado en `src/components/ui/button.tsx`. Config en `components.json` (raíz).
- `MASTER.md` movido a `/docs/MASTER.md`.
- `.env.example` creado en raíz con todas las variables de la sección 16.
- `.gitignore` ajustado para excluir `.env*` pero permitir `.env.example` versionado, y para excluir `.claude/` (settings locales).
- `AGENTS.md` (generado por Next.js) preservado en raíz — advertencia oficial de Next 16 sobre breaking changes vs versiones anteriores.
- **Git inicializado** en raíz (rama `main`, sin remote todavía). Dos commits hechos:
  1. `chore: inicializar proyecto Next.js 16 con TS, Tailwind v4 y shadcn/ui`
  2. `feat(supabase): clientes SSR + migración inicial con tablas troncales`
- **Supabase configurado para SSR** con `@supabase/ssr` 0.10.3:
  - `src/lib/supabase/client.ts` (Client Components)
  - `src/lib/supabase/server.ts` (Server Components / Actions / Route Handlers, con cookies asíncronas)
  - `src/lib/supabase/middleware.ts` (helper `updateSession` para refrescar tokens)
  - `src/proxy.ts` — convención nueva de Next 16 (antes `middleware.ts`, ahora deprecado). Invoca el refresh de sesión en cada request, con matcher que excluye `_next/static`, `_next/image` y assets.
  - `src/types/database.ts` como stub hasta generar tipos con el CLI de Supabase.
- **Primera migración SQL** en `supabase/migrations/20260518120000_initial_schema.sql` con:
  - Helper `handle_updated_at()` para mantener `updated_at` en todas las tablas.
  - Enums: `user_role`, `user_status`, `verification_type`, `verification_status`, `campaign_status`, `reservation_status`.
  - Tablas: `profiles` (1:1 con `auth.users`), `user_roles` (acumulables), `user_addresses`, `user_verifications`, `categories`, `products`, `product_variants`, `campaigns`, `campaign_pricing_tiers`, `campaign_reservations`.
  - Trigger `on_auth_user_created` que crea `profile` + asigna rol `comprador` automáticamente al registrarse.
  - Función `has_role(user, role)` para usar en políticas RLS futuras (SECURITY DEFINER).
  - Vista `campaign_progress_view` con cantidad reservada, % al MOQ y segundos hasta cierre.
  - **RLS habilitado en todas las tablas con políticas base** (lectura propia, escritura propia, lectura pública para catálogo/categorías/campañas visibles).
  - Dinero almacenado como `bigint` en centavos USD (jamás floats), según §15 punto 4.
- Dependencias instaladas: `@supabase/ssr`, `@supabase/supabase-js`, `zod`.
- Build de producción pasa sin warnings (incluyendo el de `middleware.ts` deprecado, resuelto al renombrar a `proxy.ts`).
- Dev server arranca en ~1.5s en `http://localhost:3000`.

- **Auth completo con Supabase email/password** (semana 5-6 del plan, parcial):
  - Server Actions con Zod en [src/app/(auth)/actions.ts](src/app/(auth)/actions.ts): `signUpAction`, `signInAction`, `signOutAction`, `requestPasswordResetAction`, `updatePasswordAction`. Mensajes de error traducidos al español rioplatense.
  - Pantallas bajo grupo `(auth)/` con layout minimal (solo logo): `/registro`, `/registro/verifica-email`, `/login`, `/recuperar-password`, `/actualizar-password`. Forms con `useActionState` + `useFormStatus` para feedback inline.
  - Route handler [auth/callback/route.ts](src/app/auth/callback/route.ts) que intercambia el `code` del email de confirmación o reset por sesión y respeta `next` (validando que sea path interno).
  - [Header](src/components/layout/Header.tsx) ahora es Server Component async, lee sesión y muestra **"Mi cuenta" + "Salir"** cuando hay user o **"Entrar / Crear cuenta"** si no. SignOut es un form que llama a la Server Action.
  - Grupo `(user)/` con [layout que redirige a /login](src/app/(user)/layout.tsx) si no hay sesión.
  - Página [/perfil](src/app/(user)/perfil/page.tsx) con datos del user + roles activos (badges con label en español).
  - Componentes UI nuevos de shadcn: `Input`, `Label`, `Card`.
  - Schemas Zod en [src/lib/validations/auth.ts](src/lib/validations/auth.ts) con mensajes amables.
- **Bucle de reserva end-to-end conectado**:
  - Server Action [createReservationAction](src/app/(public)/campanas/actions.ts) valida sesión (redirige a `/login?next=...` si no), campaña activa, cupo disponible (`max_quantity - reserved >= quantity`), calcula escalón vigente y seña según `deposit_percentage`, inserta en `campaign_reservations` con status `activa`.
  - [CampaignReserveForm](src/components/campanas/CampaignReserveForm.tsx) usa `useActionState` con la Server Action en lugar de `window.location`. Hidden inputs propagan `campaignId`, `campaignSlug`, `quantity`.
  - Página [/campanas/[slug]/reservada](src/app/(public)/campanas/[slug]/reservada/page.tsx) muestra confirmación con resumen (cantidad, precio referencia, seña pendiente) y mensaje "estamos terminando de conectar Mercado Pago".
  - Página [/mis-reservas](src/app/(user)/mis-reservas/page.tsx) lista todas las reservas del user con estado, countdown, totales y seña pendiente. Empty state si no hay ninguna.
  - Schemas Zod en [src/lib/validations/reservations.ts](src/lib/validations/reservations.ts).
- **Fix técnico en tipos**: agregado `Relationships: []` a cada tabla y vista en `src/types/database.ts` para que `supabase-js` infiera correctamente tipos de queries con joins, inserts y updates. Sin esto, todo terminaba inferido como `never`.
- **Patrón Server Actions Next 16**: archivos con `"use server"` solo pueden exportar funciones async; los `initialState` y types se movieron a archivos separados (`src/app/(auth)/state.ts`, `src/app/(public)/campanas/reserve-state.ts`).
- **Data demo en la DB**: seed idempotente en [supabase/seed.sql](supabase/seed.sql) (DO block PL/pgSQL) crea usuario admin `admin@mercadonuestro.uy` (password temporal `Admin_MN_2026!Temp`, no usar para login real), 4 categorías raíz, producto "Cámara IP WiFi 1080P interior/exterior" y campaña "Primera tanda 2026" con 3 escalones (USD 25 / USD 18 / USD 14), MOQ 30, max 150 unidades, cierre a 14 días, llegada estimada a 60 días. Aplicado al cloud vía SQL Editor.
- **Detalle de campaña** [/campanas/[slug]](src/app/(public)/campanas/[slug]/page.tsx) — la pantalla más crítica del MVP según §6.2 del MASTER:
  - Server Component que hace dos queries: `campaigns` con join a `products` y `campaign_pricing_tiers`, y `campaign_progress_view` por separado.
  - Galería con `next/image` (placeholders de `placehold.co` por ahora, agregado a `remotePatterns` en `next.config.ts`).
  - Header con título, descripción de la campaña, brand + nombre del producto.
  - Grid de **escalones de precio con checkmark** en los desbloqueados.
  - **Características del producto** desde el JSON `attributes` del producto (Object.entries → grid de dt/dd).
  - Descripción larga del producto y bloque de política de devolución.
  - Sidebar sticky con barra de progreso al MOQ + countdown + fecha estimada de llegada, y el formulario de reserva.
  - 404 vía `notFound()` si el slug no existe.
- **CampaignReserveForm** [src/components/campanas/CampaignReserveForm.tsx](src/components/campanas/CampaignReserveForm.tsx) (Client Component):
  - Selector de cantidad con +/- y bounds según `max_quantity - reserved`.
  - Cálculo dinámico de **precio actual estimado** (escalón vigente para reservados+quantity), **seña** según `deposit_percentage`, y **saldo al cierre**.
  - Hint del próximo escalón con unidades restantes.
  - Botón "Reservar con seña" redirige a `/login?next=/campanas/[slug]/reservar?quantity=...` como placeholder hasta tener auth.
  - Estado "Campaña cerrada" si el `status` no es `activa`.
- **Panel admin completo** con sidebar y gating por rol:
  - [/admin](src/app/admin/page.tsx) dashboard con 4 stats (campañas activas, reservas vigentes, usuarios, productos).
  - [/admin/campanas](src/app/admin/campanas/page.tsx) tabla con TODAS las campañas (todos los estados) + botón "Cerrar campaña".
  - [/admin/campanas/nueva](src/app/admin/campanas/nueva/page.tsx) form con escalones dinámicos (`+/-` rows).
  - [/admin/campanas/[id]](src/app/admin/campanas/[id]/page.tsx) ficha + form para postear `campaign_status_updates`.
  - [/admin/productos](src/app/admin/productos/page.tsx) listado + [/admin/productos/nuevo](src/app/admin/productos/nuevo/page.tsx).
  - [/admin/configuracion](src/app/admin/configuracion/page.tsx) edita `settings` (tipo de cambio, comisiones, plazos).
  - [/admin/usuarios](src/app/admin/usuarios/page.tsx) lista con toggles de roles (asignar / quitar admin, comprador, etc).
  - [/admin/reservas](src/app/admin/reservas/page.tsx) vista global con email del usuario y campaña.
  - Todas las Server Actions en [actions.ts](src/app/admin/actions.ts) validan rol admin via `has_role()` y loguean en `admin_actions_log`.
- **Migración admin_policies** ([20260518150000](supabase/migrations/20260518150000_admin_policies.sql)) aplicada al cloud:
  - Policies de SELECT/INSERT/UPDATE/DELETE para admin en profiles, user_roles, campaigns, pricing_tiers, products, categories, settings, admin_actions_log, campaign_reservations, inventory_items, campaign_status_updates.
- **Detalle de campaña enriquecido**:
  - Botón [ShareButton](src/components/campanas/ShareButton.tsx) (Client) con WhatsApp pre-armado, copiar link, modal de QR (via `api.qrserver.com`).
  - Timeline de `campaign_status_updates` visibles para usuarios en el cuerpo de la pantalla.
- **Detalle de producto** [/producto/[slug]](src/app/(public)/producto/[slug]/page.tsx) con galería, descripción, atributos, sidebar con stock disponible o campañas activas vinculadas.
- **Perfil completo** ([/perfil](src/app/(user)/perfil/page.tsx)) con 4 cards a sub-páginas:
  - [/perfil/direcciones](src/app/(user)/perfil/direcciones/page.tsx) CRUD con form colapsable, soporta "principal".
  - [/perfil/credito](src/app/(user)/perfil/credito/page.tsx) muestra `user_credits.available_cents_usd` + `credit_movements`.
  - [/perfil/notificaciones](src/app/(user)/perfil/notificaciones/page.tsx) lista + acción "marcar todas leídas". Header muestra badge con conteo de no leídas.
  - [/perfil/reclamos](src/app/(user)/perfil/reclamos/page.tsx) lista + form para abrir reclamo nuevo.
- **Propuestas comunitarias** (regla §3.10):
  - [/propuestas](src/app/(public)/propuestas/page.tsx) listado público con conteo de interesados y unidades.
  - [/proponer-producto](src/app/(public)/proponer-producto/page.tsx) form (requiere sesión).
  - [createProposalAction](src/app/(public)/propuestas/actions.ts) crea propuesta + suma al proponente como primer interesado automáticamente.
- **Mercado Pago + Resend como stubs** (estructura completa, esperando credenciales reales):
  - [src/lib/mercadopago/client.ts](src/lib/mercadopago/client.ts): `createCampaignDepositPreference` detecta `MERCADOPAGO_ACCESS_TOKEN`; devuelve URL mock a `/checkout/mercadopago-stub` si no hay credenciales.
  - [src/lib/email/send.ts](src/lib/email/send.ts): `sendEmail` que loguea a consola si no hay `RESEND_API_KEY`, o llama al SDK real cuando esté.
  - [src/lib/notifications/create.ts](src/lib/notifications/create.ts): helper para crear `notifications` in-app.
  - [/checkout/mercadopago-stub](src/app/(public)/checkout/mercadopago-stub/page.tsx): página que simula el checkout real con botón "Simular pago exitoso" que crea `payment`, marca reserva como `confirmada` y dispara notificación.
  - [/api/webhooks/mercadopago](src/app/api/webhooks/mercadopago/route.ts) route handler que valida firma (stub permisivo si no hay secret real), inserta `payment` y actualiza reserva. Cuando estén las credenciales, solo cambia `.env.local` y reemplazás los `TODO(MP)` con el SDK.
- **Flujo end-to-end andando con stubs**:
  - Reserva → crea `campaign_reservations` + notification in-app + email (stub) + redirect a `/campanas/[slug]/reservada` con botón "Pagar seña con MP" que va al stub checkout.
- **Tipos DB extendidos** con `claims`, `product_proposals`, `product_proposal_interests`, y enums `claim_type`, `claim_status`, `proposal_status`. Total: 19 tablas y 1 vista tipadas + 13 enums + 2 funciones SQL.
- **Migración Phase 1 (orders, payments, marketplace, notifications, etc.)** aplicada al cloud:
  - 13 enums nuevos (`order_status`, `payment_method`, `notification_channel`, `campaign_update_type`, etc.).
  - 25+ tablas nuevas: `inventory_items`, `orders`, `order_items`, `payments`, `user_credits`, `credit_movements`, `seller_profiles`, `marketplace_listings`, `marketplace_orders`, `marketplace_messages`, `catalog_links`, `catalog_attributions`, `catalog_sales`, `commission_tiers`, `commission_payouts`, `reviews`, `marketplace_listing_reviews`, `wishlists`, `product_proposals`, `product_proposal_interests`, `support_tickets`, `support_ticket_messages`, `claims`, `notifications`, `notification_preferences`, `settings`, `admin_actions_log`, `campaign_status_updates`.
  - Seed inicial de `settings` con tipo de cambio, comisiones default y plazos.
  - RLS habilitado con políticas base en todas las tablas con datos de usuarios.
- **Función SQL [close_campaign](supabase/migrations/20260518140000_close_campaign_function.sql)** aplicada al cloud:
  - Solo admins (chequeo interno con `has_role`).
  - Si `reserved >= moq` → status `cerrada_exitosa` + aplica precio del mejor escalón a todas las reservas + genera `credit_movements` (tipo `ajuste_precio_campana`) por diferencia + actualiza `user_credits`.
  - Si `reserved < moq` → status `cerrada_fallida` + cancela todas las reservas activas.
  - Devuelve JSON con resumen del cierre.
- **Cancelación de reserva** (regla §5.3):
  - [cancelReservationAction](src/app/(public)/campanas/actions.ts) valida sesión + reserva propia + status activo + plazo de 72 hs antes del cierre.
  - [CancelReservationButton](src/components/campanas/CancelReservationButton.tsx) (Client) con confirmación inline en `/mis-reservas`. Solo aparece para reservas activas con countdown > 72hs.
- **Panel admin** (`/admin`):
  - [Layout protegido](src/app/admin/layout.tsx) verifica `has_role admin` via rpc; redirige a `/perfil` si no.
  - Sidebar fijo con Dashboard / Campañas / Productos / Configuración + signOut.
  - [Dashboard](src/app/admin/page.tsx) con cards de stats (campañas activas, reservas vigentes, usuarios, productos).
  - [/admin/campanas](src/app/admin/campanas/page.tsx) tabla con todas las campañas (todos los estados), status pill, progreso al MOQ, countdown, botón "Cerrar campaña" que dispara [`closeCampaignAction`](src/app/admin/actions.ts) → rpc `close_campaign` con feedback inline del resumen.
- **/disponible** ([page.tsx](src/app/(public)/disponible/page.tsx)) lista `inventory_items` activos con `quantity > 0`. Card premium con precio, brand y stock. Empty state cuando vacío.
- **src/types/database.ts** ampliado con tablas que se usan ahora (inventory, orders, order_items, payments, user_credits, credit_movements, notifications, settings, admin_actions_log, campaign_status_updates) + 7 enums + función `close_campaign` en `Functions`. Las tablas de Fase 2 (marketplace, catalog, comisiones, reviews) existen en la DB pero sin tipos TS hasta que se usen.
- **Escrow + auto-revendedor + reseñas mutuas** (cierre completo del marketplace):
  - **Migración** [20260518170000_phase2_escrow_and_auto_reseller.sql](supabase/migrations/20260518170000_phase2_escrow_and_auto_reseller.sql) aplicada al cloud con:
    - Función `release_marketplace_escrow(order_id)` atómica: marca entregada (idempotente), inserta `credit_movement`, acumula `seller_amount` a `user_credits`, incrementa `seller_profiles.total_sales`.
    - Función `auto_release_marketplace_escrow()` admin-only: libera órdenes `despachada` con `shipped_at < now() - 3 days` (regla §5.6).
    - Trigger `trg_maybe_grant_reseller_role` en `campaign_reservations` que asigna rol `revendedor` automáticamente cuando una reserva pasa a `entregada` con `quantity ≥ settings.reseller_auto_threshold` (5 default) + notification "Ahora podés revender" (regla §2.5).
  - **Confirmar entrega**: [confirmDeliveryAction](src/app/(user)/perfil/mis-compras/actions.ts) llama a la rpc. [ConfirmDeliveryButton](src/components/marketplace/ConfirmDeliveryButton.tsx) aparece en `/perfil/mis-compras` para órdenes `pagada` o `despachada` con confirmación inline.
  - **Reseñas mutuas**: [createListingReviewAction](src/app/(user)/perfil/mis-compras/actions.ts) valida que la orden sea del buyer y status `entregada`, idempotente, recalcula `seller_profiles.rating_avg`, notifica al vendedor. [ListingReviewForm](src/components/marketplace/ListingReviewForm.tsx) en `/perfil/mis-compras` solo si entregada y sin review previa.
  - Tipos DB extendidos: `marketplace_listing_reviews` + 2 funciones rpc.
- **Cierre del marketplace de reventa** (línea 2 del bloque 1 del MASTER):
  - **Panel revendedor** [/perfil/revendedor](src/app/(user)/perfil/revendedor/page.tsx): onboarding con `ActivateResellerButton` (aprobación automática en MVP) o, si ya activo, dashboard con pedidos a despachar + listado de mis publicaciones + form para crear nueva publicación. Server Actions: `activateResellerRoleAction`, `createListingAction`, `toggleListingStatusAction`, `markOrderShippedAction`.
  - **Compra real**: [BuyListingForm](src/components/marketplace/BuyListingForm.tsx) en sidebar del detalle de listing → [createMarketplaceOrderAction](src/app/(public)/marketplace/actions.ts) valida sesión + stock + no-ownership, lee comisión de settings, crea `marketplace_order` status `pagada`, reduce stock y notifica al vendedor.
  - **[/perfil/mis-compras](src/app/(user)/perfil/mis-compras/page.tsx)**: lista pedidos del buyer con status, tracking si hay.
  - **Chat interno** (`marketplace_messages`):
    - `conversation_id` = `listing_id`.
    - [sendMarketplaceMessageAction](src/app/(user)/perfil/mensajes/actions.ts) resuelve destinatario por rol del sender, notifica al recibidor.
    - [/perfil/mensajes](src/app/(user)/perfil/mensajes/page.tsx) lista conversaciones; [/perfil/mensajes/[id]](src/app/(user)/perfil/mensajes/[id]/page.tsx) hilo con burbujas + [MessageComposer](src/components/marketplace/MessageComposer.tsx).
    - Botón "Consultar al vendedor" en `/marketplace/[id]` abre la conversación.
  - `/perfil` principal con 11 cards.
- **Fase 2 grande: vendedores por catálogo, marketplace, reseñas y wishlists**:
  - **Migración** [20260518160000_phase2_insert_policies.sql](supabase/migrations/20260518160000_phase2_insert_policies.sql) aplicada al cloud con policies INSERT/DELETE para `seller_profiles`, `catalog_links`, `marketplace_listings`, `marketplace_orders`, `wishlists`.
  - **Vendedores por catálogo** ([§3.6 MASTER](docs/MASTER.md)):
    - [/perfil/vendedor](src/app/(user)/perfil/vendedor/page.tsx) onboarding (form de slug + bio) o dashboard si ya está activo (cards de comisión pendiente / disponible / pagado).
    - [activateSellerProfileAction](src/app/(user)/perfil/vendedor/actions.ts) crea `seller_profile` + asigna rol `vendedor_catalogo` + crea `catalog_link` inicial.
    - **Catálogo público** [/vendedor/[slug]](src/app/(public)/vendedor/[slug]/page.tsx) con avatar, bio, stats, `ShareButton` y grid de campañas activas.
    - **Link corto** [/v/[slug]](src/app/v/[slug]/route.ts) setea cookie `mn_seller` (30 días) y redirige al catálogo.
    - **Atribución automática**: `createReservationAction` lee cookie, resuelve seller via `seller_profiles.slug`, guarda `attributed_seller_id` en la reserva y crea `catalog_sales` pendiente con `commission_pct` desde `settings.campaign_commission_default_pct` (default 12%).
  - **Marketplace de reventa** ([§3.5 MASTER](docs/MASTER.md), modelo escrow):
    - [/marketplace](src/app/(public)/marketplace/page.tsx) listado de `marketplace_listings` activos con `quantity > 0`. Card con imagen, brand, precio, stock, info del vendedor con rating.
    - [/marketplace/[id]](src/app/(public)/marketplace/[id]/page.tsx) detalle con galería, descripción del producto, notas del vendedor, sidebar de compra (disabled hasta MP real) + card del vendedor con link a su catálogo. Bloque "Compra protegida" explicando el escrow.
  - **Reseñas de producto**:
    - [/producto/[slug]](src/app/(public)/producto/[slug]/page.tsx) trae `reviews` visibles + estado wishlist del user. Avg rating + count debajo del título.
    - [ReviewForm](src/components/producto/ReviewForm.tsx) (Client) con selector visual de estrellas hover-state + título + body. Server Action [createReviewAction](src/app/(public)/producto/[slug]/actions.ts) con Zod.
    - Listado de 10 reseñas más recientes con estrellas, autor (first_name), fecha.
  - **Wishlists**:
    - [WishlistButton](src/components/producto/WishlistButton.tsx) (Client) en cabezal del producto, toggle add/remove via `toggleWishlistAction`.
    - [/perfil/deseos](src/app/(user)/perfil/deseos/page.tsx) lista productos guardados con imagen, brand y fecha. Empty state si vacía.
  - **Perfil principal** ([/perfil](src/app/(user)/perfil/page.tsx)) ahora con 7 cards: Mis reservas / Notificaciones / Lista de deseos / Programa de vendedores / Mis direcciones / Crédito / Reclamos.
  - **Tipos DB Fase 2** agregados a `database.ts`: `seller_profiles`, `catalog_links`, `catalog_sales`, `marketplace_listings`, `marketplace_orders`, `reviews`, `wishlists` + 4 enums (`listing_status`, `marketplace_order_status`, `catalog_sale_status`, `review_status`).
- **Imágenes lifestyle de Unsplash en hero y secciones**:
  - Producto demo "Cámara IP WiFi" actualizado en DB con `photo-1558002038-1055907df827` (cámara de seguridad real). Aplica al detalle de campaña y a las cards.
  - Home con layout asimétrico tipo editorial: hero 2 columnas (texto + foto de cajas de importación), sección "El método" con foto de mercado/comunidad, CTA vendedores con foto de persona/celular. Tarjeta flotante con highlight de "precio escalonado" como detalle gluwz-style.
  - `/como-funciona` hero también en 2 columnas con foto de mercadería empaquetada.
  - Home pasa a **Server Component async** que lee `campaigns` + `pricing_tiers` + `campaign_progress_view`. Sección "Campañas en curso" muestra `CampaignCard`s reales en lugar del empty state hardcoded (el empty solo cuando no hay activas).
  - Todas con `next/image`, `sizes` responsive, `priority` en hero. `shadow-soft` para feel editorial.
- **Cambio de paleta a light editorial estilo gluwz.be**:
  - Blanco cálido cremoso `oklch(0.985 0.006 85)` como fondo, verde sage muted `oklch(0.5 0.08 150)` como primary, beiges y grises cálidos en muted/accent.
  - Root layout sin clase `dark`, `colorScheme: light`. (La sección "dark premium" abajo es histórica — la paleta ahora es light editorial inspirada en gluwz.)
  - Utility `shadow-glow` reemplazada por sombra suave estilo papel (sin glow agresivo). Nueva utility `shadow-soft` para cards.
  - Orbes blur del hero a `bg-primary/8` (más sutiles en fondo claro).
  - Warnings (avisos modo demo, status "abierto" en reclamos) ahora con `bg-amber-100 text-amber-900`.
- **Rediseño visual previo dark premium** (histórico, inspirado en legendslegalmarketing.com):
  - Paleta **Carbon Black + Alabaster** + verde brillante como acento. `--background: oklch(0.09 0 0)`, `--foreground: oklch(0.96 0.005 90)`, `--primary: oklch(0.78 0.18 145)`. Border sutil 8% sobre negro.
  - Root layout fuerza `class="dark"` + `style colorScheme: dark` — sin sistema de toggle, todo el sitio es dark.
  - Utility classes nuevas en globals.css: `text-gradient` (degradado en headings), `bg-grain` (overlay de grano sutil), `shadow-glow` (resplandor verde para CTAs), `border-glow` (borde luminoso).
  - Headings con letter-spacing negativo ajustado (-0.04em en h1).
  - **Librería de animaciones**: `motion` (framer-motion v12 unificado) en [src/components/motion/](src/components/motion/):
    - [Reveal](src/components/motion/Reveal.tsx): fade + slide-up al scroll, respeta `prefers-reduced-motion`.
    - [Stagger](src/components/motion/Stagger.tsx) + `StaggerItem`: entrada escalonada de hijos.
    - Easing premium `[0.22, 1, 0.36, 1]` consistente en todo el sitio.
  - **Home** rehecho: hero con eyebrow pill, headline gradient sobre 2 líneas, CTAs con glow, fila de 4 stats animados. Sección "El método" con números monospace 01/02/03 en grid `gap-px` sobre `bg-border`. Sección "Por qué" con cards de icon chips ring-inset. CTA final con orb blur primary.
  - **/como-funciona** mismo lenguaje visual: hero con orb, journey en grid, tabla de escalones con row destacado en `primary/5`.
  - **/campanas**: hero con eyebrow + orb, listado con Stagger animation.
  - **CampaignCard**: aspect-[4/3], imagen con scale al hover, overlay gradient hacia el card, arrow chip que aparece al hover.
  - **Detalle de campaña**: hero image con border, brand como eyebrow uppercase tracking, h1 más grande con tracking ajustado, Reveal en el hero. ReserveForm con `shadow-glow`.
  - **Auth screens** ((auth)/layout): gradient orb + grain overlay, header con backdrop-blur, brand con dot y "Nuestro" en muted.
- **Catálogo público base armado** (semana 4 del plan, parcial):
  - Layout público en [src/app/(public)/layout.tsx](src/app/(public)/layout.tsx) con `Header` sticky (logo + nav desktop + CTA "Entrar / Crear cuenta") y `Footer` con 4 columnas (Comprar / Vender / Mercado Nuestro / Legal) + dirección del local de Paysandú. Componentes en `src/components/layout/`. `Container` helper para max-width consistente.
  - Home [src/app/(public)/page.tsx](src/app/(public)/page.tsx) con hero ("Importá en grupo, pagá precio mayorista"), 3 pasos de cómo funciona, sección de campañas destacadas (empty state mientras no haya data), 4 propuestas de valor con iconos de Lucide y CTA al programa de vendedores.
  - [/como-funciona](src/app/(public)/como-funciona/page.tsx) con journey de 6 pasos, tabla de escalones de precio de ejemplo y bloque de garantías (precio retroactivo + devolución si no se alcanza el MOQ).
  - **Listado /campanas conectado a Supabase** [src/app/(public)/campanas/page.tsx](src/app/(public)/campanas/page.tsx) como Server Component. Lee `campaigns` activas con join a `products` y `campaign_pricing_tiers`, más una segunda consulta a `campaign_progress_view`. Mergea por `campaign_id` en código (sin Relationships en `Database`, usamos `.returns<T>()` con tipo local explícito). Card [src/components/campanas/CampaignCard.tsx](src/components/campanas/CampaignCard.tsx) con imagen, escalón actual, faltantes para próximo escalón, barra de progreso al MOQ, countdown.
  - Helpers en [src/lib/campaigns.ts](src/lib/campaigns.ts): `formatUsdFromCents` (Intl es-UY), `formatTimeRemaining`, `findCurrentTier`, `findNextTier`, `unitsUntilNextTier`.
  - Identidad visual neutra: primary verde `oklch(0.55 0.16 150)` light / `oklch(0.72 0.17 150)` dark, accent verde claro como tinte. Geist como `--font-sans`, `lang="es-UY"` en root layout.
  - `next.config.ts` con `remotePatterns` para imágenes de Supabase Storage.
- **Proyecto Supabase cloud creado y operativo**:
  - Nombre: `mercado-nuestro` · Org: `guillermo.correa022@gmail.com's Org` (Free).
  - Project ID: `ujvzbyzxfllczvoiywap` · Region: `sa-east-1` (São Paulo).
  - URL: `https://ujvzbyzxfllczvoiywap.supabase.co`.
  - `.env.local` creado con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_DB_PASSWORD` (legacy JWT — el proyecto también tiene los nuevos `sb_publishable_*` / `sb_secret_*`, ambos formatos son válidos en `supabase-js` v2).
- **Migración inicial aplicada al proyecto Supabase** vía SQL Editor. Verificado en el Table Editor que las 10 tablas + 1 vista existen con RLS habilitado en todas. Query guardada en el dashboard como "Initial schema for import campaigns and reservations".
- **Tipos TypeScript reales** en [src/types/database.ts](src/types/database.ts) (≈400 líneas): Row/Insert/Update por cada tabla, vista `campaign_progress_view`, función `has_role`, 6 enums tipados. Generados manualmente porque `supabase gen types --db-url` requiere Docker (no instalado). El comentario del archivo documenta cómo regenerar cuando se conecte Docker o se haga `supabase login`.
- Build pasa con tipos reales conectados.

- **Fase 3 extras: verificación de teléfono, referidos, sub-roles admin, importadores avanzados y lives**:
  - **Migración** [20260518180000_phase3_extras.sql](supabase/migrations/20260518180000_phase3_extras.sql): 4 valores nuevos al enum `user_role` (`admin_super`, `admin_operador_campanas`, `admin_atencion`, `admin_local`), `profiles.phone_verified_at`, tabla `phone_verification_codes` con RLS, `profiles.referral_code` con generación automática (función `generate_referral_code` + trigger `handle_new_user` actualizado), tabla `referrals` con RLS. Backfill de referral_code para usuarios existentes.
  - **SMS stub** [src/lib/sms/send.ts](src/lib/sms/send.ts) y **WhatsApp stub** [src/lib/whatsapp/send.ts](src/lib/whatsapp/send.ts) — mismo patrón que Resend stub; cuando estén `TWILIO_ACCOUNT_SID`/`TWILIO_SMS_NUMBER`/`TWILIO_WHATSAPP_NUMBER` se reemplaza con el SDK real. Devuelven `{ ok, stubbed }`.
  - **Verificación de teléfono** [/perfil/verificacion-telefono](src/app/(user)/perfil/verificacion-telefono/page.tsx) (regla §10): Server Actions [sendPhoneCodeAction, verifyPhoneCodeAction](src/app/(user)/perfil/verificacion-telefono/actions.ts) generan código de 6 dígitos con expiración 10 min, lo guardan en `phone_verification_codes`, envían vía SMS stub. En modo stub el código se devuelve al cliente (`stubCode`) para poder probar. Marca `profiles.phone_verified_at` al verificar.
  - **Programa de referidos** [/perfil/referidos](src/app/(user)/perfil/referidos/page.tsx): muestra tu `referral_code`, link `/registro?ref=CODE`, totales consolidados/pendientes, listado de tus referidos. Reutiliza `ShareButton` con mensaje prearmado.
  - **Importadores avanzados** [/ser-importador](src/app/(public)/ser-importador/page.tsx) (regla §2.5, Fase 3): landing con beneficios, requisitos y formulario de postulación → [applyImporterAction](src/app/(public)/ser-importador/actions.ts) valida con Zod y envía email al admin (vía stub).
  - **Sub-roles admin** en [/admin/usuarios](src/app/admin/usuarios/page.tsx): muestra los 4 sub-roles (`admin_super`, `admin_operador_campanas`, `admin_atencion`, `admin_local`) sólo cuando el usuario ya tiene `admin` activo. Toggle reutiliza `UserRoleToggle` existente con labels actualizados.
  - **Lives shopping placeholder** [/lives](src/app/(public)/lives/page.tsx): página informativa con hero, roadmap (demos / ofertas / calendario) y CTA a notificaciones.
  - **Tipos DB** extendidos: `phone_verification_codes`, `referrals` agregados a `Tables`; `phone_verified_at`/`referral_code` en `profiles.Row|Insert|Update`; `UserRole` extendido con los 4 sub-roles.
  - Perfil `/perfil` actualizado con cards "Verificar teléfono" y "Programa de referidos".

- **Fase 4: cierre del ciclo completo del MASTER** — todo lo que faltaba para cubrir los 10 bloques (excepto el carrito multi-item, decisión registrada en docs/DECISIONS.md):
  - **Migración** [20260518190000_phase4_full_cycle.sql](supabase/migrations/20260518190000_phase4_full_cycle.sql) con 10 RPCs nuevas:
    - `pay_campaign_balance(reservation, method)` paga el 70% restante (regla §5.2).
    - `refund_failed_campaign_reservation(reservation, mode)` cash o credit + 5% (regla §5.3).
    - `extend_campaign(campaign, new_closes_at)` admin, una vez si ≥85% MOQ y <7 días (regla §5.4).
    - `appeal_claim(claim, reason)` apelación única (regla §5.8).
    - `compute_seller_monthly_bonus_pct(seller, month)` aplica bonus por volumen (regla §5.7).
    - `auto_close_expired_campaigns()` cron del cierre automático.
    - `process_monthly_seller_payouts(min_cents)` genera payouts mensuales (regla §5.7), permitido desde service role para correr por cron.
    - `reservation_balance_cents(id)` helper.
    - `purchase_inventory_item(item, qty, address, method)` checkout atómico de stock disponible.
    - Vistas: `user_stats_view`, `seller_dashboard_view`.
    - `claims` extendida con `appealed_at`, `appeal_reason`.
  - **Pago de saldo + refund/credit al fallar MOQ** [src/app/(public)/campanas/actions.ts](src/app/(public)/campanas/actions.ts): `payCampaignBalanceAction`, `refundFailedCampaignAction`. UI en [/mis-reservas](src/app/(user)/mis-reservas/page.tsx) con [PayBalanceButton](src/components/campanas/PayBalanceButton.tsx) (cuando la campaña cerró exitosa) y [RefundChoiceButtons](src/components/campanas/RefundChoiceButtons.tsx) (cash o credit + 5%).
  - **Checkout de stock disponible** [BuyInventoryForm](src/components/productos/BuyInventoryForm.tsx) en `/producto/[slug]` para items con stock activo. Server Action [buyInventoryItemAction](src/app/(public)/producto/[slug]/buy-actions.ts) llama a la RPC atómica.
  - **Pedidos unificados** [/pedidos](src/app/(user)/pedidos/page.tsx) listado + [/pedidos/[id]](src/app/(user)/pedidos/[id]/page.tsx) detalle con timeline de 5 estados, items, dirección y pagos.
  - **Verificación de identidad** [/perfil/verificacion-identidad](src/app/(user)/perfil/verificacion-identidad/page.tsx) con [VerificationForm](src/components/perfil/VerificationForm.tsx) — acepta URL externa al documento mientras esté en Fase 0-2 (decisión documentada). Admin revisa en [/admin/verificaciones](src/app/admin/verificaciones/page.tsx) con [ReviewVerificationButtons](src/components/admin/ReviewVerificationButtons.tsx).
  - **Extensión de plazo admin** [ExtendCampaignButton](src/components/admin/ExtendCampaignButton.tsx) en `/admin/campanas` con datetime-local. Llama a [extendCampaignAction](src/app/admin/actions.ts).
  - **Apelación de reclamos** [AppealClaimButton](src/components/perfil/AppealClaimButton.tsx) visible en `/perfil/reclamos` cuando el reclamo está cerrado o resuelto a favor del vendedor. UNA sola vez (regla §5.8).
  - **Admin pages nuevas**: [/admin/comisiones](src/app/admin/comisiones/page.tsx) con [ProcessPayoutsButton](src/components/admin/ProcessPayoutsButton.tsx) y [MarkPayoutPaidButton](src/components/admin/MarkPayoutPaidButton.tsx); [/admin/reclamos](src/app/admin/reclamos/page.tsx) con [ResolveClaimButtons](src/components/admin/ResolveClaimButtons.tsx); [/admin/pedidos](src/app/admin/pedidos/page.tsx) listado unificado; [/admin/verificaciones](src/app/admin/verificaciones/page.tsx). Sidebar admin actualizado con 5 entradas nuevas.
  - **Notification preferences** [/perfil/notificaciones/preferencias](src/app/(user)/perfil/notificaciones/preferencias/page.tsx) con grid de 4 tipos × 4 canales (in_app, email, sms, whatsapp). Upsert en `notification_preferences`.
  - **Cron endpoints** en [/api/cron/](src/app/api/cron/): `close-expired-campaigns`, `release-escrow`, `process-payouts`. Protegidos con `Authorization: Bearer ${CRON_SECRET}`. Usan [createAdminClient](src/lib/supabase/admin.ts) (service role). `vercel.json` con 3 schedules (cada hora, cada hora +15min, día 1 del mes a las 10).
  - **Dashboard agregado** en `/perfil`: 4 stats arriba (reservas activas, marketplace orders, crédito, notifs sin leer) leídos de `user_stats_view`.
  - **Páginas legales + informativas**: [/terminos](src/app/(public)/terminos/page.tsx), [/privacidad](src/app/(public)/privacidad/page.tsx), [/devoluciones](src/app/(public)/devoluciones/page.tsx), [/envios](src/app/(public)/envios/page.tsx), [/quienes-somos](src/app/(public)/quienes-somos/page.tsx), [/contacto](src/app/(public)/contacto/page.tsx). Footer actualizado.
  - **Docs complementarios**: `docs/DECISIONS.md`, `docs/BUSINESS.md`, `docs/ARCHITECTURE.md`, `docs/FLOWS.md`, `docs/SCHEMA.md`, `docs/PROMPTS.md`. Cierra el referencing del CLAUDE.md §6.
  - **Tipos DB** extendidos: `commission_payouts`, `support_tickets`, `notification_preferences` agregados a Tables; `claims.appealed_at|appeal_reason`; 2 vistas nuevas; 10 RPCs en Functions.
  - **Build verde con 57 rutas** (era 47 antes).

- **Fase 5: revamp visual completo al estilo funparquesaojoao.pt** (sesión actual):
  - **Paleta nueva**: blanco puro `oklch(1 0 0)` + **lime green saturado** `oklch(0.78 0.2 140)` como primary (antes sage muteado). Acento verde claro. Foreground azul carbon. Border radius global subido a 0.875rem para feel playful. Sombras coloridas verdes en CTAs y hover-lift.
  - **Tipografía**: cambio de Geist → **Plus Jakarta Sans** (humanist, rounded, friendly). Headings forzados a `font-weight: 800`.
  - **Utilidades nuevas en globals.css**: `.text-highlight` (palabra subrayada en verde fuerte), `.bg-dots` (pattern Patern.png-like), `.hover-lift`, `animate-marquee`, `animate-float-slow`, `animate-float-slower`. Removida `.text-gradient`.
  - **Componentes UI nuevos**:
    - [BlobDivider](src/components/motion/BlobDivider.tsx) — 3 SVG blob shapes orgánicos × 5 posiciones, opcional float.
    - [Accordion](src/components/ui/accordion.tsx) — con icono `+` que rota a `×`, animación motion.
    - [Tabs](src/components/ui/tabs.tsx) — pill activo con `motion.layoutId` (magic-line).
    - [StarRating](src/components/ui/star-rating.tsx) — 5 estrellas con fill parcial.
    - [Marquee](src/components/motion/Marquee.tsx) — ticker horizontal infinito con items duplicados.
    - [StackedCards](src/components/motion/StackedCards.tsx) — cards apiladas tipo Apple/Linear. Usa `display: flow-root` para prevenir margin collapse de la última card.
  - **Componentes home**:
    - [ActivityCard](src/components/home/ActivityCard.tsx) — layout horizontal full-width 3 columnas: LEFT (cream bg + título uppercase gigante + descripción + dual CTA) / CENTER (imagen) / RIGHT (accent bg + "Cómo funciona" + Incluye/No incluye). Estructura exacta del FUN Parque.
    - [PricingTabs](src/components/home/PricingTabs.tsx) — Preçário tabbed con 4 categorías (Electrónica, Hogar, Indumentaria, Empresas) × tabla de 3 escalones con "MEJOR PRECIO" en el último.
    - [QuickStartForm](src/components/home/QuickStartForm.tsx) — form Reservar inline con nombre + email + radio buttons de interés que redirige a `/registro` con params prefill.
    - [TestimonialCard](src/components/home/TestimonialCard.tsx) — figure con quote, estrellas, blockquote.
  - **Header isla flotante scroll-aware** ([FloatingHeaderShell](src/components/layout/FloatingHeaderShell.tsx) + [Header](src/components/layout/Header.tsx)):
    - `position: fixed` centrado max-w-1100px, rounded-full, backdrop-blur.
    - Scroll abajo > 80px → se oculta (`y: -130%`). Scroll arriba → reaparece.
    - Cerca del top siempre visible. Sombra suave en top, sombra verde al separarse.
    - CTAs: Precios outline + Reservar filled (estilo Preçário/Reservar del FUN Parque).
  - **Home rediseñado** (`src/app/(public)/page.tsx`):
    1. **HERO full-viewport oscuro** con imagen de contenedores, headline en 2 líneas con `clamp(2.25rem, 7vw, 7rem)`, "precio mayorista" en lime green, 2 CTAs centrados (Precios dark / Reservar outline).
    2. **MARQUEE verde** corriendo al pie del hero (próxima campaña / 60% menos / retiro gratis / etc.).
    3. **SOBRE** con imagen sticky-left + texto right en bloques escalonados con Reveal. Sticker "Made in Uruguay 🇺🇾" rotado 12°.
    4. **LÍNEAS** (bg oscuro) con headline gigante "Sumate a nuestras cuatro líneas" + **StackedCards** (4 ActivityCards apiladas con deck-stack scroll). Cada card es 3-col horizontal: izquierda cream con título / imagen / accent verde con "Cómo funciona".
    5. **MARQUEE accent** entre secciones.
    6. **CAMPAÑAS DESTACADAS** (real data de Supabase).
    7. **GRUPOS** — 3 cards (Empresas / Instituciones / Importadores avanzados).
    8. **FAQs** tabbed (General / Campañas / Marketplace / Vendedores) × accordion.
    9. **TESTIMONIOS** 3 cards.
    10. **PRECIOS** (Preçário) — `PricingTabs` con tabla de escalones.
    11. **RESERVAR** — form inline `QuickStartForm`.
  - **Bug fixes importantes**:
    - **Margin collapse en StackedCards**: la última card no se apilaba porque su `marginBottom` colapsaba hacia afuera del contenedor padre. Fix: `display: flow-root` en el container = nuevo block formatting context que impide el collapse.
    - **Sticky positioning roto por overflow-hidden**: cualquier ancestro con `overflow: hidden` rompe `position: sticky`. Movido el `<BlobDivider>` a un wrapper aparte que no contiene los stacked cards.
    - **Texto blanco invisible en cards**: la sección padre tenía `text-white` (bg oscuro) y eso heredaba hasta los hijos. Fix: `text-foreground` explícito en `<article>` y cada columna del ActivityCard.
    - **Hero text overflow**: `Container` con `max-w-6xl` limitaba el ancho. Cambiado a div full-bleed con `max-w-[1500px]` en el h1 y `clamp` font-size.

**Pendiente en cimientos técnicos:**
- Conectar las features clave de Supabase Auth desde el dashboard: redirect URLs (`http://localhost:3000/auth/callback` para dev), Google OAuth provider (cuando se tengan client_id/secret), confirmar email habilitado.
- Migraciones siguientes: marketplace (listings, orders, messages), orders unificadora + order_items + payments, vendedores por catálogo (catalog_links, attributions, sales, commission_tiers, payouts), reviews/ratings, wishlists, support_tickets/claims, notifications, settings, admin_actions_log.
- Layout principal de `src/app/layout.tsx` con header/footer y tipografía del proyecto (preliminar: Inter o Geist; sin definir aún).
- Smoke test: una página que lea `categories` (vacía) o `campaigns` para validar el cliente en ejecución.

**Estamos trabajando en (sesión actual):** Revamp visual del home completo siguiendo el estilo del FUN Parque (https://www.funparquesaojoao.pt/) — hero full-viewport oscuro, cards apiladas tipo Apple/Linear, navbar flotante scroll-aware, marquees, tabbed pricing, testimonios con estrellas. Funcionalmente todo el backend ya está; lo que se está iterando es **la capa visual del home** para que se parezca al referente.

**Lo que falta en el revamp visual (siguiente paso):**
- Aplicar las decisiones visuales (paleta lime, headings extra-bold, blob dividers, hover-lift) al RESTO de las páginas (`/campanas`, `/marketplace`, `/disponible`, `/producto/[slug]`, `/perfil/*`). Hoy solo el home tiene el nuevo lenguaje completo.
- Refinar las tipografías y tamaños en mobile (revisar el clamp del headline en viewports angostos).
- Reemplazar las fotos genéricas de Unsplash por fotos reales del local de Paysandú cuando estén disponibles.
- Agregar imágenes finales de productos a Supabase Storage en lugar de placeholders.

**Próxima funcionalidad de producto:** Activar pagos reales con credenciales de Mercado Pago y emails reales con Resend. El código ya está estructurado en stubs ([src/lib/mercadopago/client.ts](src/lib/mercadopago/client.ts), [src/lib/email/send.ts](src/lib/email/send.ts)). Cuando lleguen las claves:
1. Completar en `.env.local`: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`.
2. Buscar los comentarios `TODO(MP)` y `TODO(resend)` y reemplazar las llamadas mock con SDK real.
3. Hacer un signup + reserva real para validar end-to-end.

**Pendientes operacionales para producción:**
- Aplicar la migración SQL `20260518190000_phase4_full_cycle.sql` en el SQL Editor de Supabase (incluye las 10 RPCs nuevas: `pay_campaign_balance`, `refund_failed_campaign_reservation`, `extend_campaign`, `appeal_claim`, `auto_close_expired_campaigns`, `process_monthly_seller_payouts`, `purchase_inventory_item`, `compute_seller_monthly_bonus_pct`, `reservation_balance_cents`, y la columna `claims.appealed_at|appeal_reason` + 2 vistas).
- Aplicar la migración `20260518180000_phase3_extras.sql` (sub-roles admin, phone verification, referidos) — había quedado en duda si se aplicó por crash del browser MCP.
- Configurar Vercel Cron y settear `CRON_SECRET` en env vars de Vercel para que los crons `/api/cron/{close-expired-campaigns,release-escrow,process-payouts}` se autentiquen.
- Conectar Supabase Auth desde el dashboard: redirect URLs (`http://localhost:3000/auth/callback` para dev), Google OAuth provider (cuando se tengan client_id/secret).
- Generar tipos TypeScript de Supabase con `npx supabase gen types` cuando Docker esté disponible, para reemplazar los `cast as never` en queries.

**Pendientes técnicos menores:**
- Subir cédulas a Supabase Storage en lugar del URL externo actual (decisión en docs/DECISIONS.md).
- Confirmar email opcional en Supabase Auth (hoy es obligatorio por default).
- Sentry para monitoreo de errores en producción.
- CI/CD via GitHub Actions (workflows/ está vacío).
- Carrito multi-item (decisión registrada en docs/DECISIONS.md: postergado para Fase 4 grande, los checkouts directos cubren el MVP).

**Última decisión técnica tomada (sesión actual):** Para resolver que la última card no se apilaba en `StackedCards`, descubrí que el `marginBottom` de la última card estaba colapsando hacia afuera del contenedor padre (regla CSS de margin collapse). Sin runway de scroll, la sticky de la última card no se activaba. Fix: `display: flow-root` en el contenedor padre crea un block formatting context que impide el collapse. Alternativas descartadas: `overflow: hidden` rompe sticky, `padding-bottom` interfiere con `useScroll` offset, agregar border es un hack.

---

## 3. Stack técnico definitivo

Usar exclusivamente este stack. Si necesitás incorporar una librería externa, documentá la decisión en `/docs/DECISIONS.md` antes de instalarla.

**Framework principal:**
- Next.js 16.2.6 con App Router y Turbopack por defecto
- TypeScript estricto (no usar `any` sin documentar el motivo)
- React 19.2.4
- Nota: Next 16 trae breaking changes documentados en `/AGENTS.md` (raíz del repo). Si una API parece "rara" comparada con conocimiento previo, leer docs en `node_modules/next/dist/docs/` antes de improvisar.

**Base de datos y backend:**
- Supabase (PostgreSQL administrado + Auth + Storage + Realtime)
- Row Level Security (RLS) obligatorio en todas las tablas con datos de usuarios
- Migraciones versionadas en `/supabase/migrations/`

**Estilos:**
- Tailwind CSS v4 (config CSS-first, sin `tailwind.config.ts`; tokens en `src/app/globals.css`)
- shadcn/ui para componentes base (copiados al proyecto, no instalados como librería). Preset `base-nova`, base color `neutral`, CSS variables habilitadas. Config en `components.json` (raíz).
- Lucide React para íconos

**Validación:**
- Zod para todos los esquemas de validación
- Validar en cliente Y en server, nunca confiar en validación del cliente

**Pagos:**
- Mercado Pago Uruguay como pasarela principal (cubre tarjetas, transferencias, Abitab, Redpagos)
- Webhooks de Mercado Pago para confirmar pagos asincrónicos

**Comunicaciones:**
- Resend para emails transaccionales
- Twilio para SMS y WhatsApp Business API (Fase 2)

**Hosting y deploy:**
- Vercel para frontend y API routes
- Deploy automático desde GitHub
- Preview deployments en pull requests

**Otros:**
- Sentry para monitoreo de errores en producción
- next/image para optimización automática de imágenes
- React Hook Form para formularios complejos
- date-fns para manejo de fechas (no usar moment)

---

## 4. Modelo de negocio resumido

### 4.1 Las cuatro líneas de ingreso

1. **Comisión sobre campañas de importación:** entre 10% y 15% del valor FOB (preliminar, ajustar con datos reales)
2. **Comisión sobre marketplace:** entre 7% y 10% sobre cada venta
3. **Margen directo sobre stock disponible:** según producto
4. **Comisión sobre operaciones de importadores avanzados:** definir cuando se habilite ese rol en Fase 3

### 4.2 Los seis roles del sistema

Los roles son acumulables: un usuario puede tener varios a la vez.

1. **Visitante:** sin cuenta, solo puede navegar el catálogo público
2. **Comprador:** rol por defecto al registrarse, puede reservar y comprar
3. **Vendedor por catálogo:** comprador que además distribuye un catálogo digital y cobra comisión
4. **Revendedor:** comprador que importó productos y los revende en el marketplace
5. **Importador avanzado:** usuario calificado que abre sus propias campañas (Fase 3, no MVP)
6. **Administrador:** equipo interno con acceso al panel administrativo

### 4.3 Cómo se obtiene cada rol

- **Comprador:** automático al verificar email
- **Vendedor por catálogo:** solicitud automática aprobada en MVP, requiere cédula cargada antes del primer cobro
- **Revendedor:** se activa automáticamente cuando el usuario recibe 5 o más unidades del mismo producto en una campaña (umbral configurable)
- **Importador avanzado:** aprobación manual del admin con requisitos (Fase 3)
- **Administrador:** asignación manual por otro admin

---

## 5. Reglas de negocio críticas

> **Estas son reglas inmutables del sistema. Si una regla no está documentada acá o en `/docs/BUSINESS.md`, preguntar al usuario antes de asumir. No improvisar lógica de negocio.**

### 5.1 Modelo de precios en campañas

- Cada campaña tiene escalones de precio definidos por el admin al crearla (ej: 1-10 uds USD 120, 11-30 uds USD 105, 31-100 uds USD 92)
- Los escalones los define el admin según información del proveedor, no son automáticos
- Durante la campaña, la interfaz muestra el precio del escalón actual y cuántas unidades faltan para el próximo
- **Al cerrar la campaña, todos los reservantes pagan el precio del mejor escalón alcanzado**, sin importar cuándo reservaron
- Si pagaron seña basada en un precio mayor, la diferencia se descuenta del saldo o se acredita como crédito en cuenta
- Nunca se cobra más que lo mostrado al reservar

### 5.2 Señas y saldos

- Seña al reservar: 30% del precio total (configurable por campaña)
- Saldo a pagar al cierre exitoso: 70% restante con el precio final aplicado
- Plazo para pagar saldo tras el cierre: 5 días hábiles
- Si no paga en plazo: pierde la seña y se libera el lugar (notificar al admin)

### 5.3 Cancelaciones

- Usuario puede cancelar reserva hasta **72 horas antes** del cierre de la campaña
- Cancelación en plazo: seña se devuelve al método de pago original en hasta 7 días hábiles
- Cancelación fuera de plazo: seña no se devuelve si la campaña sigue activa
- Si la campaña no llega al MOQ: todas las señas se devuelven automáticamente
- Opción de dejar el dinero como crédito en cuenta con bonus del 5%

### 5.4 Cierre de campañas

- Cierre exitoso: se alcanzó el MOQ al llegar la fecha límite
- Cierre fallido: no se alcanzó el MOQ al llegar la fecha límite
- Extensión de plazo: permitida UNA SOLA VEZ, solo si se está al menos al 85% del MOQ y restan menos de 7 días. Extensión máxima 7 días. Notificar a todos los participantes.

### 5.5 Compartir campañas

- Cada campaña tiene botón prominente de "Compartir"
- Opciones: WhatsApp (con mensaje pre-armado editable), Instagram, Facebook, copiar link, QR
- El link compartido incluye parámetro de atribución para rastrear viralidad
- Si la atribución llega a una venta, se registra (no genera comisión pero sí métricas)

### 5.6 Marketplace de reventa

- Solo usuarios con rol revendedor pueden publicar
- Solo se puede publicar producto que el usuario efectivamente recibió (validar contra su stock real)
- **El pago siempre pasa por Mercado Nuestro como intermediario (modelo escrow)**
- El dinero se libera al revendedor cuando: el comprador confirma entrega, O pasan 3 días sin reclamo desde la confirmación de envío
- Plazo para despachar: 3 días hábiles. Si no despacha en 7 días, se cancela la venta y se reembolsa al comprador
- Comisión: entre 7% y 10% según categoría
- Chat interno entre comprador y revendedor obligatorio (no se intercambian WhatsApps para evitar transacciones fuera de la plataforma)

### 5.7 Vendedores por catálogo

- Atribución por cookie de 30 días desde la última visita al link del vendedor
- Si el cliente se registra por el link del vendedor, queda asociado permanentemente como su vendedor de referencia (hasta que lo cambie manualmente)
- Comisión se "consolida" cuando se confirma la entrega al cliente final
- Comisión consolidada se puede retirar con mínimo de USD 20
- Pagos a vendedores: primeros 5 días hábiles de cada mes
- Escalones por volumen mensual (preliminar):
  - Hasta USD 500: comisión base
  - USD 501-1500: +2% sobre todo lo vendido en el mes
  - USD 1501-3000: +3%
  - Más de USD 3000: +5%

### 5.8 Devoluciones y reclamos

- Plazo para reclamar tras la entrega: 7 días corridos
- Tipos válidos: defectuoso, no llegó, llegó equivocado, faltante, no corresponde a descripción
- Evidencia requerida: foto del producto, foto del embalaje, descripción
- Plazo de resolución del admin: 5 días hábiles
- Apelación permitida UNA vez
- Reembolsos al método de pago original cuando es técnicamente posible

### 5.9 Pagos

- Métodos: tarjetas (vía MP), transferencia bancaria, Mercado Pago directo, Abitab, Redpagos, crédito en cuenta
- Moneda base: USD para cálculos internos
- Visualización: usuario elige USD o UYU
- Tipo de cambio: cargado manualmente por admin, idealmente diario
- En checkout siempre se muestran ambas monedas

### 5.10 Verificaciones de identidad

- Comprador: email + teléfono verificados antes del primer pago
- Vendedor por catálogo y revendedor: cédula cargada y aprobada antes del primer cobro o despacho
- Importador avanzado: verificación completa incluyendo RUT (Fase 3)

---

## 6. Documentación complementaria

Cuando trabajes en algo específico, consultá el documento correspondiente:

- **`/docs/MASTER.md`** — Documento maestro completo del proyecto. Es la referencia última. 10 bloques que cubren todo.
- **`/docs/BUSINESS.md`** — Reglas de negocio detalladas. Cuando una regla no está clara en este CLAUDE.md, está acá.
- **`/docs/ARCHITECTURE.md`** — Decisiones técnicas y justificación de cada una.
- **`/docs/DECISIONS.md`** — Registro vivo de decisiones tomadas durante el desarrollo. **Cuando tomes una decisión técnica nueva, agregala acá con fecha, contexto, opciones consideradas, decisión y motivo.**
- **`/docs/FLOWS.md`** — Flujos de usuario detallados paso a paso.
- **`/docs/SCHEMA.md`** — Modelo de datos detallado con todos los campos de cada tabla.
- **`/docs/PROMPTS.md`** — Prompts útiles para tareas recurrentes con Claude Code.

---

## 7. Estructura del repositorio

```
mercado-nuestro/
├── .github/
│   └── workflows/                # CI/CD si se agrega
├── docs/                         # Documentación del proyecto
│   ├── MASTER.md
│   ├── BUSINESS.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── FLOWS.md
│   ├── SCHEMA.md
│   └── PROMPTS.md
├── public/                       # Assets estáticos
├── src/
│   ├── app/                      # Rutas Next.js (App Router)
│   │   ├── (public)/             # Rutas públicas
│   │   │   ├── page.tsx          # Home
│   │   │   ├── campanas/         # Listado y detalle de campañas
│   │   │   ├── marketplace/      # Marketplace
│   │   │   ├── disponible/       # Stock disponible
│   │   │   ├── producto/[slug]/
│   │   │   ├── vendedor/[slug]/  # Catálogo público de vendedor
│   │   │   └── v/[slug]/         # Link corto que redirige
│   │   ├── (auth)/               # Login, registro, recuperación
│   │   ├── (user)/               # Panel de usuario logueado
│   │   │   ├── perfil/
│   │   │   ├── pedidos/
│   │   │   ├── reservas/
│   │   │   ├── deseos/
│   │   │   ├── reclamos/
│   │   │   └── vendedor/         # Panel de vendedor por catálogo
│   │   ├── (revendedor)/         # Panel de revendedor
│   │   ├── admin/                # Panel administrativo
│   │   └── api/                  # API routes (webhooks, etc.)
│   ├── components/
│   │   ├── ui/                   # Componentes shadcn
│   │   ├── campanas/
│   │   ├── productos/
│   │   ├── marketplace/
│   │   ├── usuario/
│   │   └── admin/
│   ├── lib/
│   │   ├── supabase/             # Cliente Supabase (server, client, middleware)
│   │   ├── mercadopago/          # Cliente MP
│   │   ├── email/                # Plantillas y envío
│   │   ├── notifications/        # Sistema de notificaciones
│   │   ├── validations/          # Esquemas Zod
│   │   ├── utils/
│   │   └── constants/
│   ├── hooks/                    # React hooks custom
│   ├── types/                    # TypeScript types
│   └── middleware.ts             # Middleware Next.js (auth, etc.)
├── supabase/
│   ├── migrations/               # Migraciones SQL versionadas
│   └── seed.sql                  # Datos iniciales para desarrollo
├── .env.example                  # Plantilla de variables de entorno
├── .env.local                    # Variables locales (NO COMMITEAR)
├── .gitignore
├── CLAUDE.md                     # Este archivo
├── README.md
├── components.json               # Config shadcn
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 8. Modelo de datos principal

> **Referencia rápida. Para detalle completo de campos, ver `/docs/SCHEMA.md`.**

### Tablas troncales

**Usuarios:**
- `users` — cuentas (gestionadas por Supabase Auth + tabla profile extendida)
- `user_addresses` — direcciones del usuario
- `user_roles` — roles asignados (acumulables)
- `user_verifications` — documentos de verificación
- `seller_profiles` — perfil extendido para vendedores

**Productos:**
- `categories` — árbol de categorías
- `products` — catálogo maestro
- `product_variants` — variantes (color, talle, etc.)

**Campañas:**
- `campaigns` — campañas de importación
- `campaign_pricing_tiers` — escalones de precio por campaña
- `campaign_reservations` — reservas de usuarios
- `campaign_payments` — pagos de cada reserva (seña + saldo)
- `campaign_status_updates` — actualizaciones de estado durante la importación

**Stock:**
- `inventory_items` — stock disponible (local + depósito)

**Marketplace:**
- `marketplace_listings` — publicaciones de revendedores
- `marketplace_orders` — órdenes del marketplace
- `marketplace_messages` — chat comprador-vendedor

**Órdenes y pagos generales:**
- `orders` — orden unificadora (puede contener items de varios tipos)
- `order_items` — items dentro de una orden
- `payments` — pagos asociados a órdenes
- `user_credits` — saldo a favor del usuario
- `credit_movements` — historial de movimientos del saldo

**Vendedores por catálogo:**
- `catalog_links` — links de atribución
- `catalog_attributions` — registros de atribución (cookies)
- `catalog_sales` — ventas atribuidas con comisión
- `commission_tiers` — escalones de comisión
- `commission_payouts` — pagos efectivos de comisión

**Otros:**
- `reviews` — reseñas de productos
- `marketplace_listing_reviews` — reseñas del marketplace
- `seller_ratings` — agregado de reputación
- `wishlists` — listas de deseos
- `product_proposals` — propuestas de productos por la comunidad (Fase 2)
- `support_tickets` — tickets de atención
- `claims` — reclamos formales
- `notifications` — notificaciones a usuarios
- `notification_preferences` — preferencias de notificación
- `settings` — configuración general del sistema
- `admin_actions_log` — auditoría de acciones administrativas

### Vistas computadas

- `campaign_progress_view` — estado actual de cada campaña (cantidad, escalón, % al MOQ, tiempo restante)
- `user_stats_view` — estadísticas por usuario
- `seller_dashboard_view` — dashboard agregado de vendedores

---

## 9. Convenciones de código

### TypeScript

- **Estricto siempre.** En `tsconfig.json`: `"strict": true`
- **No usar `any` sin comentario justificando.** Cuando sea inevitable, comentar por qué.
- **Tipos compartidos** en `/src/types/`
- **Tipos de la base de datos** generados con Supabase CLI en `/src/types/database.ts`
- **Inferir tipos cuando es posible** en vez de declararlos manualmente

### Estructura de componentes

- **Server components por defecto.** Solo agregar `"use client"` cuando se necesita interactividad
- **Naming:** PascalCase para componentes, camelCase para funciones y variables
- **Un componente por archivo** salvo componentes muy chicos relacionados
- **Props tipadas siempre.** Usar interface o type según convenga
- **No prop drilling profundo.** Si pasa de 3 niveles, considerar context o composición

### Naming general

- **Variables, funciones, archivos, rutas:** en inglés
- **Comentarios:** en español
- **Strings visibles al usuario:** en español rioplatense (vos, tenés, etc.)
- **Nombres descriptivos** sobre nombres cortos. `userReservations` mejor que `urs`

### Comentarios

- **Solo cuando el código no se autoexplica.** No comentar cosas obvias.
- **JSDoc en funciones públicas complejas** con descripción, parámetros y retorno
- **TODO con contexto:** `// TODO: revisar cuando tengamos más de X usuarios`
- **NUNCA comentar código viejo.** Borrarlo, está en Git.

### Server Actions y API routes

- **Validar inputs con Zod siempre.** Schemas en `/src/lib/validations/`
- **Manejar errores explícitamente.** No dejar try/catch vacíos.
- **Loguear errores con Sentry** en producción
- **Devolver tipos predecibles.** Idealmente un `Result<T>` con success/error.

### Base de datos

- **RLS obligatorio en toda tabla con datos de usuarios.** Sin excepciones.
- **Nunca usar service_role key desde el cliente.** Solo en server actions/API routes con autorización validada.
- **Migraciones versionadas.** Cada cambio de schema es una migración.
- **Nombres de tablas en snake_case y plural.** `campaign_reservations`, no `CampaignReservation`.
- **Nombres de columnas en snake_case.** `created_at`, no `createdAt`.
- **IDs como UUID** generados por la base.
- **Timestamps:** `created_at` y `updated_at` en todas las tablas, con triggers para `updated_at`.

### Manejo de fechas

- **Almacenar siempre en UTC** en la base de datos
- **Mostrar al usuario en zona horaria de Uruguay** (America/Montevideo)
- **Formato visible al usuario:** dd/mm/yyyy o "15 de mayo de 2026"
- **Usar date-fns** con locale es-UY

### Manejo de dinero

- **Almacenar siempre como integer en centavos.** No usar floats para dinero.
- **Moneda explícita en cada campo.** No asumir USD o UYU.
- **Conversión de moneda solo en visualización**, no en almacenamiento.
- **Cálculos con BigInt o librería decimal** si hay riesgo de pérdida de precisión.

### Imágenes

- **Usar `next/image` siempre.** Nunca `<img>` directo.
- **Subir a Supabase Storage** organizadas por entidad (`products/`, `users/`, `campaigns/`)
- **Generar thumbnails** para listados
- **Lazy loading por defecto.** Solo `priority` en hero/above-fold.

### Formularios

- **React Hook Form + Zod** para formularios complejos
- **Server Actions** para envío
- **Estados claros:** loading, success, error
- **Validación en tiempo real** en campos importantes
- **Mensajes de error en español rioplatense, amables y específicos**

### Componentes UI

- **Usar shadcn/ui como base.** No reinventar componentes que ya están.
- **Personalizar con Tailwind**, no con CSS extra.
- **Mobile first siempre.** Diseñar para celular primero.
- **Accesibilidad:** roles ARIA, labels en formularios, contraste mínimo AA, navegación por teclado.

---

## 10. Seguridad

> **Estas reglas no son negociables. Cualquier desvío debe documentarse y aprobarse explícitamente.**

### Autenticación

- Delegada completamente a Supabase Auth
- Múltiples métodos: email/contraseña, Google OAuth, WhatsApp/SMS (Fase 2)
- Tokens JWT manejados por Supabase
- Sesiones de 30 días con renovación automática
- Reautenticación obligatoria para acciones sensibles (cambio de contraseña, retiro de comisiones)

### Autorización

- **RLS obligatorio.** Todas las tablas con datos de usuarios tienen políticas RLS.
- **Validar permisos en server.** Nunca confiar en validaciones del cliente.
- **Roles verificados en cada acción crítica.** No asumir que un usuario tiene rol X.
- **Audit log en `admin_actions_log`** para todas las acciones administrativas sensibles.

### Datos sensibles

- **Cédulas y documentos** en Supabase Storage con acceso restringido
- **Datos bancarios** cifrados o solo accesibles por el dueño y admin específico
- **Contraseñas** nunca almacenadas en texto plano (Supabase Auth las hashea)
- **Logs sin datos sensibles.** Nunca loguear contraseñas, tokens, datos de tarjetas.

### Inputs

- **Validar todo con Zod** antes de procesar
- **Sanitizar HTML** si se renderiza contenido de usuarios (descripciones, mensajes)
- **Escapar SQL** automático vía Supabase client (no construir queries con string concat)
- **Rate limiting** en endpoints sensibles (login, registro, recuperación de contraseña)

### Secretos

- **Variables de entorno en `.env.local`** (gitignored)
- **Secretos de producción en Vercel** con variables de entorno encriptadas
- **Nunca commit de credenciales.** Si pasa, revocar inmediatamente la credencial.
- **Service role key de Supabase** solo en server, jamás en cliente

### Webhooks

- **Validar firmas** de webhooks de Mercado Pago antes de procesar
- **Idempotencia:** mismo webhook procesado dos veces debe dar mismo resultado
- **Timeout corto:** responder rápido y procesar asincrónicamente si es pesado

### CORS y headers

- **CSP estricto** en producción
- **HSTS habilitado**
- **Headers de seguridad** en `next.config.js`

---

## 11. Performance

### Estrategia general

- **Server components por defecto** para renderizar en servidor
- **Streaming con Suspense** en páginas con datos pesados
- **Caché agresivo** con revalidación inteligente
- **Imágenes optimizadas** con next/image

### Caché

- **Datos públicos** (catálogo, campañas activas): caché de 30-60 segundos
- **Datos por usuario:** sin caché o caché muy corto
- **Imágenes:** caché largo con CDN
- **Revalidación on-demand** cuando cambian datos (revalidatePath/revalidateTag)

### Bases de datos

- **Índices** en columnas de búsqueda frecuente (campaign_id, user_id, status, slug)
- **Vistas materializadas** para agregaciones costosas (campaign_progress, seller_stats)
- **Paginación** en todos los listados
- **Selectores eficientes:** traer solo los campos necesarios

### Bundle

- **Code splitting automático** de Next.js
- **Dynamic imports** para componentes pesados (chat, gráficos)
- **Tree shaking** verificable con `next build`
- **Análisis con `@next/bundle-analyzer`** periódicamente

---

## 12. Testing

### Estrategia

- **Tests unitarios** para lógica de negocio crítica (cálculo de precios, comisiones, descuentos)
- **Tests de integración** para flujos completos (reservar en campaña, completar compra)
- **Tests end-to-end** con Playwright para flujos críticos en producción

### Qué priorizar testear

1. Cálculo de precios escalonados al cerrar campañas
2. Cálculo de comisiones de vendedores con bonus por escalones
3. Cálculo de saldos y ajustes por mejor precio
4. Validación de permisos por rol
5. Flujo completo de checkout con distintos métodos de pago
6. Procesamiento de webhooks de Mercado Pago

### Herramientas

- **Vitest** para unit tests
- **Playwright** para e2e
- **MSW** para mocking de APIs externas
- **Testing Library** para tests de componentes

---

## 13. Flujos críticos del sistema

> **Referencia rápida. Para detalle completo, ver `/docs/FLOWS.md`.**

### Flujo: Reservar en una campaña

1. Usuario navega al detalle de una campaña activa
2. Selecciona cantidad de unidades
3. El sistema muestra precio actual + cálculo de seña (30%) + saldo estimado
4. Usuario hace clic en "Reservar"
5. Si no está logueado, lo manda a login/registro
6. Va al checkout: elige método de pago, confirma dirección de envío estimada
7. Paga la seña
8. Webhook de MP confirma el pago
9. Se crea la reserva en `campaign_reservations` con estado `activa`
10. Se actualiza el progreso de la campaña
11. Si la cantidad cruzó un escalón, todos los participantes ven el nuevo precio
12. Usuario recibe email + notificación in-app de confirmación
13. Si el usuario llegó por link de vendedor o por link de atribución compartido, se registra

### Flujo: Cerrar una campaña

1. Cron job verifica campañas con `fecha_cierre <= NOW()` y estado `activa`
2. Para cada una:
   - Si cantidad reservada >= MOQ: pasa a estado `cerrada_exitosa`
   - Si cantidad reservada < MOQ: pasa a estado `cerrada_fallida`
3. Si exitosa:
   - Calcular precio final según escalón alcanzado
   - Para cada reserva: calcular saldo a pagar = (precio final × cantidad) - seña pagada
   - Si saldo es negativo (pagaron de más en seña): generar crédito en cuenta
   - Notificar a todos los participantes con su saldo a pagar
4. Si fallida:
   - Reembolsar todas las señas al método de pago original
   - Notificar a participantes con opción de dejar el dinero como crédito + 5% bonus

### Flujo: Comprar en marketplace

1. Usuario navega al detalle de una publicación
2. Hace clic en "Comprar"
3. Va al checkout con resumen de orden + envío + comisión visible
4. Paga el total a Mercado Nuestro
5. Sistema crea `marketplace_orders` con estado `pagada`, el dinero queda retenido (escrow)
6. Revendedor recibe notificación inmediata con datos de envío
7. Revendedor despacha en máximo 3 días hábiles y marca como `despachada`
8. Comprador recibe notificación de envío con tracking
9. Cuando se confirma entrega (o pasan 3 días sin reclamo): el dinero se libera al revendedor menos comisión
10. Comprador puede dejar reseña en plazo de 30 días

### Flujo: Comisión de vendedor por catálogo

1. Visitante entra por link `mercadonuestro.uy/v/maria-perez`
2. Sistema graba cookie con `seller_slug` y expiración 30 días desde última actividad
3. Si el visitante hace cualquier reserva o compra dentro del plazo: se atribuye a María
4. Si el visitante se registra (crea cuenta) por el link: María queda como su vendedor de referencia permanente
5. Al confirmarse la entrega de la compra atribuida, la comisión pasa de `pendiente` a `consolidada`
6. María ve su comisión en el panel
7. Cuando junta USD 20 mínimo, solicita retiro
8. Primer ciclo del mes siguiente (días 1-5 hábiles), se procesa el pago
9. Se registra en `commission_payouts`

---

## 14. Cómo trabajar con Claude Code en este proyecto

### Antes de empezar cualquier tarea

1. **Leé este CLAUDE.md completo**
2. **Revisá la sección 2 (Estado actual)** para saber dónde estamos
3. **Si la tarea involucra reglas de negocio, releé la sección 5 y `/docs/BUSINESS.md`**
4. **Si la tarea es nueva o ambigua, preguntá antes de asumir**

### Durante el trabajo

- **Trabajá en chunks chicos.** No intentes hacer toda una funcionalidad de una. Implementá una pieza, validá, seguí.
- **Verificá el código generado.** Especialmente lógica de pagos, cálculo de precios, validaciones de permisos.
- **Mantené el repo limpio.** No dejar archivos temporales, console.logs olvidados, código comentado.
- **Tests para lógica crítica.** Cualquier función que calcula dinero o aplica permisos debería tener test.

### Al terminar una funcionalidad

1. **Actualizar la sección 2 de este archivo** con lo recién completado
2. **Si hubo decisiones técnicas nuevas, agregar a `/docs/DECISIONS.md`**
3. **Commit con mensaje claro en español:** ej. `feat(campañas): implementar cálculo de precio escalonado al cierre`
4. **Probar el flujo manualmente** antes de dar por hecho

### Convenciones de commits

Formato: `tipo(scope): descripción`

Tipos:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` refactor sin cambio funcional
- `docs:` cambios en documentación
- `test:` agregar o modificar tests
- `chore:` tareas de mantenimiento (deps, configs)
- `perf:` mejoras de performance

Mensajes en español, en sentencia (no imperativo).

### Cuando algo no está claro

- **Preguntar al usuario** antes de improvisar
- **No inventar reglas de negocio.** Si no está documentado, preguntá.
- **Marcar como TODO** las decisiones pendientes
- **Documentar la pregunta en `/docs/DECISIONS.md`** una vez resuelta

---

## 15. Cosas que NUNCA hacer

> **Estas reglas son taxativas. Si parece que necesitás hacer alguna de estas, parar y preguntar.**

1. **Nunca usar `service_role_key` de Supabase desde el cliente.** Solo en server con autorización validada.
2. **Nunca confiar en validaciones del cliente.** Siempre revalidar en server.
3. **Nunca commitear credenciales o secretos.** Si pasa, revocar inmediatamente.
4. **Nunca usar floats para almacenar dinero.** Siempre integer en centavos.
5. **Nunca asumir el rol de un usuario.** Verificar siempre.
6. **Nunca permitir SQL crudo construido con strings concatenados.** Usar el cliente de Supabase o queries parametrizadas.
7. **Nunca renderizar HTML de usuarios sin sanitizar.** Riesgo de XSS.
8. **Nunca borrar registros de transacciones.** Marcar como cancelados/anulados pero conservar.
9. **Nunca cobrar más que lo mostrado al usuario.** Si el cálculo final es mayor, hubo un bug.
10. **Nunca enviar emails masivos sin opt-in del usuario.** Cumplir con preferencias de comunicación.
11. **Nunca exponer datos de un usuario a otro.** Solo lo público (nombre comercial, reputación).
12. **Nunca permitir publicar en marketplace lo que el usuario no recibió realmente.** Validar contra stock real.
13. **Nunca aplicar comisiones de forma inconsistente.** Las reglas están en `commission_tiers` y en sección 5.7.
14. **Nunca confiar en webhooks sin verificar firma.** Validar siempre.
15. **Nunca devolver más dinero que lo cobrado en reembolsos.** Validar el monto contra el pago original.

---

## 16. Variables de entorno

Crear `.env.local` (no commitear) con estas variables:

```bash
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hola@mercadonuestro.uy

# Twilio (Fase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
TWILIO_SMS_NUMBER=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Configuración de la app
DEFAULT_CURRENCY=USD
ADMIN_EMAIL=
DEFAULT_TIMEZONE=America/Montevideo

# Feature flags (para activar/desactivar funcionalidades)
FEATURE_MARKETPLACE_ENABLED=false
FEATURE_CATALOG_SELLERS_ENABLED=false
FEATURE_WHATSAPP_LOGIN=false
FEATURE_LIVE_SHOPPING=false
```

---

## 17. Fases del proyecto

### Fase 0 — Preparación (semanas 1-2)

Setup del proyecto, trámites legales iniciales, definición de identidad visual, primeros productos para campañas, configuración de servicios.

### Fase 1 — MVP (semanas 3-10)

Plataforma funcional con:
- Autenticación (email + Google)
- Catálogo público con campañas
- Reservas con seña vía Mercado Pago
- Panel de usuario básico
- Stock disponible con compra inmediata
- Panel admin para gestionar campañas
- Comunicaciones automáticas por email

**Criterio de éxito:** 1 campaña real cerrada exitosamente.

### Fase 2 — Expansión (semanas 11-22)

- Vendedores por catálogo completos
- Marketplace de reventa
- Sistema de reseñas y reputación
- WhatsApp integrado
- Integración local físico
- Propuestas comunitarias

**Criterio de éxito:** 20+ vendedores activos, marketplace con 50+ publicaciones.

### Fase 3 — Escala (semanas 23-40)

- Lives shopping
- Importadores avanzados
- App móvil nativa
- Cotizaciones a pedido
- Programa de referidos

**Criterio de éxito:** plataforma consolidada con miles de usuarios activos.

---

## 18. Identidad de marca

- **Nombre:** Mercado Nuestro
- **Tagline sugerido:** "Importá en grupo, pagá precio mayorista"
- **Valores que transmite:** comunidad, transparencia, ahorro, confianza local
- **Tono de comunicación:** rioplatense cercano, claro, sin tecnicismos innecesarios
- **Local físico:** Leandro Gómez 1076, Paysandú, Uruguay
- **Dominio principal:** mercadonuestro.uy (validar disponibilidad)

---

## 19. Contactos y servicios

> **Esta sección se completa a medida que se contratan servicios.**

- **Despachante de aduana:** (pendiente)
- **Contador:** (pendiente)
- **Abogado:** (pendiente)
- **Empresa de logística:** (pendiente, ya identificada por el dueño)
- **Mercado Pago:** cuenta de negocio (pendiente activación)
- **Hosting Supabase:** (pendiente)
- **Hosting Vercel:** (pendiente)

---

## 20. Glosario

- **MOQ:** Minimum Order Quantity. Cantidad mínima de unidades para que una campaña se ejecute.
- **FOB:** Free On Board. Precio del producto en el puerto de origen, sin incluir flete ni seguros.
- **Escalón de precio:** rango de cantidad con un precio asociado. Al cruzar un escalón, el precio mejora para todos.
- **Seña:** pago parcial (30% por defecto) que el usuario hace al reservar en una campaña.
- **Saldo:** monto restante a pagar al cerrar exitosamente una campaña.
- **Escrow:** mecanismo donde la plataforma retiene el pago hasta confirmar la entrega.
- **Atribución:** asociación de una venta a un vendedor por catálogo via cookie o link.
- **Consolidación:** estado de una comisión cuando se confirma la entrega y queda disponible para retirar.
- **Vendedor por catálogo:** usuario que comparte su catálogo digital y cobra comisión.
- **Revendedor:** usuario que importó y publica en marketplace.
- **Importador avanzado:** usuario que abre sus propias campañas (Fase 3).
- **RUT:** Registro Único Tributario uruguayo. Identificador fiscal de empresas.
- **DGI:** Dirección General Impositiva de Uruguay.
- **CFE:** Comprobante Fiscal Electrónico. Sistema obligatorio de facturación en Uruguay.

---

## 21. Recordatorio final

Este documento es el cerebro escrito del proyecto. Si está bien mantenido, cualquier sesión nueva de Claude Code puede arrancar al día sin preguntar nada al usuario sobre el contexto general.

**Mantenelo actualizado:**
- Sección 2 (estado actual): después de cada funcionalidad implementada
- Sección 5 (reglas): cuando se decidan cambios o aclaraciones
- Sección 19 (contactos): cuando se contraten servicios
- Otras secciones: cuando cambien las bases del proyecto

**Si llegás al final de este documento, ya tenés todo lo que necesitás para empezar a programar Mercado Nuestro.** Cualquier duda específica, está en los documentos complementarios en `/docs/`. Si algo no está en ninguna parte, preguntá al usuario antes de improvisar.
