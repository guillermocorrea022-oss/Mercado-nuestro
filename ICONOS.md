# ICONOS.md — Sistema de íconos de Mercado Nuestro

> Este archivo documenta los 24 íconos del sistema visual de Mercado Nuestro y dónde usar cada uno. Es referencia obligatoria para componentes de UI, navegación, formularios y cualquier elemento visual que requiera íconos.
>
> **Regla de oro:** los íconos comunican significado visualmente. Usar siempre el ícono correcto para cada acción ayuda al usuario a entender la interfaz sin leer.

---

## Estructura de archivos

Cada ícono tiene **dos versiones** según el color de fondo donde se va a usar:

```
/iconos
├── /color/    → Versión a color (azul + amarillo) para fondos CLAROS
│   ├── carrito.png
│   ├── pagar.png
│   └── ... (24 archivos)
│
├── /blanco/   → Versión blanca + amarillo para fondos OSCUROS o AZULES
│   ├── carrito.png
│   ├── pagar.png
│   └── ... (24 archivos)
│
└── ICONOS.md  → Este archivo
```

**Importante:** los nombres son idénticos en ambas carpetas. Para cambiar la versión, solo cambia la carpeta:
- `iconos/color/carrito.png` → para fondo blanco
- `iconos/blanco/carrito.png` → para fondo azul

---

## Características técnicas

- **Cantidad:** 24 íconos × 2 versiones = 48 archivos
- **Estilo:** outline (línea) con acentos en relleno amarillo
- **Colores oficiales:**
  - Azul Nuestro `#1E3FA8` (RGB 30, 63, 168)
  - Amarillo Nuestro `#FFC107` (RGB 255, 193, 7)
- **Formato:** PNG con fondo transparente
- **Resolución nativa:** 1254x1254 píxeles (alta calidad)
- **Tamaño promedio:** ~150-300 KB por archivo

---

## Regla principal: ¿qué versión uso?

| Fondo del componente | Carpeta a usar |
|---|---|
| Blanco | `color/` |
| Gris claro | `color/` |
| Beige/crema | `color/` |
| Azul de marca (#1E3FA8) | `blanco/` |
| Negro o gris oscuro | `blanco/` |
| Foto oscura o con saturación | `blanco/` |

**¿Por qué dos versiones?** Porque los íconos a color tienen azul en su composición. Si usás un ícono azul sobre un fondo azul, no se ve. Las versiones blancas se diseñaron especialmente para fondos oscuros.

---

## Catálogo completo de íconos

### Comercio y ventas

| Archivo | Cuándo usarlo |
|---|---|
| `carrito.png` | Carrito de compras en navbar, página de carrito, botón "Agregar al carrito" |
| `pagar.png` | Métodos de pago, checkout, botón "Pagar ahora", confirmaciones de pago |
| `tienda.png` | Local físico de Paysandú, sección "Visitá nuestra tienda", marcador de tiendas afiliadas |
| `oferta.png` | Promociones, descuentos, sección "Ofertas", banner de campañas con precio reducido |
| `billetera.png` | Saldo en cuenta, créditos del usuario, métodos de pago guardados |
| `paquete.png` | Productos individuales, packaging, contenido de pedidos |
| `categorias.png` | Página de categorías de productos, filtro de categorías, menú de navegación |

### Importación y logística

| Archivo | Cuándo usarlo |
|---|---|
| `importar.png` | Sección de importaciones, página principal de campañas de importación |
| `campana_importacion.png` | Campañas activas, detalle de campaña, estado "En importación" |
| `envios.png` | Página de envíos, estado de pedido "En camino", configuración de envío |
| `ubicacion.png` | Dirección de envío, ubicación del local, dirección del usuario, mapa |
| `devoluciones.png` | Política de devoluciones, reclamos, devoluciones de producto |

### Usuario y cuenta

| Archivo | Cuándo usarlo |
|---|---|
| `usuario.png` | Avatar genérico, perfil del usuario, login, sección "Mi cuenta" |
| `favoritos.png` | Lista de deseos, botón "Guardar en favoritos", productos guardados |
| `pedidos.png` | Historial de pedidos, sección "Mis pedidos", estado de pedido |
| `notificaciones.png` | Campanita de notificaciones en navbar, centro de notificaciones, configuración de avisos |

### Vendedores y comunidad

| Archivo | Cuándo usarlo |
|---|---|
| `vendedor.png` | Perfil de vendedor, sección "Soy vendedor", catálogo de vendedor |
| `compra_grupal.png` | Función de compra grupal, "Sumate al grupo", participantes de campaña |
| `catalogo.png` | Catálogo del vendedor, sección "Materiales", manual de vendedor |
| `opiniones.png` | Reseñas y opiniones, calificaciones, botón "Dejar opinión" |

### Soporte y ayuda

| Archivo | Cuándo usarlo |
|---|---|
| `soporte.png` | Atención al cliente, chat de soporte, contacto |
| `seguridad.png` | Compra protegida, garantía, mensajes de "Pago seguro", certificados |
| `centro_ayuda.png` | Centro de ayuda, FAQ, manual del usuario, documentación |
| `buscar.png` | Barra de búsqueda, filtros, "Buscar productos", lupa en navbar |

---

## Mapeo de íconos por sección de la plataforma

### Navbar principal (todas las páginas)

Si el navbar tiene **fondo blanco** → usar `color/`. Si tiene **fondo azul** → usar `blanco/`.

- `buscar.png` — barra de búsqueda
- `carrito.png` — carrito de compras con badge de cantidad
- `notificaciones.png` — campanita con badge de no leídos
- `usuario.png` — menú de usuario / login

### Home

- `campana_importacion.png` — sección "Campañas activas"
- `oferta.png` — sección "Ofertas destacadas"
- `categorias.png` — sección "Explorá por categoría"
- `tienda.png` — sección "Visitá nuestro local"

### Detalle de producto

- `carrito.png` — botón "Agregar al carrito"
- `favoritos.png` — botón "Guardar en favoritos"
- `compra_grupal.png` — botón "Sumarme a la compra grupal"
- `seguridad.png` — sello "Compra protegida"
- `envios.png` — información de envío
- `devoluciones.png` — link a política de devoluciones

### Detalle de campaña

- `compra_grupal.png` — sección "Participantes"
- `campana_importacion.png` — header de la campaña
- `importar.png` — proceso de importación
- `envios.png` — fecha estimada de llegada

### Panel de usuario

- `usuario.png` — sección perfil
- `pedidos.png` — sección "Mis pedidos"
- `favoritos.png` — sección "Lista de deseos"
- `ubicacion.png` — sección "Direcciones"
- `pagar.png` — sección "Métodos de pago"
- `billetera.png` — sección "Saldo en cuenta"
- `notificaciones.png` — sección "Preferencias de notificaciones"

### Panel de vendedor

- `vendedor.png` — header del panel
- `catalogo.png` — sección "Mi catálogo"
- `billetera.png` — sección "Mis comisiones"
- `opiniones.png` — sección "Reseñas de clientes"
- `compra_grupal.png` — sección "Mis clientes"

### Panel de revendedor (marketplace)

- `paquete.png` — sección "Mis productos publicados"
- `envios.png` — sección "Pedidos a despachar"
- `billetera.png` — sección "Mis ventas"
- `opiniones.png` — sección "Mis reseñas"

### Panel administrativo

- `campana_importacion.png` — gestión de campañas
- `paquete.png` — gestión de productos
- `pedidos.png` — gestión de pedidos
- `usuario.png` — gestión de usuarios
- `devoluciones.png` — gestión de reclamos
- `billetera.png` — reportes financieros

### Footer

Generalmente el footer es azul → usar **versión `blanco/`** de todos estos:

- `tienda.png` — dirección del local
- `soporte.png` — link a atención al cliente
- `centro_ayuda.png` — link a FAQ y ayuda
- `seguridad.png` — sello de compra segura

### Checkout

- `pagar.png` — paso de pago
- `ubicacion.png` — paso de dirección
- `envios.png` — paso de método de envío
- `seguridad.png` — mensaje de seguridad

---

## Tamaños recomendados

| Contexto | Tamaño |
|---|---|
| Ícono en navbar (badge) | 24x24 px |
| Ícono en botones | 16x16 px o 20x20 px |
| Ícono en cards de producto | 24x24 px |
| Ícono en encabezados de sección | 48x48 px |
| Ícono en hero/banner | 80x80 px o 120x120 px |
| Ícono en estado vacío (empty state) | 96x96 px |
| Ícono en feature/value cards (home) | 64x64 px |

---

## Uso en código (Next.js + Tailwind)

### Ícono simple sobre fondo blanco

```jsx
import Image from 'next/image'

<Image
  src="/iconos/color/carrito.png"
  alt="Carrito"
  width={24}
  height={24}
/>
```

### Ícono sobre fondo azul (navbar oscuro, hero)

```jsx
<section className="bg-brand-blue py-20">
  <Image
    src="/iconos/blanco/carrito.png"  // ⚠️ Usar carpeta "blanco"
    alt="Carrito"
    width={48}
    height={48}
  />
</section>
```

### Ícono en botón con texto

```jsx
<button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded">
  <Image
    src="/iconos/blanco/carrito.png"  // Versión blanca para botón azul
    alt=""
    width={20}
    height={20}
  />
  Agregar al carrito
</button>
```

### Ícono adaptativo (cambia según contexto del componente)

```jsx
function IconAdaptivo({ name, fondo = 'claro', size = 24 }) {
  const variante = fondo === 'oscuro' ? 'blanco' : 'color'
  return (
    <Image
      src={`/iconos/${variante}/${name}.png`}
      alt={name}
      width={size}
      height={size}
    />
  )
}

// Uso:
<IconAdaptivo name="carrito" fondo="claro" size={24} />
<IconAdaptivo name="carrito" fondo="oscuro" size={48} />
```

### Ícono en card de sección (home)

```jsx
<div className="bg-white p-6 rounded-xl shadow">
  <Image
    src="/iconos/color/compra_grupal.png"
    alt=""
    width={48}
    height={48}
    className="mb-4"
  />
  <h3 className="text-lg font-bold">Compra Grupal</h3>
  <p className="text-gray-600">
    Sumate con más personas y conseguí mejor precio.
  </p>
</div>
```

### Ícono en navbar con badge

```jsx
<button className="relative">
  <Image
    src="/iconos/color/carrito.png"
    alt="Carrito"
    width={28}
    height={28}
  />
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    3
  </span>
</button>
```

---

## Reglas de uso

### Lo que SÍ hacer

✅ Usar la versión correcta según el fondo (color/ para fondos claros, blanco/ para fondos oscuros)
✅ Usar el ícono que mejor representa la acción o sección  
✅ Mantener tamaños proporcionales: si en una pantalla todos los íconos de menú son 24x24, mantener esa medida  
✅ Combinar ícono + texto cuando la acción no es obvia visualmente  
✅ Espaciar correctamente: dejar al menos 8-12 px entre ícono y texto  
✅ Usar el mismo ícono para la misma acción en todas las pantallas (consistencia)

### Lo que NO hacer

❌ **No usar íconos `color/` sobre fondos azules u oscuros** — usar la versión `blanco/`
❌ **No usar íconos `blanco/` sobre fondos blancos o claros** — son invisibles  
❌ **No cambiar los colores del ícono** — son parte de la identidad de marca  
❌ **No deformar los íconos** — siempre mantener proporciones cuadradas  
❌ **No usar dos íconos distintos para la misma acción** — confunde al usuario  
❌ **No usar íconos sin alt text** — son críticos para accesibilidad  
❌ **No combinar este set con íconos de otra librería** (ej: Lucide, Heroicons) — rompe la coherencia visual  
❌ **No usar el ícono de "favoritos" para "me gusta"** — son acciones distintas  
❌ **No achicar íconos a menos de 16x16 px** — pierden legibilidad

---

## Para Claude Code

Cuando estés programando un componente nuevo y necesites usar un ícono:

1. **Consultá esta lista primero** antes de inventarte uno o usar Lucide
2. **Identificá el fondo** del componente donde va el ícono:
   - Fondo blanco/claro → carpeta `color/`
   - Fondo azul/oscuro → carpeta `blanco/`
3. **Buscá por categoría** (Comercio, Importación, Usuario, etc.) o por sección de la plataforma
4. **Si el caso no está cubierto**, preferí dejar el ícono pendiente y avisar al usuario, antes que usar uno de Lucide que rompe la coherencia visual
5. **Usá tamaños consistentes** dentro de cada componente: si una card usa 48x48, todas las cards similares deberían usar lo mismo
6. **Acordate del `alt` text** para accesibilidad: si el ícono va solo, descriptivo (`alt="Carrito"`), si va con texto al lado, decorativo (`alt=""`)

---

## Limitaciones actuales y pendientes

**Limitación: solo formato PNG**  
Los íconos están en PNG. Para uso en alta resolución (impresión, retina displays grandes) conviene vectorizarlos a SVG. Vectorizer.AI puede hacerlo bien con estos íconos por su estilo lineal limpio.

**Pendientes para versión 2.0:**
- Vectorizar a SVG para uso en alta resolución
- Crear variantes "filled" (relleno completo) vs "outline" (solo línea) para indicar estados activos
- Agregar íconos faltantes que pueden hacer falta a medida que crezca la plataforma: chat, calendario, configuración (engranaje), salir (logout), filtros, cerrar (X), check, error, advertencia, info

---

## Versionado

- **Versión actual:** 1.0 (24 íconos × 2 versiones = 48 archivos PNG)
- **Última actualización:** Fase 0 del proyecto
- **Resolución:** alta calidad (1254x1254 píxeles)
