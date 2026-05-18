# Arquitectura

> Versión resumida. Para profundidad ver MASTER (Bloque 5).

## Stack

- **Next.js 16.2.6** App Router con Turbopack.
- **TypeScript estricto** (`strict: true`).
- **Tailwind CSS v4** con tokens en `src/app/globals.css`.
- **shadcn/ui** preset `base-nova` (componentes copiados en `src/components/ui`).
- **Supabase** Postgres + Auth + Storage + Realtime. Region `sa-east-1`.
- **Mercado Pago** Uruguay (stub local).
- **Resend** (stub local), **Twilio SMS / WhatsApp** (stubs).
- **Vercel** para hosting + Crons.

## Carpetas claves

```
src/
├─ app/
│  ├─ (public)/   # rutas sin auth
│  ├─ (auth)/     # login, registro, etc.
│  ├─ (user)/     # requiere sesión
│  ├─ admin/      # requiere rol admin
│  └─ api/        # webhooks, cron, route handlers
├─ components/
├─ lib/
│  ├─ supabase/   # client.ts, server.ts, middleware.ts, admin.ts (service role)
│  ├─ mercadopago/
│  ├─ email/
│  ├─ sms/
│  ├─ whatsapp/
│  ├─ notifications/
│  └─ validations/  # zod schemas
└─ types/
   └─ database.ts  # tipos generados/curados de Supabase
```

## Patrones

- **Server Actions con `useActionState`** para todos los forms. `initialState` + types en `state.ts` paralelo a `actions.ts`.
- **Server Components por defecto**, `"use client"` solo cuando hay estado.
- **Helpers `cn()`** para componer clases Tailwind.
- **`Reveal` / `Stagger`** para animaciones (motion v12), respetan `prefers-reduced-motion`.
- **RLS obligatorio** en toda tabla con datos de usuarios. Admin policies en migración separada.

## Seguridad

- `service_role_key` solo en `src/lib/supabase/admin.ts`, usado en webhooks y cron endpoints.
- Cron endpoints validan `Authorization: Bearer ${CRON_SECRET}`.
- Webhook de Mercado Pago valida firma con `MERCADOPAGO_WEBHOOK_SECRET` cuando esté disponible.
- Dinero siempre en `bigint` de centavos USD.
- Zod en cada server action.

## Performance

- `revalidate = 60` en home y listados públicos.
- `revalidatePath()` después de mutaciones.
- `next/image` con `remotePatterns` para Supabase Storage, Unsplash y placehold.co.
