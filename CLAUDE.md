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
- `.gitignore` ajustado para excluir `.env*` pero permitir `.env.example` versionado.
- `AGENTS.md` (generado por Next.js) preservado en raíz — contiene la advertencia oficial de Next 16 sobre breaking changes vs versiones anteriores.
- Build de producción pasa sin errores (TypeScript OK, 4 páginas estáticas generadas).
- Dev server arranca en ~1.5s en `http://localhost:3000`.

**Pendiente en cimientos técnicos:** `git init` en raíz (la carpeta vive en OneDrive, confirmar con el dueño si se usa así o se mueve), cliente Supabase (`src/lib/supabase/{client,server,middleware}.ts`), primera migración SQL con tablas troncales, políticas RLS base, layout principal (`src/app/layout.tsx`) con header/footer y tipografía.

**Próxima funcionalidad a implementar:** Configurar cliente Supabase (server + client + middleware con `@supabase/ssr`) y crear la primera migración con las tablas troncales identificadas en sección 8 del CLAUDE.md y bloque 4 del MASTER (`users` extendido, `user_roles`, `user_addresses`, `categories`, `products`, `campaigns`, `campaign_pricing_tiers`). RLS obligatorio en todas las tablas con datos de usuarios.

**Última decisión técnica tomada:** Adoptar Next.js 16 (no 15) y Tailwind v4 (no v3) porque son las versiones que instala `create-next-app@latest` hoy. Trae breaking changes vs Next 15: Turbopack por default, React 19.2.4, Tailwind v4 con config CSS-first (sin `tailwind.config.ts`). Sección 3 del CLAUDE.md actualizada con versiones reales.

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
