# LOGOS.md — Guía de uso del logo de Mercado Nuestro

> Este archivo documenta las 9 versiones del logo de Mercado Nuestro y cuándo usar cada una. Es referencia obligatoria para cualquier persona (o IA) que esté creando interfaces, contenido visual, o componentes que usen el logo.
>
> **Regla de oro:** elegir el logo según dos preguntas: ¿qué espacio tengo? (horizontal, cuadrado, mini) y ¿qué fondo tengo? (claro, oscuro, color de marca, una sola tinta).

---

## Archivos disponibles

```
/logos
├── 01_principal.png                  → Logo completo horizontal a color
├── 02_principal-vertical_color.png   → Logo completo vertical a color
├── 03_vertical_blanco_negro.png      → Logo completo vertical en blanco y negro
├── 04_horizontal_blanco_negro.png    → Logo completo horizontal en blanco y negro
├── 05_horizontal_blanco.png          → Logo completo horizontal en blanco (para fondos oscuros)
├── 06_vertical_blanco.png            → Logo completo vertical en blanco (para fondos oscuros)
├── 07_isotipo-principal_color.png    → Solo el ícono a color (sin texto)
├── 08_isotipo_negro.png              → Solo el ícono en negro
└── 09_isotipo_blanco.png             → Solo el ícono en blanco (para fondos oscuros)
```

---

## Glosario rápido

- **Logotipo:** la marca completa, símbolo + texto (lo que la mayoría llama "logo")
- **Isotipo:** solo el símbolo, sin texto (la rueda de personas)
- **Versión horizontal:** símbolo a la izquierda, texto a la derecha. Ideal cuando hay más ancho que alto disponible
- **Versión vertical:** símbolo arriba, texto abajo. Ideal cuando hay más alto que ancho, o cuadrado
- **Versión en blanco y negro:** una sola tinta, sin colores. Para impresión económica, fax, documentos legales
- **Versión en blanco:** logo en color blanco, solo para fondos oscuros

---

## Tabla de decisión rápida

| ¿Dónde vas a usarlo? | Archivo recomendado |
|---|---|
| Navbar / Header del sitio web | `01_principal.png` |
| Footer del sitio web | `01_principal.png` o `05_horizontal_blanco.png` (según fondo) |
| Favicon de la pestaña del navegador | `07_isotipo-principal_color.png` |
| Ícono de la app móvil (PWA) | `07_isotipo-principal_color.png` |
| Avatar de perfil en redes sociales | `02_principal-vertical_color.png` o `07_isotipo-principal_color.png` |
| Post cuadrado de Instagram | `02_principal-vertical_color.png` |
| Story de Instagram (fondo claro) | `02_principal-vertical_color.png` |
| Story de Instagram (fondo oscuro/foto) | `06_vertical_blanco.png` |
| Foto de portada de Facebook | `01_principal.png` |
| Email transaccional (header) | `01_principal.png` |
| Email transaccional (footer con fondo azul) | `05_horizontal_blanco.png` |
| Banner / Hero con fondo blanco | `01_principal.png` |
| Banner / Hero con fondo azul de marca | `05_horizontal_blanco.png` |
| Banner / Hero con foto oscura | `05_horizontal_blanco.png` |
| Tarjeta de presentación | `01_principal.png` o `02_principal-vertical_color.png` |
| Factura / Documento legal en PDF | `04_horizontal_blanco_negro.png` |
| Cartel del local físico | `01_principal.png` (grande) |
| Bolsa de compras / Merchandising oscuro | `05_horizontal_blanco.png` o `06_vertical_blanco.png` |
| Bolsa de compras / Merchandising claro | `01_principal.png` o `02_principal-vertical_color.png` |
| Watermark sobre fotos de productos | `09_isotipo_blanco.png` (con baja opacidad) |
| Sello / Stamp en documentos | `08_isotipo_negro.png` |
| Loading spinner animado | `07_isotipo-principal_color.png` o `09_isotipo_blanco.png` |
| WhatsApp Business (foto de perfil) | `02_principal-vertical_color.png` |
| Notificaciones push del navegador | `07_isotipo-principal_color.png` |

---

## Reglas por contexto

### Regla 1: Fondo blanco o claro → versión a color

Cuando el logo va sobre fondo blanco, gris muy claro, beige o cualquier color claro, usar las versiones a color (`01`, `02`, `07`). Son las versiones principales de la marca y las que más se van a ver.

```html
<!-- Ejemplo correcto -->
<header style="background: white;">
  <img src="/logos/01_principal.png" alt="Mercado Nuestro" />
</header>
```

### Regla 2: Fondo azul de marca u oscuro → versión blanca

Cuando el logo va sobre fondo azul corporativo, negro, gris oscuro, foto oscura o cualquier color saturado donde la versión a color no contrastaría bien, **usar las versiones blancas** (`05`, `06`, `09`).

**¿Por qué no la versión a color sobre azul?** Porque el azul del logo se confunde con el azul del fondo y el logo se vuelve ilegible. El amarillo se ve bien pero el resto desaparece.

```html
<!-- Ejemplo correcto -->
<section style="background: #1e40af;">
  <img src="/logos/05_horizontal_blanco.png" alt="Mercado Nuestro" />
</section>

<!-- INCORRECTO -->
<section style="background: #1e40af;">
  <img src="/logos/01_principal.png" alt="Mercado Nuestro" /> ❌
</section>
```

### Regla 3: Impresión en una sola tinta → versión blanco y negro

Para facturas, documentos legales, sellos, impresiones económicas, fotocopias, fax, o cualquier situación donde no se puede usar color, usar las versiones en blanco y negro (`03`, `04`, `08`).

### Regla 4: Espacio muy chico → solo isotipo

Cuando hay muy poco espacio (menos de 80 píxeles de ancho), no usar el logo completo porque el texto se vuelve ilegible. Usar solo el isotipo (`07`, `08` o `09` según fondo).

```html
<!-- Bien: navbar mobile colapsado -->
<button class="menu-btn">
  <img src="/logos/07_isotipo-principal_color.png" width="40" />
</button>

<!-- Mal: el texto sería ilegible -->
<button class="menu-btn">
  <img src="/logos/01_principal.png" width="40" /> ❌
</button>
```

### Regla 5: Espacio cuadrado o vertical → versión vertical

Cuando el espacio disponible es cuadrado (avatares, posts de Instagram, app icons grandes) o más alto que ancho, usar las versiones verticales (`02`, `03`, `06`). Las horizontales se ven chiquititas en esos contextos.

### Regla 6: Espacio horizontal alargado → versión horizontal

Cuando el espacio es claramente horizontal (navbar, banners, headers de email), usar las versiones horizontales (`01`, `04`, `05`).

---

## Tamaños mínimos recomendados

Para que el logo se vea bien y sea legible, respetar estos tamaños mínimos:

| Versión | Ancho mínimo |
|---|---|
| Horizontal (`01`, `04`, `05`) | 120 píxeles |
| Vertical (`02`, `03`, `06`) | 80 píxeles |
| Isotipo (`07`, `08`, `09`) | 24 píxeles |

Por debajo de esos tamaños, el logo pierde definición y el texto se vuelve ilegible. Si necesitás algo más chico, usar solo el isotipo.

---

## Espacio de respeto (clear space)

Alrededor del logo siempre tiene que haber un margen mínimo libre de otros elementos. La regla: tomar la altura del círculo del símbolo (la cabeza superior) y usar esa distancia como margen mínimo en los 4 lados.

```
              [margen]
[margen]   ⊙ LOGO   [margen]
              [margen]
```

No pegar textos, otros logos, ni elementos gráficos dentro de ese espacio. El logo necesita respirar.

---

## Lo que NO hacer con el logo

Estas son reglas duras. Cualquier persona que use el logo debe respetarlas para mantener la coherencia de la marca:

❌ **No deformar el logo.** Nunca estirarlo más ancho o más alto. Siempre mantener proporciones.

❌ **No cambiar los colores.** Los colores son azul (`#1e40af` aproximado) y amarillo (`#facc15` aproximado). No usar verde, rojo, ni otros colores para "personalizar" el logo.

❌ **No agregar efectos.** Sin sombras paralelas, sin contornos, sin degradados, sin brillos, sin 3D, sin glow.

❌ **No rotar el logo.** Siempre en su orientación normal, horizontal.

❌ **No usar el logo a color sobre fondos saturados.** Si el fondo es azul, rojo, verde fuerte, usar la versión blanca.

❌ **No usar el logo blanco sobre fondos claros.** Es invisible.

❌ **No separar el símbolo del texto del logotipo principal.** Si querés solo el símbolo, usar el isotipo (`07`, `08`, `09`).

❌ **No tipear "Mercado Nuestro" con otra tipografía y llamarlo logo.** El logo es el archivo, no el nombre.

❌ **No usar el logo como patrón de fondo repetido.** Pierde valor como marca.

❌ **No reemplazar el isotipo por otro símbolo.** La rueda de personas es parte de la identidad.

---

## Uso en código (Next.js + Tailwind)

### Logo principal en navbar

```jsx
import Image from 'next/image'

export function Navbar() {
  return (
    <nav className="bg-white border-b">
      <Image
        src="/logos/01_principal.png"
        alt="Mercado Nuestro"
        width={200}
        height={50}
        priority
      />
    </nav>
  )
}
```

### Logo blanco sobre fondo azul (hero)

```jsx
<section className="bg-blue-700 py-20">
  <Image
    src="/logos/05_horizontal_blanco.png"
    alt="Mercado Nuestro"
    width={300}
    height={75}
    priority
  />
</section>
```

### Isotipo como favicon

En `app/layout.tsx` de Next.js:

```jsx
export const metadata = {
  title: 'Mercado Nuestro',
  icons: {
    icon: '/logos/07_isotipo-principal_color.png',
    apple: '/logos/07_isotipo-principal_color.png',
  },
}
```

### Logo responsive (cambia según tamaño de pantalla)

```jsx
<>
  {/* Mobile: solo isotipo */}
  <Image
    src="/logos/07_isotipo-principal_color.png"
    alt="Mercado Nuestro"
    width={40}
    height={40}
    className="md:hidden"
  />

  {/* Desktop: logo completo */}
  <Image
    src="/logos/01_principal.png"
    alt="Mercado Nuestro"
    width={200}
    height={50}
    className="hidden md:block"
  />
</>
```

### Logo adaptativo según modo claro/oscuro

```jsx
<>
  <Image
    src="/logos/01_principal.png"
    alt="Mercado Nuestro"
    width={200}
    height={50}
    className="block dark:hidden"
  />
  <Image
    src="/logos/05_horizontal_blanco.png"
    alt="Mercado Nuestro"
    width={200}
    height={50}
    className="hidden dark:block"
  />
</>
```

---

## Colores oficiales de la marca

Aunque no estén en este archivo de logos, conviene tener documentados los códigos de color exactos:

| Color | Uso | HEX | RGB |
|---|---|---|---|
| Azul Mercado Nuestro | Color principal | `#1e40af` | `30, 64, 175` |
| Azul oscuro | Acento sombras del isotipo | `#1e3a8a` | `30, 58, 138` |
| Amarillo Mercado Nuestro | Color de acento | `#facc15` | `250, 204, 21` |
| Blanco | Fondos claros, texto sobre azul | `#ffffff` | `255, 255, 255` |
| Negro | Textos, versiones B&N | `#000000` | `0, 0, 0` |

Estos colores también van a vivir en `tailwind.config.ts` como colores personalizados:

```typescript
colors: {
  brand: {
    blue: '#1e40af',
    'blue-dark': '#1e3a8a',
    yellow: '#facc15',
  }
}
```

---

## Casos de uso por sección de la plataforma

### Sitio público (la web)

- **Navbar (header):** `01_principal.png` — siempre visible, fondo blanco
- **Footer:** `05_horizontal_blanco.png` — si el footer es azul, o `01_principal.png` si es blanco
- **Hero/banner principal:** `05_horizontal_blanco.png` sobre fondo azul, o `01_principal.png` sobre fondo claro
- **Página "Cómo funciona":** `01_principal.png` en encabezado
- **Loaders/spinners:** `07_isotipo-principal_color.png` animado
- **Páginas 404 / error:** `02_principal-vertical_color.png` en el centro

### Email marketing y transaccional

- **Header del email:** `01_principal.png` centrado, ancho 200-250px
- **Footer del email:** `04_horizontal_blanco_negro.png` o el isotipo chiquito al lado de "© Mercado Nuestro"

### Documentos generados (PDFs)

- **Facturas:** `04_horizontal_blanco_negro.png` para impresión sin color
- **Comprobantes:** `04_horizontal_blanco_negro.png`
- **Catálogos digitales para vendedores:** `01_principal.png` en color

### Redes sociales

- **Foto de perfil Instagram/Facebook:** `02_principal-vertical_color.png` centrado en cuadrado blanco
- **Imagen de portada Facebook (820x312):** `01_principal.png` a la izquierda, texto promocional a la derecha
- **Banner Twitter (1500x500):** `05_horizontal_blanco.png` sobre fondo azul, con tagline
- **Posts orgánicos:** `02_principal-vertical_color.png` o `07_isotipo-principal_color.png` como watermark sutil

### App móvil (PWA / nativa)

- **Ícono de la app:** `07_isotipo-principal_color.png` redondeado por el sistema operativo
- **Splash screen:** `02_principal-vertical_color.png` centrado sobre fondo blanco o azul
- **Loading interno:** `07_isotipo-principal_color.png` animado con rotación

### Panel administrativo

- **Logo del admin (más sobrio):** `01_principal.png` en navbar
- **Documentos exportados:** `04_horizontal_blanco_negro.png`

### Local físico (Paysandú)

- **Cartel exterior grande:** `01_principal.png` impreso en alta resolución (idealmente vectorizar primero a SVG)
- **Vidriera:** `01_principal.png` o `02_principal-vertical_color.png` según diseño
- **Bolsas/packaging:** `05_horizontal_blanco.png` sobre azul, o `01_principal.png` sobre blanco
- **Uniforme del staff:** `07_isotipo-principal_color.png` bordado sobre prenda blanca, o `09_isotipo_blanco.png` sobre prenda azul

---

## Checklist antes de usar el logo

Antes de poner el logo en cualquier lugar nuevo, hacé estas preguntas:

1. ¿El fondo es claro u oscuro? → elige la versión correcta de color
2. ¿El espacio es horizontal, vertical o cuadrado? → elige la orientación correcta
3. ¿Hay suficiente espacio para que se lea el texto, o solo entra el isotipo?
4. ¿Hay otros logos o elementos cerca? → respetar espacio de respeto
5. ¿El logo se ve nítido a este tamaño? → respetar tamaños mínimos
6. ¿Estoy deformando o modificando algo? → no hacerlo

---

## Versionado y actualizaciones

- **Versión actual:** 1.0 (logos generados en Fase 0 del proyecto)
- **Próximo paso:** vectorizar los archivos a SVG para uso en alta resolución y registro de marca
- **Tipografía a identificar:** la del wordmark "Mercado Nuestro" (pendiente identificar con WhatTheFont para poder rehacer el texto limpio en vector)

Cuando se vectorice el logo a SVG, este archivo se actualiza con las rutas de los nuevos archivos `.svg` y los `.png` quedan como respaldo para usos donde no soporten SVG.

---

## Para Claude Code

Cuando estés programando y necesites incluir el logo en algún componente:

1. Leé este archivo completo antes de elegir
2. Usá la tabla de decisión rápida para el caso más común
3. Si el caso es nuevo o ambiguo, aplicá las reglas por contexto
4. Si tenés duda, **preferí siempre el logo principal a color (`01_principal.png`)** sobre fondo blanco como opción segura
5. Nunca improvises modificaciones al logo (color, forma, tipografía)

Si encontrás un caso de uso que no está cubierto acá, agregalo a la tabla de decisión rápida con la opción que recomiendes, así el archivo se va completando con la experiencia real del proyecto.
