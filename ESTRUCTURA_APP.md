# ESTRUCTURA_APP.md — Arquitectura de Mercado Nuestro

> **LEER ANTES DE HACER CUALQUIER COSA.** Este documento define la estructura del producto y resuelve ambigüedades frecuentes. Cuando haya duda sobre dónde va una funcionalidad, qué sección la contiene, o cómo se llama algo, este archivo manda sobre cualquier otra interpretación.

---

## ⚠️ AVISO CRÍTICO — LEER PRIMERO

> **LA WEB HOME YA ESTÁ ARMADA Y FUNCIONA BIEN. NO TOCARLA.**
>
> Este documento describe la **Web App** (la parte transaccional). 
> 
> La Web Home (mercadonuestro.uy/) ya está implementada con su propia estructura y diseño. **No la modifiques. No la rediseñes. No la reemplaces. No copies su estructura para la Web App.** Son productos separados con propósitos distintos y arquitecturas distintas.
>
> Si necesitás hacer un cambio en la Web Home, **preguntale al usuario antes**. Nunca asumas que hay que "unificar" la estética o estructura entre Web Home y Web App. Funcionan de forma independiente y así debe quedar.

---

## Convenciones de nombres (importantísimo)

Hay términos que se repiten con significados distintos. Para evitar confusión, en TODO el código y la documentación:

| Término | Significado preciso |
|---|---|
| **Mercado Nuestro (empresa)** | El nombre de la empresa/marca. Solo se usa así en textos de marketing, footer, página "Nosotros". |
| **Mercado Nuestro (marketplace)** | El marketplace dentro de la Web App. Es UNA de las 4 secciones del producto. Cuando se hable del marketplace en código, usar `marketplace` o `mercado-nuestro-tab`, NO solo "Mercado Nuestro". |
| **Web Home** | La landing pública en mercadonuestro.uy. **Ya está armada, no se toca.** Su único objetivo es **promocionar y llevar tráfico a la Web App**. |
| **Web App** | La aplicación web completa, accesible desde el dominio (mercadonuestro.uy/app o subdominio). Funciona como Mercado Libre. Tiene las 4 secciones, login, carrito, todo. **Esto es lo que se está desarrollando ahora.** |
| **App** | Sinónimo de Web App. NO existe una app nativa todavía (Fase 3). Cuando se diga "la app", se refiere a la Web App responsive. |

**Regla:** cuando alguien (humano o IA) escriba "Mercado Nuestro" sin contexto, asumir que se refiere al **marketplace dentro de la Web App** salvo que el contexto indique claramente que es la empresa.

---

## Arquitectura general del producto

El producto tiene **DOS partes claramente separadas** que funcionan de manera independiente:

### Parte 1 — Web Home (sitio público promocional) ✅ YA IMPLEMENTADA

**URL:** `mercadonuestro.uy/`
**Estado:** Ya está armada y funcionando. **NO MODIFICAR.**
**Propósito:** atraer visitantes, explicar qué es Mercado Nuestro, convertirlos en usuarios de la Web App.
**Audiencia:** personas que todavía NO usan el producto.
**Funcionalidad:** SOLO informativa. NO tiene catálogo, NO tiene carrito, NO tiene compras.

**Estructura:** definida por el usuario directamente. No replicar su estructura en la Web App ni viceversa.

**Único punto de contacto con la Web App:** los CTAs que llevan a la Web App (botones de "Entrar", "Ver productos", "Sumarme", etc.). El usuario hace clic ahí y aterriza en la Web App.

---

### Parte 2 — Web App (la aplicación funcional) 🚧 EN DESARROLLO

**URL:** `mercadonuestro.uy/app` (o subdominio `app.mercadonuestro.uy`)
**Estado:** En desarrollo activo. Este documento describe esta parte.
**Propósito:** que el usuario compre, participe en campañas, gestione su cuenta.
**Audiencia:** usuarios registrados o anónimos navegando productos.
**Funcionalidad:** TODO lo transaccional. Como Mercado Libre.

**Pantalla principal:** Mercado Nuestro (el marketplace). Esto es lo que el usuario ve al entrar a `/app`.

**Navegación:** ver detalle más abajo en "Las 4 secciones de la Web App".

---

## Cómo se conectan Web Home y Web App

Son dos productos separados pero conectados por el flujo del usuario:

```
Usuario nuevo
      │
      ▼
┌─────────────────────┐
│    WEB HOME ✅      │
│ mercadonuestro.uy/  │
│  (ya armada)        │
│                     │
│  Ve qué es,         │
│  cómo funciona,     │
│  se interesa        │
│                     │
│  Hace clic en CTA   │
└──────────┬──────────┘
           │
           │  (clic en "Entrar" / "Ver productos" / "Sumarme")
           ▼
┌─────────────────────┐
│    WEB APP 🚧       │
│ mercadonuestro.uy/  │
│        app          │
│                     │
│  Navega, compra,    │
│  se suma a campañas │
│  vota propuestas    │
└─────────────────────┘
```

**Importante para Claude Code:**
- Si estás trabajando en algo de `/` (raíz del dominio): es Web Home, **no toques nada, está terminada**.
- Si estás trabajando en algo de `/app/*`: es Web App, **acá sí podés implementar lo que pida el usuario**.

---

## Las 4 secciones de la Web App

Estas 4 secciones existen DENTRO de la Web App. No tienen nada que ver con la Web Home.

### Sección 1 — Mercado Nuestro (marketplace) 🛒

> **Pantalla principal de la Web App. Lo más importante. Es por donde entra todo el mundo.**

**Funciona como Mercado Libre:** catálogo de productos disponibles para compra inmediata.

**Qué muestra:**
- Productos importados por la empresa (stock propio)
- Productos de revendedores (gente que importó y le sobró)
- **TODO mezclado en un catálogo único, organizado por categorías.** No se separan por tipo de vendedor. Cada producto muestra quién es el vendedor (etiqueta "Vendido por Mercado Nuestro" o "Vendido por [Nombre del revendedor]").

**Estructura de la pantalla:**

```
[Header de la Web App]

[Banner destacado: "🔥 3 campañas activas - Sumate antes que cierren"]
   ↑ Este banner es la conexión con la sección Campañas

[Categorías horizontales scroll: Electrónica | Hogar | Bazar | Herramientas | ...]

[Ofertas destacadas - carrusel]

[Productos por categoría: grilla de productos]
  - Card del producto
  - Foto, precio, nombre
  - Etiqueta "Vendido por X"
  - Botón "Agregar al carrito"
  - Ícono de favoritos
```

**Componentes clave:**
- Buscador con filtros (categoría, precio, vendedor, etc.)
- Filtros laterales (en desktop) o desplegables (en mobile)
- Grilla de productos
- Vista de detalle de producto
- Carrito
- Checkout

**Diferencia con Mercado Libre:**
- Catálogo curado (no cualquiera publica, solo revendedores aprobados)
- Productos de importación (foco en cosas que no se fabrican localmente)
- Garantía de calidad respaldada por la empresa
- Pago vía Mercado Pago

---

### Sección 2 — Campañas 📦

> **Compra grupal: la gente se suma a productos que se van a importar, para conseguir mejores precios por volumen.**

**Diferencia fundamental con Mercado Nuestro (Sección 1):**
- **Sección 1 (Mercado Nuestro):** productos que YA EXISTEN, compra inmediata, te llega en pocos días.
- **Sección 2 (Campañas):** productos que SE VAN A IMPORTAR, esperás 60-90 días, conseguís mejor precio.

**Cómo funciona:**
1. La empresa publica una campaña con un producto, un MOQ (cantidad mínima para que se concrete) y escalones de precio por volumen.
2. La gente se suma al producto reservando con una seña (30% del valor estimado).
3. Mientras más gente se sume, mejor precio para todos (escalones).
4. Cuando se cierra la campaña, se cobra el saldo (70%) al precio final alcanzado por todos.
5. Se hace la importación, se entrega en 60-90 días.

**Estructura de la pantalla:**

```
[Header de la Web App]

[Banner explicativo: "Sumate a una compra grupal y conseguí mejores precios"]
[Link: "¿Cómo funciona?" → modal explicativo]

[Tabs: Activas | Por cerrar | Próximamente]

[Lista de campañas - cards grandes]
  Cada card muestra:
  - Foto del producto
  - Nombre y descripción corta
  - Precio actual (según escalón alcanzado)
  - Barra de progreso: "23 de 30 unidades reservadas"
  - Tiempo restante: "Cierra en 5 días"
  - Botón "Sumarme"
  - Link "Ver detalle"
```

**Vista de detalle de campaña:**
- Galería de fotos del producto
- Especificaciones completas
- Tabla de escalones: "10 unidades = $X, 30 unidades = $Y, 50 unidades = $Z"
- Lista de participantes (cuántos son, opcionalmente con avatares anonimizados)
- Botón "Sumarme" con selector de cantidad
- Botón "Compartir" (WhatsApp, Instagram, link directo) → genera viralización
- FAQ específico de la campaña

---

### Sección 3 — Propuestas 💡

> **La comunidad propone productos. Si una propuesta junta muchos votos, la empresa la convierte en campaña.**

**Cómo funciona:**
1. Cualquier usuario puede proponer un producto que le gustaría importar.
2. La propuesta incluye: foto/link de referencia, descripción, justificación de por qué le interesa.
3. Otros usuarios votan las propuestas que les gustan.
4. Las propuestas con muchos votos (umbral a definir, ej: 50 votos) suben de prioridad.
5. La empresa evalúa la viabilidad (proveedor en China, costo, demanda) y la convierte en campaña oficial.

**Estructura de la pantalla:**

```
[Header de la Web App]

[Banner: "Proponé un producto, sumá votos, lo importamos juntos"]
[Botón grande: "+ Nueva propuesta"]

[Tabs: Más votadas | Nuevas | Mis propuestas | En proceso]

[Lista de propuestas - cards]
  Cada card muestra:
  - Foto/imagen de referencia
  - Título de la propuesta
  - Descripción corta
  - Usuario que la propuso (nick)
  - Cantidad de votos (con ícono de corazón o pulgar arriba)
  - Botón "Votar"
  - Comentarios (cantidad)
  - Estado: "En evaluación" / "Aprobada" / "Convertida en campaña"
```

**Vista de detalle de propuesta:**
- Toda la info ampliada
- Comentarios de la comunidad
- Botón de voto destacado
- Si fue aprobada y convertida en campaña, link a la campaña activa

---

### Sección 4 — Vendedores por catálogo 👥

> **Sistema de embajadores: gente que comparte un catálogo digital y cobra comisión por venta. (Funcionalidad de Fase 2, todavía a definir en detalle).**

**Concepto general (basado en Meesho de India):**
1. Un usuario se registra como "vendedor por catálogo".
2. Recibe un link único: `mercadonuestro.uy/v/[su-nombre]`.
3. Comparte ese link por WhatsApp, Instagram, redes sociales.
4. Cuando alguien compra desde ese link, el vendedor cobra una comisión (8-15% según volumen mensual).
5. Hay bonos por escalones (ej: si vende más de 50 productos en el mes, cobra +5% extra).

**Estado en el MVP:**
En el MVP no se implementa la funcionalidad completa. Solo se muestra una pantalla "Próximamente" con formulario de pre-registro para gente interesada. No aparece en el menú principal de la Web App (se accede desde el menú de usuario o el footer).

**A definir en Fase 2:**
- Dashboard del vendedor (ventas, comisiones, productos compartidos)
- Sistema de catálogos personalizables
- Sistema de atribución vía cookie (30 días)
- Sistema de pagos de comisiones
- Materiales para vendedores

---

## Tabla comparativa: dónde va cada cosa

Si tenés duda sobre dónde implementar una funcionalidad, consultá esta tabla. **Recordá: la columna "Web Home" es solo de referencia, no se toca lo que ya está hecho ahí.**

| Funcionalidad | Web Home | Web App | Sección específica |
|---|---|---|---|
| Hero principal con CTA | ✅ (ya implementado) | ❌ | — |
| Catálogo de productos | ❌ | ✅ | Mercado Nuestro |
| Carrito de compras | ❌ | ✅ | Mercado Nuestro |
| Checkout y pago | ❌ | ✅ | Mercado Nuestro |
| Detalle de producto | ❌ | ✅ | Mercado Nuestro |
| Búsqueda y filtros | ❌ | ✅ | Mercado Nuestro |
| Listado de campañas activas | ❌ | ✅ | Campañas |
| Detalle de campaña | ❌ | ✅ | Campañas |
| Sumarse a campaña | ❌ | ✅ | Campañas |
| Banner "Campañas activas" | ❌ | ✅ | Mercado Nuestro (banner que linkea a Campañas) |
| Proponer un producto | ❌ | ✅ | Propuestas |
| Votar propuestas | ❌ | ✅ | Propuestas |
| Páginas informativas | ✅ (ya implementado) | ❌ | — |
| Login / Registro | ❌ | ✅ | — |
| Panel de usuario / Mi cuenta | ❌ | ✅ | — |
| Mis pedidos | ❌ | ✅ | — |
| Mis favoritos | ❌ | ✅ | — |
| Mis direcciones | ❌ | ✅ | — |
| Pre-registro para vendedores | ✅ (puede tener form de captura) | ✅ | Vendedores |
| Dashboard de vendedor | ❌ | ✅ | Vendedores (Fase 2) |

---

## Estructura de URLs (routing) — SOLO para la Web App

> ⚠️ Las URLs de la Web Home ya están definidas y NO se tocan. Esta sección solo aplica a la Web App.

### Web App (transaccional)
```
/app                                → Sección 1: Mercado Nuestro (pantalla principal)
/app/producto/[slug]                → Detalle de producto
/app/categoria/[slug]               → Categoría específica
/app/buscar?q=[query]               → Resultados de búsqueda
/app/carrito                        → Carrito
/app/checkout                       → Proceso de pago

/app/campanas                       → Sección 2: Campañas
/app/campanas/[id]                  → Detalle de campaña

/app/propuestas                     → Sección 3: Propuestas
/app/propuestas/nueva               → Crear propuesta
/app/propuestas/[id]                → Detalle de propuesta

/app/vendedores                     → Sección 4: Vendedores
/app/vendedores/registro            → Registro como vendedor
/app/vendedores/dashboard           → Panel del vendedor (Fase 2)

/app/mi-cuenta                      → Panel de usuario
/app/mi-cuenta/pedidos              → Historial de pedidos
/app/mi-cuenta/favoritos            → Lista de favoritos
/app/mi-cuenta/direcciones          → Direcciones guardadas
/app/mi-cuenta/notificaciones       → Preferencias

/login                              → Login
/registro                           → Registro
/v/[username]                       → Link de vendedor (atribución)
```

---

## Errores típicos a evitar

### ❌ Error 1: Tocar o "mejorar" la Web Home
**Síntoma:** Claude Code propone cambios en la home, le agrega productos, le cambia la estética para "unificarla" con la Web App.
**Solución:** **NO TOCAR LA WEB HOME.** Está terminada y funciona como debe. Si Claude Code identifica algo que "se podría mejorar" en la Web Home, debe mencionárselo al usuario pero NO modificarlo sin permiso explícito.

### ❌ Error 2: Copiar la estructura de la Web Home en la Web App
**Síntoma:** Claude Code asume que el header, footer, layout o navegación de la Web App debe ser igual al de la Web Home.
**Solución:** Son productos DISTINTOS con estructuras DISTINTAS. La Web App tiene un header propio (ver HEADER.md), navegación propia (4 secciones), y layout transaccional. La Web Home tiene su propia identidad visual y estructura, definida por el usuario.

### ❌ Error 3: Confundir "Mercado Nuestro" empresa con "Mercado Nuestro" sección
**Síntoma:** Claude Code crea una sección llamada "Mercado Nuestro" que en realidad debería ser la home de la app.
**Solución:** En código, llamar a esta sección `marketplace` o `mercado-nuestro-tab`. El nombre visible al usuario sigue siendo "Mercado Nuestro".

### ❌ Error 4: Separar productos de stock y productos de revendedores
**Síntoma:** Claude Code crea dos catálogos distintos o dos tabs separados.
**Solución:** Va TODO mezclado en un solo catálogo. La diferenciación se hace con una etiqueta "Vendido por X" en cada producto, similar a Mercado Libre.

### ❌ Error 5: Renombrar la sección Mercado Nuestro a otra cosa
**Síntoma:** Claude Code usa nombres como "Disponible", "Nuestro Bazar", "Comprar", "Catálogo" en lugar de "Mercado Nuestro".
**Solución:** La sección marketplace se llama **"Mercado Nuestro"** y punto. Es parte de la identidad de marca.

### ❌ Error 6: Tratar Campañas como una página secundaria
**Síntoma:** Claude Code pone "Campañas" en un link del footer o en el menú del usuario.
**Solución:** Campañas es una de las 4 SECCIONES PRINCIPALES de la app. Va en el menú principal del header, siempre visible.

### ❌ Error 7: Confundir "campaña" con "promoción" u "oferta"
**Síntoma:** Claude Code interpreta "Campañas" como ofertas o descuentos del marketplace.
**Solución:** Una **campaña** es un evento de **compra grupal con MOQ y escalones de precios** para importar un producto que NO está en stock todavía. Es un concepto distinto de "oferta" o "promoción". Los descuentos del marketplace se llaman "Ofertas".

### ❌ Error 8: Implementar Vendedores por catálogo en el MVP
**Síntoma:** Claude Code dedica esfuerzo a implementar el sistema completo de vendedores.
**Solución:** Para el MVP, esta sección muestra solo "Próximamente" y un formulario de pre-registro. La implementación completa es Fase 2.

---

## Prompt para Claude Code (pegar al inicio de cada sesión)

Cuando arranques una sesión nueva con Claude Code, copiale y pegale este texto al inicio para resetear el contexto:

```
Antes de hacer nada, leé /ESTRUCTURA_APP.md completo y confirmame que 
entendiste los siguientes puntos:

1. LA WEB HOME (mercadonuestro.uy/) YA ESTÁ ARMADA Y NO SE TOCA. No la 
   modifiques, no la rediseñes, no la unifiques con la Web App. Si 
   necesitás cambiar algo ahí, preguntame ANTES.

2. Hay DOS productos separados: Web Home (informativa, ya hecha) y 
   Web App (/app, transaccional, en desarrollo). Funcionan de forma 
   INDEPENDIENTE. No son lo mismo, no comparten estructura, no comparten 
   layout. Solo están conectadas por los CTAs de la Home que llevan a 
   la App.

3. La Web App tiene 4 secciones principales:
   - Mercado Nuestro (marketplace, pantalla principal por defecto)
   - Campañas (compra grupal)
   - Propuestas (votación comunitaria de productos)
   - Vendedores por catálogo (Fase 2, solo "Próximamente" en MVP)

4. Mercado Nuestro (marketplace) funciona como Mercado Libre: catálogo 
   único con productos mezclados de stock propio y de revendedores, 
   organizados por categorías. La diferenciación entre vendedores se 
   muestra con etiqueta "Vendido por X".

5. "Campaña" es compra grupal con MOQ y escalones. NO es lo mismo que 
   "Oferta" (descuento en el marketplace).

6. La pantalla principal de la Web App es Mercado Nuestro (marketplace), 
   no una home con accesos.

7. El nombre de la sección marketplace es "Mercado Nuestro". No es 
   "Disponible", ni "Nuestro Bazar", ni "Catálogo", ni "Comprar".

Después de confirmar que entendiste, decime qué tarea querés que haga 
y procedé. Si algo es ambiguo, preguntame antes de implementar. Si te 
pido cambiar algo de la Web Home, preguntame ANTES de hacer el cambio.
```

---

## Diagrama final visual

```
┌─────────────────────────────────────────────────────────────────┐
│                  PRODUCTO: MERCADO NUESTRO                       │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌──────────────────────┐         ┌──────────────────────────┐
│   WEB HOME ✅        │         │     WEB APP 🚧           │
│  mercadonuestro.uy   │         │ mercadonuestro.uy/app    │
│                      │         │                          │
│  YA ARMADA           │         │  EN DESARROLLO           │
│  NO TOCAR            │         │  Acá se trabaja          │
│                      │         │                          │
│  PROPÓSITO:          │         │  4 SECCIONES:            │
│  Promocionar y       │         │  - Mercado Nuestro ⭐    │
│  llevar tráfico      │         │  - Campañas              │
│  a la Web App        │         │  - Propuestas            │
│                      │         │  - Vendedores (Fase 2)   │
│  NO tiene:           │         │                          │
│  - Productos         │         │  PROPÓSITO:              │
│  - Carrito           │         │  Operación transaccional │
│  - Login             │         │  Como Mercado Libre      │
│                      │         │                          │
│  Estructura propia,  │         │  ⭐ = Pantalla inicial   │
│  definida por el     │         │                          │
│  usuario             │         │                          │
└──────────────────────┘         └──────────────────────────┘
            │                                   ▲
            └─────────── CTA "Entrar" ──────────┘
              (único punto de contacto)
```

---

## Para Claude Code (instrucción permanente)

Cuando trabajes en este proyecto, antes de implementar cualquier componente o pantalla:

1. **Identificá si estás trabajando en Web Home o Web App.**
   - Si es **Web Home**: **NO HAGAS NADA SIN PREGUNTAR.** Está terminada.
   - Si es **Web App**: podés implementar lo que pida el usuario, siguiendo este documento.

2. **Si es Web App, identificá en qué sección de las 4 va.** Si no está claro, preguntá.

3. **Verificá las convenciones de nombres.** "Mercado Nuestro" puede significar dos cosas distintas.

4. **Consultá la tabla "dónde va cada cosa"** si tenés duda sobre la ubicación de una funcionalidad.

5. **Revisá los "errores típicos"** antes de empezar para no caer en ellos.

6. **Si una sección tiene un texto que confunde**, marcalo y preguntale al usuario para refinar este documento.

7. **NUNCA intentes "unificar" Web Home y Web App.** Son productos separados con diseños separados. Esto es intencional, no es un error.

---

## Versionado

- **Versión 1.0:** estructura inicial del documento
- **Versión 1.1 (actual):** se aclara que la Web Home YA ESTÁ ARMADA y NO se toca. Se enfatiza la separación entre Web Home y Web App. La estructura de la Web Home queda fuera del scope de este documento (la define el usuario directamente).
