# Separación Marketplace ↔ Campañas

> Documento de referencia para mantener la regla crítica del `ESTRUCTURA_APP.md` §"Errores típicos a evitar" #5:
>
> **"Marketplace (Mercado Nuestro) y Campañas son MUNDOS SEPARADOS, NO mezclan productos. El marketplace solo tiene productos disponibles en Uruguay. Las campañas son productos a importar."**

---

## Estado actual del schema (analizado en FASE 5 de la migración)

El schema **ya respeta la separación** a nivel de tablas. No se requiere migración de BD para separar las dos secciones — solo se requiere disciplina en las queries del frontend.

### Tablas que pertenecen al MARKETPLACE (Mercado Nuestro tienda)

| Tabla | Rol |
|---|---|
| `inventory_items` | Stock propio de la empresa (importado por Mercado Nuestro) |
| `marketplace_listings` | Publicaciones de revendedores (Fase 1) |
| `marketplace_listing_reviews` | Reseñas de listings |
| `marketplace_messages` | Chat comprador ↔ vendedor |
| `marketplace_orders` | Pedidos de marketplace |

### Tablas que pertenecen a CAMPAÑAS

| Tabla | Rol |
|---|---|
| `campaigns` | Campañas de importación grupal |
| `campaign_pricing_tiers` | Escalones de precio por volumen |
| `campaign_reservations` | Reservas con seña |
| `campaign_status_updates` | Updates del estado de la campaña |
| `campaign_progress_view` | Vista de progreso al MOQ |

### Tablas COMPARTIDAS (catálogo universal)

| Tabla | Por qué se comparte |
|---|---|
| `products` | Catálogo maestro de SKUs. Un mismo producto puede ser importado en una campaña, después tener stock disponible, y eventualmente ser revendido. Mantener tres copias sería duplicación inútil. |
| `product_variants` | Variantes (color/talle) del producto — misma lógica que arriba |
| `categories` | Categorías universales (Electrónica, Hogar, etc.) |
| `orders`, `order_items`, `payments` | Tabla unificada de transacciones (un pedido puede mezclar items del marketplace, pero NUNCA mezcla con seña de campaña porque las campañas usan `campaign_reservations`) |

---

## Reglas duras para mantener la separación en código

### ✅ Permitido

- En `src/app/app/marketplace/page.tsx`: query `marketplace_listings` y/o `inventory_items` con `status = 'activa'` y `quantity_available > 0`
- En `src/app/app/campanas/page.tsx`: query `campaigns` con `status = 'activa'`
- Compartir `products` (FK desde ambos) para mostrar nombre, fotos, descripción del producto

### ❌ Prohibido

- **NUNCA** hacer un `UNION` entre `marketplace_listings` y `campaigns` para mostrar todo junto
- **NUNCA** mostrar campañas dentro del listado del marketplace (`/app/marketplace`)
- **NUNCA** mostrar items del marketplace dentro del listado de campañas (`/app/campanas`)
- **NUNCA** indexar campañas en el buscador del marketplace (`?q=…` en `/app/marketplace` filtra solo `marketplace_listings` + `inventory_items`)
- **NUNCA** indexar items del marketplace en el buscador de campañas

### Buscador global del header

El buscador de la barra 2 del header (`form action="/app/marketplace"`) por convención lleva al marketplace. Si en el futuro se agrega un buscador GLOBAL (que devuelva tanto productos como campañas), debe mostrar los resultados en **secciones separadas** con etiquetas claras "Productos disponibles" vs "Campañas activas", no en una sola lista mezclada.

---

## Conclusión de FASE 5

**No se requiere migración**. El schema actual respeta la separación de mundos. La disciplina se mantiene a nivel de:

1. **Queries del backend** — `marketplace_listings`/`inventory_items` vs `campaigns` viven en archivos separados
2. **Rutas del frontend** — `/app/marketplace/*` vs `/app/campanas/*` son árboles separados
3. **UI** — cards de producto vs cards de campaña son componentes distintos (`CampaignCard` vs `ListingCard`)

Si en el futuro se quiere reforzar la separación a nivel de BD (ej: prohibir que un mismo `product_id` esté simultáneamente en una campaña activa y en un listing activo), se puede agregar una constraint o trigger. Por ahora se confía en la disciplina del frontend.
