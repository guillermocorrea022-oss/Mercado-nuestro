# Prompts útiles para Claude Code

> Atajos para tareas recurrentes. Pegar al inicio de la sesión.

## Crear una campaña nueva en producción

```
Necesito crear una campaña de importación de [PRODUCTO].
Datos:
- Categoría: ...
- Brand: ...
- Descripción corta: ...
- MOQ: ...
- Cantidad máxima: ...
- Escalones (cantidad / precio USD por unidad):
  - 1-X / USD ...
  - X+1-Y / USD ...
  - Y+1+ / USD ...
- Fecha de cierre: ...
- Fecha estimada de llegada: ...

Generá la migración SQL (o la inserción) y el seed correspondiente.
```

## Investigar por qué un cron falló

```
Revisá los logs de /api/cron/[nombre] de las últimas 24h en Vercel.
Si veo un error en una RPC, hace el plan de fix en la SQL function correspondiente.
No apliques cambios sin que yo confirme.
```

## Agregar un nuevo tipo de notificación

```
Quiero un tipo de notificación nuevo: "[KEY]".
- Se dispara cuando: ...
- El usuario afectado es: ...
- Canales soportados: in_app, email (opcional sms/whatsapp)

Hacé:
1. Agregar el tipo al array TYPES en NotificationPreferencesForm.tsx.
2. Llamar createNotification() en el server action correspondiente.
3. Si requiere email, crear template en src/lib/email/send.ts.
```

## Cambiar la comisión del marketplace

```
Quiero subir/bajar la comisión del marketplace al X%.
Actualizalo en `settings` (key `marketplace_commission_pct`) y verificá que
createMarketplaceOrderAction la lea correctamente.
```

## Revertir una migración

```
La migración [TIMESTAMP_FILENAME] introdujo un bug.
Generá una migración de rollback. NO modifiques la original (versionada).
```

## Generar tipos de Supabase

```
Regenerá src/types/database.ts a partir del schema actual.
(Si no hay Docker, hacelo a mano siguiendo el patrón existente.)
```

## Activar Mercado Pago real

```
Las credenciales de MP están en .env.local:
MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY, MERCADOPAGO_WEBHOOK_SECRET.

1. Buscar `TODO(MP)` en src/lib/mercadopago/client.ts y reemplazar el mock con el SDK real.
2. Buscar `TODO(MP)` en src/app/api/webhooks/mercadopago/route.ts.
3. Probar un flujo real de reserva → pago → webhook.
```
