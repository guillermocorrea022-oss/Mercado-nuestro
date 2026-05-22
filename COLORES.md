# COLORES.md — Paleta de color de Mercado Nuestro

> Este archivo documenta la paleta oficial de Mercado Nuestro. Es referencia obligatoria para todo trabajo de diseño, desarrollo de componentes UI, configuración de Tailwind, y cualquier elemento visual que use color.
>
> **Regla de oro:** usar SIEMPRE los colores de esta paleta. No inventar variantes ni "ajustar" tonos. La consistencia visual es lo que hace que la marca se vea profesional.

---

## Filosofía de la paleta

Una paleta moderna y confiable que comunica colaboración, tecnología y oportunidad. Diseñada para impulsar una experiencia digital clara, cercana y orientada al comercio.

- **Azul:** representa confianza, profesionalismo, tecnología y seriedad
- **Amarillo:** aporta calidez, energía, oportunidad y llama la atención (CTAs)
- **Neutros:** dan estructura, jerarquía y legibilidad sin competir con los colores de marca

---

## Colores principales (4)

### 🔵 Azul Principal — `#0D47B6`

El color de marca por excelencia. Es el que más se ve en la plataforma.

**Dónde usarlo:**
- Logo (cuando va en color)
- Botones primarios ("Comprar", "Sumarme a la campaña")
- Links principales
- Headers de sección importantes
- Fondo de hero sections
- Bordes de campos de formulario activos
- Iconos primarios
- Badges de estado importante

**Valores:**
- HEX: `#0D47B6`
- RGB: `rgb(13, 71, 182)`
- HSL: `hsl(217, 87%, 38%)`

---

### 🔷 Azul Oscuro — `#072A6B`

Variante oscura del azul principal. Para dar profundidad y contraste.

**Dónde usarlo:**
- Hover de botones primarios (cuando el usuario pasa el mouse)
- Footer de la web (fondo)
- Texto sobre fondos claros cuando se quiere más impacto que el gris
- Sombras de elementos sobre fondos azules
- Gradientes (combinado con el azul principal)
- Bordes inferiores de tablas o cards importantes

**Valores:**
- HEX: `#072A6B`
- RGB: `rgb(7, 42, 107)`
- HSL: `hsl(220, 88%, 22%)`

---

### 🔹 Azul Secundario — `#3D7BFF`

Variante clara y vibrante del azul. Más juvenil y digital.

**Dónde usarlo:**
- Botones secundarios o de acciones complementarias
- Links secundarios (más sutiles que los principales)
- Estados "hover" sobre elementos claros
- Highlights, indicadores de selección
- Notificaciones informativas
- Gráficos y visualizaciones de datos
- Tags y chips de filtros activos

**Valores:**
- HEX: `#3D7BFF`
- RGB: `rgb(61, 123, 255)`
- HSL: `hsl(220, 100%, 62%)`

---

### 🟡 Amarillo Acento — `#FFC107`

El color de acción. Llama la atención y se usa con moderación.

**Dónde usarlo:**
- Detalles del logo (el puntito final)
- Botones de **CTA principal** (call-to-action más importante de la pantalla)
- Badges de "Oferta", "Nuevo", "Destacado"
- Estrellas de calificación
- Indicadores de progreso en campañas grupales (barra de progreso)
- Iconos secundarios (acentos)
- Subrayados decorativos
- Banners promocionales

**⚠️ Regla importante:** el amarillo se usa **con moderación**. No saturar la pantalla. Como acento funciona; como color dominante se vuelve agresivo y poco profesional.

**Valores:**
- HEX: `#FFC107`
- RGB: `rgb(255, 193, 7)`
- HSL: `hsl(45, 100%, 51%)`

---

## Colores neutros (4)

### ⬜ Blanco — `#FFFFFF`

**Dónde usarlo:**
- Fondo principal de toda la web
- Fondo de cards
- Fondo de inputs
- Texto sobre fondos azules oscuros
- Espacios en blanco (respiración visual)

**Valores:**
- HEX: `#FFFFFF`
- RGB: `rgb(255, 255, 255)`

---

### ▫️ Gris Muy Claro — `#F5F7FA`

**Dónde usarlo:**
- Fondo alternativo (cuando blanco es demasiado plano)
- Fondo de secciones para diferenciarlas
- Fondo de sidebar
- Fondo de la barra de búsqueda
- Estados deshabilitados (botones, inputs)
- Fondo de zona de "empty state"

**Valores:**
- HEX: `#F5F7FA`
- RGB: `rgb(245, 247, 250)`

---

### ◾ Gris Medio — `#D1D5DB`

**Dónde usarlo:**
- Bordes de inputs y cards
- Divisores entre secciones (líneas horizontales)
- Placeholder text (más oscuro que el muy claro)
- Iconos secundarios (no críticos)
- Sombras sutiles
- Estados "hover" sobre fondos blancos (efecto sutil)

**Valores:**
- HEX: `#D1D5DB`
- RGB: `rgb(209, 213, 219)`

---

### ⬛ Gris Texto — `#374151`

**Dónde usarlo:**
- Texto principal del cuerpo (párrafos)
- Headings secundarios
- Iconos primarios (cuando no son de marca)
- Texto en formularios

**⚠️ Importante:** este es el color del texto, NO usar negro puro `#000000` que es demasiado duro. Este gris carbón es mucho más amigable a la vista.

**Valores:**
- HEX: `#374151`
- RGB: `rgb(55, 65, 81)`

---

## Configuración para Tailwind CSS

Pegar esto en `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca - Mercado Nuestro
        brand: {
          // Azules
          blue: '#0D47B6',         // Azul Principal
          'blue-dark': '#072A6B',  // Azul Oscuro
          'blue-light': '#3D7BFF', // Azul Secundario
          
          // Amarillo
          yellow: '#FFC107',       // Amarillo Acento
        },
        
        // Neutros (también accesibles vía gray-*)
        neutral: {
          white: '#FFFFFF',
          'gray-50': '#F5F7FA',    // Gris Muy Claro
          'gray-300': '#D1D5DB',   // Gris Medio
          'gray-700': '#374151',   // Gris Texto
        },
      },
      // Tipografías recomendadas (a confirmar después)
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

### Cómo usar las clases en componentes

```jsx
// Fondos
<div className="bg-brand-blue">...</div>
<div className="bg-brand-yellow">...</div>
<div className="bg-neutral-white">...</div>
<div className="bg-neutral-gray-50">...</div>

// Texto
<p className="text-neutral-gray-700">Texto principal</p>
<h1 className="text-brand-blue">Encabezado</h1>
<span className="text-brand-yellow">¡Oferta!</span>

// Bordes
<input className="border border-neutral-gray-300 focus:border-brand-blue" />

// Hover states
<button className="bg-brand-blue hover:bg-brand-blue-dark text-white">
  Comprar ahora
</button>
```

---

## Variables CSS (alternativa o complemento)

Pegar en `app/globals.css`:

```css
:root {
  /* Colores de marca */
  --color-brand-blue: #0D47B6;
  --color-brand-blue-dark: #072A6B;
  --color-brand-blue-light: #3D7BFF;
  --color-brand-yellow: #FFC107;
  
  /* Neutros */
  --color-white: #FFFFFF;
  --color-gray-50: #F5F7FA;
  --color-gray-300: #D1D5DB;
  --color-gray-700: #374151;
  
  /* Semánticos (alias para usar en componentes) */
  --color-bg-primary: var(--color-white);
  --color-bg-secondary: var(--color-gray-50);
  --color-text-primary: var(--color-gray-700);
  --color-text-on-dark: var(--color-white);
  --color-text-brand: var(--color-brand-blue);
  --color-border: var(--color-gray-300);
  --color-accent: var(--color-brand-yellow);
}
```

---

## Reglas semánticas (uso por significado)

Para que toda la plataforma sea coherente, cada color tiene un significado fijo:

### Estados de acción

| Estado | Color | Uso |
|---|---|---|
| **Acción principal (CTA)** | Amarillo Acento `#FFC107` | "Comprar ahora", "Sumarme a la compra" |
| **Acción primaria** | Azul Principal `#0D47B6` | "Guardar", "Confirmar", "Siguiente" |
| **Acción secundaria** | Azul Secundario `#3D7BFF` | "Ver más", "Cancelar" |
| **Acción deshabilitada** | Gris Medio `#D1D5DB` | Botones inactivos, no clickeables |
| **Acción destructiva** | (rojo a definir) | "Eliminar", "Cancelar pedido" |

### Estados de feedback

Estos colores **no están en la paleta principal pero son necesarios** para feedback al usuario. Sugerencia de valores estándar para que Claude Code los use:

| Estado | Color sugerido | Uso |
|---|---|---|
| **Éxito (success)** | `#10B981` (verde) | "Pedido confirmado", "Pago exitoso" |
| **Error (danger)** | `#EF4444` (rojo) | "Pago rechazado", "Error en el formulario" |
| **Advertencia (warning)** | `#F59E0B` (naranja) | "Stock bajo", "Campaña por cerrar" |
| **Información (info)** | Azul Secundario `#3D7BFF` | Notificaciones informativas |

### Jerarquía de texto

| Tipo | Color |
|---|---|
| Heading 1, 2 (títulos importantes) | Azul Principal `#0D47B6` |
| Heading 3, 4 (subtítulos) | Gris Texto `#374151` |
| Párrafo (cuerpo) | Gris Texto `#374151` |
| Texto secundario (descripciones, captions) | `#6B7280` (gris medio entre 300 y 700) |
| Texto deshabilitado | Gris Medio `#D1D5DB` |
| Links | Azul Principal `#0D47B6` |
| Links visitados | Azul Oscuro `#072A6B` |

---

## Combinaciones recomendadas (presets)

### Combo "Hero principal"
- Fondo: Azul Principal `#0D47B6`
- Texto: Blanco `#FFFFFF`
- CTA: Amarillo Acento `#FFC107` con texto Gris Texto `#374151`

### Combo "Card de producto"
- Fondo de card: Blanco `#FFFFFF`
- Borde: Gris Medio `#D1D5DB`
- Título: Gris Texto `#374151`
- Precio: Azul Principal `#0D47B6`
- Botón "Comprar": Amarillo Acento con texto oscuro

### Combo "Sección alternativa" (para romper la monotonía)
- Fondo: Gris Muy Claro `#F5F7FA`
- Cards interiores: Blanco `#FFFFFF`

### Combo "Footer"
- Fondo: Azul Oscuro `#072A6B`
- Texto: Blanco `#FFFFFF` o Gris Medio `#D1D5DB`
- Links: Azul Secundario `#3D7BFF` (más visible sobre azul oscuro)

### Combo "Navbar"
- Fondo: Blanco `#FFFFFF`
- Texto: Gris Texto `#374151`
- Logo: versión a color
- Borde inferior: Gris Medio `#D1D5DB`

---

## Reglas de contraste (accesibilidad WCAG)

Para que la web sea legible por todos, respetar estas combinaciones:

### ✅ Combinaciones con buen contraste (AA o superior)

| Texto | Fondo | Ratio |
|---|---|---|
| Gris Texto `#374151` sobre Blanco | ✅ AAA | 9.7:1 |
| Azul Principal `#0D47B6` sobre Blanco | ✅ AAA | 7.2:1 |
| Azul Oscuro `#072A6B` sobre Blanco | ✅ AAA | 12.4:1 |
| Blanco sobre Azul Principal | ✅ AAA | 7.2:1 |
| Blanco sobre Azul Oscuro | ✅ AAA | 12.4:1 |
| Gris Texto sobre Gris Muy Claro | ✅ AAA | 8.9:1 |

### ❌ Combinaciones a evitar (mal contraste)

| Texto | Fondo | Problema |
|---|---|---|
| Amarillo sobre Blanco | ❌ Mal contraste | Casi ilegible |
| Amarillo sobre Gris Muy Claro | ❌ Mal contraste | Casi ilegible |
| Azul Secundario sobre Blanco | ⚠️ Solo OK para texto grande | Demasiado claro para párrafos |
| Gris Medio sobre Blanco | ❌ Mal contraste | Solo usar para iconos decorativos |

**Regla práctica:** el amarillo **nunca** se usa para texto. Solo para fondos de elementos pequeños como badges, botones grandes, o detalles decorativos.

---

## Casos prácticos por sección de la plataforma

### Home

- Fondo general: Blanco
- Hero principal: Azul Principal con texto blanco y CTA amarillo
- Secciones alternadas: Blanco / Gris Muy Claro / Blanco
- Cards: Blanco con borde Gris Medio
- Botones primarios: Azul Principal
- Botón "Comprar grupal": Amarillo (es el CTA destacado)

### Detalle de producto

- Fondo: Blanco
- Precio actual: Azul Principal grande
- Precio anterior (tachado): Gris Texto pequeño
- Badge "Oferta": Amarillo con texto oscuro
- Botón "Agregar al carrito": Azul Principal
- Botón "Sumarme a la compra grupal": Amarillo (CTA prioritario)
- Barra de progreso de campaña: Amarillo sobre Gris Muy Claro

### Carrito y checkout

- Fondo: Blanco
- Resumen lateral: Gris Muy Claro
- Total: Azul Oscuro grande y negrita
- Botón "Finalizar compra": Amarillo
- Inputs con foco: borde Azul Principal

### Panel de usuario

- Sidebar: Azul Oscuro con texto blanco
- Item activo en sidebar: Azul Principal
- Fondo principal: Blanco
- Cards de información: Blanco con borde Gris Medio

### Footer

- Fondo: Azul Oscuro
- Texto: Blanco / Gris Medio
- Logo: versión blanca
- Links: Azul Secundario en hover

---

## Lo que NO hacer

❌ **No inventar nuevos colores** "para esta sección". Siempre usar la paleta oficial.

❌ **No usar negro puro `#000000`** para texto. Usar Gris Texto `#374151`.

❌ **No usar el amarillo para texto largo.** Solo para acentos, fondos, badges.

❌ **No combinar los 4 azules en la misma pantalla.** Confunde y satura.

❌ **No bajar la opacidad de los colores oficiales** para "crear variantes". Si necesitás un tono más claro, hay tonos definidos.

❌ **No usar degradados con colores fuera de paleta.** Si vas a hacer degradados, usar Azul Principal → Azul Oscuro, o Azul Principal → Azul Secundario.

❌ **No usar colores con baja saturación o "pasteles"** que no estén en la paleta. Rompe la consistencia.

❌ **No reemplazar el amarillo con verde o naranja** "por variedad". La identidad de marca es azul + amarillo.

---

## Para Claude Code

Cuando estés programando un componente nuevo y necesites colores:

1. **Consultá esta lista primero** antes de definir un color
2. **Si la paleta de Tailwind ya está configurada**, usá las clases `brand-*` y `neutral-*`
3. **Para semántica**, considerá qué significa el color en la interfaz:
   - ¿Es un CTA principal? → Amarillo
   - ¿Es una acción primaria? → Azul Principal
   - ¿Es texto? → Gris Texto
   - ¿Es un fondo de sección? → Blanco o Gris Muy Claro
   - ¿Es un borde sutil? → Gris Medio
4. **Para estados (hover, focus, disabled)** usá las variantes oscuras o claras
5. **Verificá el contraste** antes de usar colores juntos (especialmente texto sobre fondo)
6. **Si necesitás un color que no está** (ej: rojo para errores), proponelo basándote en la sección "Estados de feedback" y pedí confirmación al usuario antes de usarlo en producción

---

## Versionado

- **Versión actual:** 1.0 (paleta de 8 colores: 4 principales + 4 neutros)
- **Última actualización:** Fase 0 del proyecto
- **Próxima revisión:** después de las primeras pantallas para validar que los colores funcionan en uso real
