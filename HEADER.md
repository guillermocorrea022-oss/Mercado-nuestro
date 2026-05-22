# HEADER.md — Header doble de Mercado Nuestro

> Especificación completa del header de la Web App. Tres barras apiladas, inspiradas en la arquitectura de Mercado Libre pero adaptadas a la identidad de Mercado Nuestro. Este es el componente más importante de la interfaz porque persiste en TODAS las páginas de la Web App.

---

## Estructura visual general

El header tiene **3 barras apiladas**, cada una con un rol específico:

```
┌─────────────────────────────────────────────────────────────────────┐
│ BARRA 1 (azul, compacta): Promos + Ubicación + Cuenta + Mis compras │ ← 36px
├─────────────────────────────────────────────────────────────────────┤
│ BARRA 2 (blanca, principal): Logo + Buscador + Carrito + Avatar     │ ← 72px
├─────────────────────────────────────────────────────────────────────┤
│ BARRA 3 (blanca con borde, navegación): Categorías + Secciones      │ ← 48px
└─────────────────────────────────────────────────────────────────────┘
                              [resto de la página]
```

Total: aproximadamente **156px de alto en desktop**. En mobile se compacta (ver sección "Comportamiento responsive").

---

## BARRA 1 — Promo + Cuenta (la superior, color de marca)

**Función:** mostrar info breve y persistente (promos, ubicación) + accesos rápidos a la cuenta.

**Fondo:** Azul Principal `#0D47B6`
**Altura:** 36px
**Color de texto:** Blanco `#FFFFFF`
**Tipografía:** 13px regular

### Contenido (de izquierda a derecha)

**Lado izquierdo:**
- 🚚 **"Envío gratis en compras desde $1.500"** (notificación promocional, editable desde admin)
- 📍 **"Enviar a Paysandú"** (cambia según la ubicación detectada/elegida) — clickeable, abre modal para cambiar ubicación

**Lado derecho:**
- **"Creá tu cuenta"** (solo visible si NO está logueado)
- **"Ingresá"** (solo visible si NO está logueado)
- **"Hola, [Nombre]"** (solo visible si está logueado)
- **"Mis compras"** (siempre visible)

### Ejemplo visual

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🚚 Envío gratis desde $1.500   📍 Enviar a Paysandú      Creá tu cuenta │ Ingresá │ Mis compras │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Comportamiento en mobile

En pantallas < 768px:
- Se oculta la promo de envío gratis (se mueve a un banner en la home)
- Se oculta "Mis compras" (queda en el menú hamburguesa)
- Solo queda: 📍 ubicación a la izquierda, "Ingresá" a la derecha

---

## BARRA 2 — Buscador y cuenta (la del medio, principal)

**Función:** la barra más importante. Logo grande, buscador prominente, accesos rápidos.

**Fondo:** Blanco `#FFFFFF`
**Altura:** 72px
**Padding lateral:** 24px (o usar contenedor con max-width)

### Contenido (de izquierda a derecha)

**Logo (versión horizontal a color):**
- Archivo: `/iconos/color/mercado_nuestro_horizontal.png` (o el logo que tengas)
- Altura: 48px (con padding lateral incluido)
- Clickeable: lleva a `/app` (home del marketplace)

**Buscador (el elemento más visible):**
- Ancho: flexible, ocupa todo el espacio disponible (max-width 720px)
- Altura: 44px
- Borde: Gris Medio `#D1D5DB` 1px
- Border radius: 4px
- Placeholder: "Buscar productos, marcas y más..."
- Botón de búsqueda (lupa) a la derecha, fondo Azul Principal `#0D47B6` con ícono blanco
- Al hacer foco: borde Azul Principal
- Tiene dropdown de sugerencias (busquedas recientes, productos sugeridos)

**Lado derecho:**
- 🛒 **Carrito** (con badge si hay items)
- 🔔 **Notificaciones** (con badge si hay sin leer)
- 👤 **Avatar/Usuario** (foto si está logueado, ícono si no)

### Ejemplo visual

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  [LOGO]   [🔍 Buscar productos, marcas y más...        ]  🛒(3)  🔔(2)  👤        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Comportamiento en mobile

En pantallas < 768px:
- Logo solo (sin texto, solo el isotipo) — 40x40px
- Buscador colapsado a un ícono de lupa que abre overlay de búsqueda
- Carrito visible con badge
- Notificaciones y Avatar entran en el menú hamburguesa
- Aparece un botón hamburguesa ☰ a la izquierda del logo

---

## BARRA 3 — Navegación (la inferior, secciones)

**Función:** navegar entre las secciones del marketplace y categorías.

**Fondo:** Blanco `#FFFFFF`
**Altura:** 48px
**Borde inferior:** 1px Gris Muy Claro `#F5F7FA`

### Contenido (de izquierda a derecha)

**Categorías** (dropdown con menú grande tipo "mega menu"):
- Ícono ☰ + texto "Categorías"
- Al hacer hover/click se abre un panel grande con todas las categorías
- En mobile se abre como menú lateral (drawer)

**Secciones principales** (tabs visuales):
- **Mercado Nuestro** → `/app` (marketplace) — esta es la activa por defecto
- **Campañas** → `/app/campanas`
- **Propuestas** → `/app/propuestas`

**Lado derecho:**
- **Cómo funciona** → `/como-funciona` (lleva a la Web Home explicativa)

### Estado activo

La sección activa se marca visualmente:
- Texto en Azul Principal `#0D47B6` con peso 600
- Borde inferior de 3px Azul Principal
- El resto en Gris Texto `#374151` con peso 400

### Ejemplo visual

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ☰ Categorías ▾    Mercado Nuestro    Campañas    Propuestas        Cómo funciona │
│                    ━━━━━━━━━━━━━━                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

(El subrayado azul indica que está en la sección Mercado Nuestro)

### Comportamiento en mobile

En pantallas < 768px:
- Esta barra **se reemplaza por la tab bar inferior fija** (las 4 secciones abajo de la pantalla, como una app)
- "Categorías" se mueve al menú hamburguesa
- "Cómo funciona" se mueve al menú hamburguesa

---

## Sticky behavior (comportamiento al hacer scroll)

Cuando el usuario baja por la página:

**Desktop:**
- La **Barra 1** se oculta al hacer scroll hacia abajo
- Las **Barras 2 y 3** se quedan fijas en la parte superior (sticky)
- Esto reduce el header de 156px a 120px cuando se está leyendo
- Al hacer scroll hacia arriba, vuelve a aparecer la Barra 1

**Mobile:**
- Solo la Barra 2 queda sticky arriba (el buscador y el carrito)
- La tab bar inferior queda fija abajo siempre

---

## Componentes del header

Estructura recomendada de archivos:

```
/components/layout/header/
├── Header.tsx              ← Componente principal
├── HeaderTopBar.tsx        ← Barra 1 (azul)
├── HeaderMainBar.tsx       ← Barra 2 (logo, buscador, cuenta)
├── HeaderNavBar.tsx        ← Barra 3 (categorías + secciones)
├── SearchBar.tsx           ← El buscador con su lógica
├── CategoryMenu.tsx        ← Dropdown/mega menu de categorías
├── UserMenu.tsx            ← Avatar + menú desplegable de usuario
├── LocationSelector.tsx    ← Modal para cambiar ubicación
└── MobileMenu.tsx          ← Drawer lateral para mobile
```

---

## Código base (Next.js + Tailwind)

### Header principal

```tsx
// /components/layout/header/Header.tsx
import HeaderTopBar from './HeaderTopBar'
import HeaderMainBar from './HeaderMainBar'
import HeaderNavBar from './HeaderNavBar'

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <HeaderTopBar />
      <HeaderMainBar />
      <HeaderNavBar />
    </header>
  )
}
```

### Barra 1 (azul, promo + cuenta)

```tsx
// /components/layout/header/HeaderTopBar.tsx
import Link from 'next/link'
import { MapPin, Truck } from 'lucide-react'  // solo si no usás los íconos propios

export default function HeaderTopBar() {
  // Acá iría la lógica para detectar si el usuario está logueado
  const isLoggedIn = false  // ← reemplazar con tu lógica de auth
  const userName = "Juan"   // ← reemplazar con tu lógica de auth
  const location = "Paysandú"  // ← reemplazar con tu lógica de ubicación

  return (
    <div className="bg-brand-blue text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <Truck size={16} />
            <span>Envío gratis en compras desde $1.500</span>
          </div>
          <button className="flex items-center gap-2 hover:underline">
            <MapPin size={16} />
            <span>Enviar a {location}</span>
          </button>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link href="/registro" className="hover:underline">
                Creá tu cuenta
              </Link>
              <Link href="/login" className="hover:underline">
                Ingresá
              </Link>
            </>
          ) : (
            <span>Hola, {userName}</span>
          )}
          <Link href="/app/mi-cuenta/pedidos" className="hover:underline hidden md:inline">
            Mis compras
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Barra 2 (logo + buscador + cuenta)

```tsx
// /components/layout/header/HeaderMainBar.tsx
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'

export default function HeaderMainBar() {
  const cartItemCount = 0          // ← reemplazar con tu lógica
  const notificationCount = 0      // ← reemplazar con tu lógica

  return (
    <div className="bg-white border-b border-neutral-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link href="/app" className="flex-shrink-0">
          <Image
            src="/logos/01_horizontal_color.png"
            alt="Mercado Nuestro"
            width={180}
            height={48}
            priority
          />
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link href="/app/carrito" className="relative">
            <Image
              src="/iconos/color/carrito.png"
              alt="Carrito"
              width={28}
              height={28}
            />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-yellow text-neutral-gray-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          <button className="relative">
            <Image
              src="/iconos/color/notificaciones.png"
              alt="Notificaciones"
              width={28}
              height={28}
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <UserMenu />
        </div>
      </div>
    </div>
  )
}
```

### Buscador

```tsx
// /components/layout/header/SearchBar.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/app/buscar?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos, marcas y más..."
        className="flex-1 px-4 py-2.5 border border-neutral-gray-300 rounded-l-md focus:outline-none focus:border-brand-blue text-neutral-gray-700"
      />
      <button
        type="submit"
        className="bg-brand-blue hover:bg-brand-blue-dark px-5 rounded-r-md flex items-center justify-center"
        aria-label="Buscar"
      >
        <Search className="text-white" size={20} />
      </button>
    </form>
  )
}
```

### Barra 3 (navegación)

```tsx
// /components/layout/header/HeaderNavBar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CategoryMenu from './CategoryMenu'

export default function HeaderNavBar() {
  const pathname = usePathname()

  // Esta función determina si una sección está activa
  function isActive(href: string) {
    if (href === '/app') {
      // Mercado Nuestro está activo solo si estás en /app exacto o en /app/producto, /app/categoria, etc.
      return pathname === '/app' || pathname?.startsWith('/app/producto') || pathname?.startsWith('/app/categoria') || pathname?.startsWith('/app/buscar')
    }
    return pathname?.startsWith(href)
  }

  const sections = [
    { name: 'Mercado Nuestro', href: '/app' },
    { name: 'Campañas', href: '/app/campanas' },
    { name: 'Propuestas', href: '/app/propuestas' },
  ]

  return (
    <div className="bg-white border-b border-neutral-gray-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Lado izquierdo: Categorías + secciones */}
        <div className="flex items-center gap-6">
          <CategoryMenu />

          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`
                py-3 text-sm transition-colors relative
                ${isActive(section.href) 
                  ? 'text-brand-blue font-semibold' 
                  : 'text-neutral-gray-700 hover:text-brand-blue font-normal'
                }
              `}
            >
              {section.name}
              {isActive(section.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue" />
              )}
            </Link>
          ))}
        </div>

        {/* Lado derecho: Cómo funciona */}
        <Link
          href="/como-funciona"
          className="py-3 text-sm text-neutral-gray-700 hover:text-brand-blue"
        >
          Cómo funciona
        </Link>
      </div>
    </div>
  )
}
```

---

## Diferencias críticas con Mercado Libre

Para que el header sea reconocible como Mercado Nuestro y no una copia de Mercado Libre:

1. **Color principal:** Mercado Libre usa amarillo dominante. Mercado Nuestro usa **azul dominante** en la Barra 1, y el amarillo solo para acentos (badges, CTAs).

2. **Estructura simplificada:** Mercado Libre tiene "Ofertas, Cupones, Supermercado, Moda, Mercado Play, Vender, Ayuda" en el nav. Nuestro Header es más limpio: solo las 3 secciones principales + Cómo funciona.

3. **Foco en compra colaborativa:** la presencia de "Campañas" y "Propuestas" en el menú principal es lo que diferencia Mercado Nuestro. No son secciones escondidas.

4. **Sin "Mercado Play" o secciones publicitarias:** el menú es directo, sin distracciones que aprovechen para promocionar productos propios de la plataforma.

---

## Comportamiento responsive completo

### Desktop (≥ 1024px)
- 3 barras visibles completas
- Logo horizontal completo
- Buscador grande
- Categorías como dropdown hover

### Tablet (768px - 1023px)
- 3 barras visibles pero compactadas
- Logo horizontal pero más chico
- Buscador con menos espacio
- Categorías como click (no hover)

### Mobile (< 768px)
- Barra 1: solo ubicación + Ingresá
- Barra 2: hamburguesa + logo solo (isotipo) + buscador colapsado + carrito
- Barra 3: SE OCULTA, reemplazada por tab bar inferior
- Tab bar inferior fija: las 4 secciones (Mercado Nuestro, Campañas, Propuestas, Cuenta)

---

## Checklist para Claude Code

Antes de implementar el header, verificar:

- [ ] Las 3 barras están como componentes separados (TopBar, MainBar, NavBar)
- [ ] El logo lleva a `/app` (no a `/`)
- [ ] El buscador hace submit a `/app/buscar?q=...`
- [ ] Los íconos vienen de la carpeta `/iconos/color/` (versión a color porque el fondo es blanco/azul claro)
- [ ] El header completo es sticky en desktop, sticky parcial en mobile
- [ ] Las clases de Tailwind usan los colores semánticos: `brand-blue`, `brand-yellow`, `neutral-gray-*` (definidos en `COLORES.md`)
- [ ] El nombre **"Mercado Nuestro"** se usa EN LA SECCIÓN MARKETPLACE, no es ni "Disponible" ni "Nuestro Bazar"
- [ ] El estado activo se muestra con borde inferior azul + texto azul bold
- [ ] El header se ve igual en TODAS las páginas de la Web App
- [ ] En la Web Home (mercadonuestro.uy) el header es DISTINTO (más simple, con CTA a la Web App). No usar este componente ahí.

---

## Errores típicos a evitar

❌ **Poner Categorías en la Barra 2 (con el buscador)**
✅ Va en la Barra 3, separado del buscador.

❌ **Poner el "Cómo funciona" en el menú principal con las secciones**
✅ Va a la derecha de la Barra 3, separado, porque es info, no es una sección del marketplace.

❌ **Llamar a la sección marketplace "Disponible" o "Nuestro Bazar"**
✅ Se llama **Mercado Nuestro**. Es el nombre oficial.

❌ **Mostrar "Vendedores por catálogo" en el menú principal en el MVP**
✅ Esta sección es de Fase 2. En el MVP solo se accede desde el menú de usuario o el footer.

❌ **Repetir el header completo en la Web Home**
✅ La Web Home tiene un header MÁS SIMPLE (logo + 4 links de info + CTA "Entrar a la app"). NO tiene buscador ni carrito.

❌ **Usar versión blanca del logo en la Barra 2**
✅ La Barra 2 tiene fondo BLANCO, por lo tanto va el logo a COLOR (versión 01_horizontal_color.png).

---

## Versionado

- **Versión actual:** 1.0
- **Última actualización:** Fase 0 del proyecto
- **Próxima actualización:** cuando se defina visualmente el dropdown de Categorías (mega menu)
