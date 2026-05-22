# MERCADO_NUESTRO_DECISIONES.md — Documento maestro del proyecto

> Este documento consolida TODAS las decisiones tomadas para el MVP de Mercado Nuestro. Es la base para que Claude Code arme la Web App. Léelo antes de programar cualquier cosa.
>
> **Convención del documento:**
> - ✅ Decisión tomada y confirmada
> - ⚡ **Sugerencia mejorada** = Claude (la IA que armó este documento con vos) sugiere una optimización a tu decisión basada en mejores prácticas. NO está implementada salvo que vos confirmes. Si la querés tomar, simplemente decile a Claude Code que sí.
> - 🚧 Pendiente de definir (faltan temas en próximos chats)
> - ⚠️ Decisión legal/técnica crítica
>
> **Versión:** 1.0
> **Fecha:** Fase 0 del proyecto (definición pre-desarrollo)
> **Estado del MVP:** 12 de 20 temas definidos. Faltan: Campañas (parte 2), Propuestas, Vendedores por catálogo, Crear campaña, Admin, Reclamos, Soporte, Legales.

---

## ÍNDICE

1. [Resumen ejecutivo del modelo de negocio](#1-resumen-ejecutivo-del-modelo-de-negocio)
2. [Stack técnico](#2-stack-tecnico)
3. [Arquitectura del producto](#3-arquitectura-del-producto)
4. [Roles del sistema](#4-roles-del-sistema)
5. [Identidad visual](#5-identidad-visual)
6. [Layout y navegación](#6-layout-y-navegacion)
7. [Login y registro](#7-login-y-registro)
8. [Identidad del usuario](#8-identidad-del-usuario)
9. [Búsqueda y descubrimiento](#9-busqueda-y-descubrimiento)
10. [Categorías](#10-categorias)
11. [Detalle de producto](#11-detalle-de-producto)
12. [Envíos y logística](#12-envios-y-logistica)
13. [Carrito y checkout](#13-carrito-y-checkout)
14. [Estados del pedido y seguimiento](#14-estados-del-pedido-y-seguimiento)
15. [Reseñas y opiniones](#15-resenas-y-opiniones)
16. [Favoritos](#16-favoritos)
17. [Notificaciones](#17-notificaciones)
18. [Mi cuenta del usuario](#18-mi-cuenta-del-usuario)
19. [Campañas (parte 1)](#19-campanas-parte-1)
20. [Temas pendientes para próximo chat](#20-temas-pendientes)
21. [Prompt para Claude Code](#21-prompt-para-claude-code)

---

## 1. Resumen ejecutivo del modelo de negocio

**Mercado Nuestro** es una plataforma uruguaya de **comercio electrónico colaborativo** que combina tres modelos:

1. **Marketplace** (compra inmediata): productos importados ya disponibles en Uruguay
2. **Campañas** (compra grupal): productos a importar con descuento por volumen
3. **Propuestas** (votación comunitaria): la comunidad propone qué importar

Y un cuarto pilar a desarrollar en Fase 2:

4. **Vendedores por catálogo**: sistema de embajadores que comparten catálogos y cobran comisión (estilo Meesho)

### Diferenciadores clave

- **Local físico:** Leandro Gómez 1076, Paysandú (genera confianza)
- **Compra grupal viral:** escalones de precio por volumen (estilo Pinduoduo/Temu)
- **Comunidad activa:** los usuarios proponen y votan qué importar
- **Curaduría:** no es Marketplace abierto, vendedores aprobados

### Modelo de ingresos

- **Comisión sobre ventas de revendedores** (% a definir, sugerido 8-15%)
- **Comisión sobre campañas de importadores externos** (Fase 2)
- **Margen propio** en productos que importa directamente la empresa

---

## 2. Stack técnico

**Recomendación de stack:**

| Componente | Tecnología | Razón |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR para SEO, performance, modernísimo |
| **Estilos** | Tailwind CSS | Rápido de implementar, escalable |
| **Componentes UI** | shadcn/ui | Profesional, customizable |
| **Backend** | Supabase (Postgres + Auth + Storage + Realtime) | Todo en uno, muy rápido para MVP |
| **Pagos** | Mercado Pago (SDK oficial Uruguay) | El estándar de Uruguay |
| **Logística** | API de UES Upostal | Líder del mercado nacional |
| **Email transaccional** | Resend | Moderno, fácil integración |
| **SMS** | Twilio | Estándar mundial |
| **Push notifications** | Firebase Cloud Messaging | Gratis hasta gran volumen |
| **Hosting** | Vercel (frontend) + Supabase (backend) | Deploy automático desde Git |
| **Repositorio** | GitHub | Estándar |
| **Monitoreo errores** | Sentry | Detecta bugs en producción |

**Costos mensuales estimados para arrancar (primeros 6 meses):**
- Vercel: USD 20
- Supabase: USD 25
- Resend (emails): USD 20
- Twilio (SMS): USD 50-100
- Mercado Pago: comisión por transacción (no fijo)
- UES: a negociar (por envío)
- Facturación electrónica DGI (Memory o similar): USD 50-100
- Dominio: USD 15/año
- Sentry: USD 26
- **Total fijo aproximado: USD 200-300/mes**

---

## 3. Arquitectura del producto

### Dos productos separados

```
mercadonuestro.uy/          → Web Home (YA ARMADA, NO TOCAR)
mercadonuestro.uy/app       → Web App (en desarrollo)
admin.mercadonuestro.uy     → Panel Admin (subdominio separado)
```

### Web Home (mercadonuestro.uy/)
- ✅ Ya implementada
- ❌ NO se modifica desde el desarrollo de la Web App
- Propósito: promocionar y llevar tráfico a la Web App

### Web App (mercadonuestro.uy/app)
- 🚧 En desarrollo
- Funciona como Mercado Libre
- 4 secciones principales (definidas abajo)

### Panel Admin (admin.mercadonuestro.uy)
- ⚠️ **Subdominio separado** por seguridad y profesionalismo
- Solo accesible para usuarios con rol "admin"
- 2FA obligatorio

---

## 4. Roles del sistema

Los roles son **acumulables** (un usuario puede tener varios al mismo tiempo):

| Rol | Quién es | Cómo se obtiene |
|---|---|---|
| **Visitante** | Cualquiera sin cuenta | Default |
| **Comprador** | Default al registrarse | Auto al registrarse |
| **Revendedor** | Comprador que recibió 5+ unidades de un mismo producto en una campaña | Auto-activado por sistema |
| **Vendedor por catálogo** | Comprador que se registra como tal | Auto-aprobado al solicitar (Fase 2) |
| **Importador Profesional** | Asignado manualmente por admin | Solicitud + aprobación manual (Fase 2) |
| **Admin** | Equipo de Mercado Nuestro | Asignación directa |

---

## 5. Identidad visual

### Logo
- 9 versiones disponibles en `/logos/`
- Versión horizontal a color: para fondos blancos
- Versión horizontal blanca: para fondos azules/oscuros
- Versión vertical: para usos verticales
- Solo isotipo (sin texto): para favicons, avatars

**Documento de referencia:** `/logos/LOGOS.md`

### Paleta de colores

```
Azul Principal:     #0D47B6  (color de marca por excelencia)
Azul Oscuro:        #072A6B  (hover, footer, profundidad)
Azul Secundario:    #3D7BFF  (botones secundarios, highlights)
Amarillo Acento:    #FFC107  (CTAs principales, badges, ofertas)

Blanco:             #FFFFFF  (fondos)
Gris Muy Claro:     #F5F7FA  (fondos alternativos)
Gris Medio:         #D1D5DB  (bordes, divisores)
Gris Texto:         #374151  (todo el texto)
```

Colores semánticos sugeridos (no oficiales, agregar si se necesitan):
- Verde (success): `#10B981`
- Rojo (error): `#EF4444`
- Naranja (warning): `#F59E0B`

**Documento de referencia:** `/COLORES.md`

### Íconos
- 24 íconos × 2 versiones = 48 archivos PNG (1254x1254 px)
- Carpeta `color/` para fondos claros
- Carpeta `blanco/` para fondos azules

**Documento de referencia:** `/iconos/ICONOS.md`

### Tipografía
🚧 **Pendiente de definir**. Sugerencia: **Inter** (gratis, profesional, moderna, soporta español perfectamente).

---

## 6. Layout y navegación

### Header de la Web App — 3 barras

```
┌─────────────────────────────────────────────────────────────┐
│ Barra 1 (azul, 36px): Envíos gratis • Ubicación • Cuenta    │
├─────────────────────────────────────────────────────────────┤
│ Barra 2 (blanca, 72px): LOGO + [Buscador] + 🛒 + 🔔 + 👤    │
├─────────────────────────────────────────────────────────────┤
│ Barra 3 (blanca, 48px): ☰ Categorías | Mercado Nuestro |    │
│                          Campañas | Propuestas              │
└─────────────────────────────────────────────────────────────┘
```

**Documento de referencia:** `/HEADER.md`

### Footer doble

**Bloque 1 — Footer principal (4 columnas):**
- Mercado Nuestro: Sobre nosotros, Términos, Privacidad, Devoluciones
- Comprar: Categorías, Ofertas, Campañas, Propuestas
- Vender: Ser vendedor, Soy revendedor, Importadores
- Ayuda: Centro de ayuda, Contacto, Reclamos, WhatsApp

**Bloque 2 — Sub-footer:**
- Logo + tagline + métodos de pago + redes sociales + copyright

**Fondo del footer:** Azul Oscuro `#072A6B`

### Menú de usuario (dropdown del avatar)

Cambia según los roles del usuario. Ver detalle en el chat anterior.

### Tab bar inferior (solo mobile, < 768px)

```
┌─────────────────────────────────────────────┐
│  🛒        📦         💡         👤         │
│ Inicio   Campañas  Propuestas  Cuenta       │
└─────────────────────────────────────────────┘
```

⚡ **Nota:** "Mercado Nuestro" se acorta a "Inicio" en mobile por espacio.

### Componentes base
- Breadcrumbs en páginas internas
- Skeletons para loading (no spinners)
- Toast notifications (arriba derecha en desktop, abajo en mobile)
- Modales para confirmaciones y acciones puntuales

---

## 7. Login y registro

✅ **Acceso:**
- Navegación libre sin cuenta (puede ver productos, categorías, campañas, propuestas)
- Registro obligatorio para: comprar, sumarse a campaña, votar propuesta, dejar opinión, guardar favorito

✅ **Métodos de registro/login:**
- Email + contraseña
- Google (un clic)
- Facebook (un clic)

✅ **Verificación al registrarse:**
- Teléfono obligatorio
- Verificación por **SMS al teléfono**
- ⚠️ Costo: USD 0.05-0.10 por SMS (USD 50-100/mes para 1000 nuevos usuarios)

⚡ **Sugerencia mejorada:** considerá agregar verificación por **WhatsApp** en Fase 2 cuando crezcas. Es gratis (con WhatsApp Business API), funciona en Uruguay, y tiene mejor tasa de entrega que SMS. Por ahora SMS está bien.

---

## 8. Identidad del usuario

✅ **Datos al registrarse:**
- Nombre
- Apellido
- Email
- Contraseña
- Teléfono (obligatorio, verificado por SMS)
- CI (opcional al registro)

✅ **CI uruguaya:** opcional al registro, **obligatoria al comprar** (primer pedido)

✅ **Avatar:** 
- Default: iniciales del nombre coloreadas con Azul Principal
- Opcional: subir foto

✅ **Tipo de cuenta:** solo personas físicas (no empresas con RUT en MVP)

⚡ **Sugerencia mejorada:** considerá agregar "Empresa" (con RUT) en Fase 2, especialmente para revendedores e importadores externos que necesitan facturar a empresas. Es un mercado adicional importante.

---

## 9. Búsqueda y descubrimiento

✅ **Antes de escribir en el buscador:**
- Sugerencias automáticas (autocompletado)
- Búsquedas recientes (solo usuarios registrados)
- Búsquedas populares de la plataforma

✅ **Ordenamiento de resultados:**
- Default: por relevancia (algoritmo)
- Botón "Filtros" desplegable con opciones:
  - Precio: menor a mayor
  - Precio: mayor a menor
  - Más vendidos
  - Envío gratis

✅ **Filtros disponibles:**
- Precio (rango con slider)
- Categoría
- Marca
- Envío gratis (toggle)
- Condición (nuevo / usado)

✅ **Búsquedas recientes:** solo para usuarios registrados, guardadas en BD (sincroniza entre dispositivos)

⚠️ **CRÍTICO:** Las campañas NO aparecen en el marketplace ni en los resultados de búsqueda del marketplace. Campañas y Marketplace son **mundos separados**.

⚡ **Sugerencia mejorada:** agregar filtro de "Vendedor" (filtrar por Mercado Nuestro o por revendedor específico) cuando tengas muchos revendedores. Esto le da al comprador desconfiado la opción de comprar solo de la marca oficial.

---

## 10. Categorías

✅ **Estructura:**
- 2 niveles (Categoría → Subcategoría → Producto)
- Estilo Mercado Libre (categorías grandes con subcategorías adentro)

✅ **Visualización en home:** con íconos (estilo app)

✅ **Quién las crea:**
- Admin crea categorías y subcategorías
- Vendedor solo elige (no puede crear nuevas)

✅ **Cantidad:** muchas categorías desde el día 1 (tipo Mercado Libre)

### Propuesta de categorías iniciales

```
1. Electrónica, Audio y Video
   - Audio, Video, Cámaras, Smartwatch, Drones, Gaming, Accesorios
   
2. Computación
   - Laptops, Componentes, Periféricos, Almacenamiento, Redes
   
3. Celulares y Telefonía
   - Celulares, Fundas, Cargadores, Auriculares, Accesorios
   
4. Hogar, Muebles y Jardín
   - Muebles, Decoración, Iluminación, Textil hogar, Jardín
   
5. Electrodomésticos
   - Cocina, Lavado, Climatización, Pequeños electrodomésticos
   
6. Herramientas
   - Eléctricas, Manuales, Jardín, Construcción, Medición
   
7. Cocina y Bazar
   - Bazar, Mate y termos, Vajilla, Utensilios, Pequeños electro cocina
   
8. Bebés y Niños
   - Bebés, Juguetes, Ropa, Alimentación, Higiene
   
9. Belleza y Cuidado Personal
   - Cuidado facial, Maquillaje, Cabello, Perfumes, Aparatos
   
10. Deportes y Fitness
    - Fitness, Aire libre, Camping, Bicicletas, Pelotas y deportes
    
11. Accesorios para Vehículos
    - Auto, Moto, Camping vehicular, Audio car, Limpieza
    
12. Mascotas
    - Perros, Gatos, Aves, Peces, Accesorios
```

✅ **Categorías vacías:** se muestran con mensaje "Próximamente productos en esta categoría" + captura de email "Avisame cuando haya productos"

---

## 11. Detalle de producto

✅ **Fotos:**
- Mínimo 1 obligatoria
- Máximo 5 por producto

✅ **Video:**
- Opcional para todos los vendedores
- ⚡ Mercado Nuestro debería subirles video profesional a sus productos oficiales para diferenciarlos

✅ **Descripción:**
- Estilo Mercado Libre: texto con formato (negrita, lista, etc.) + campos específicos por categoría
- Cada categoría tiene su set de campos (ej: celulares tienen marca, modelo, RAM, etc.)
- Estos campos sirven después para FILTROS

✅ **Variantes:**
- Sí, talles + colores (ambos)
- Cada combinación tiene su precio y stock
- Comparten descripción y fotos generales

✅ **Reputación del vendedor:** SÍ siempre, estrellas + cantidad de ventas (incluyendo Mercado Nuestro como vendedor)

✅ **Opiniones de compradores:** SÍ siempre. Si hay 0 opiniones, mostrar "Sé el primero en opinar"

✅ **Stock visible:** número exacto siempre ("Quedan 5 unidades")

⚡ **Sugerencia mejorada:** considerá mostrar "Últimas X unidades" en rojo solo cuando queden menos de 5 (más urgencia visual). El número exacto siempre puede mostrarlo pero el destacado urgente solo cuando es bajo.

✅ **Botones de compra:**
- Ambos visibles
- "Comprar ahora" destacado (amarillo, lleva directo al checkout)
- "Agregar al carrito" secundario (azul)

✅ **Productos relacionados:** SÍ, abajo del producto

✅ **Información de envío:**
- Estilo Mercado Libre
- Cálculo según ubicación del usuario
- "Llega mañana" / "Llega en X días"
- "Envío gratis" o costo exacto

---

## 12. Envíos y logística

✅ **Proveedor logístico:**
- **UES Upostal** como proveedor principal del MVP
- DAC y otros se agregan en Fase 2

✅ **Modelo:**
- Mercado Nuestro centraliza TODO el envío
- Revendedores entregan al local de Paysandú
- Local: Leandro Gómez 1076, Paysandú
- Desde el local sale todo por UES al destino

✅ **Costo del envío del revendedor al local:**
- Si acerca al local: **gratis**
- Si quiere retiro a domicilio: lo paga el revendedor

✅ **Retiro en local físico:**
- Sí, gratis en Paysandú

✅ **Costo de envío al comprador:**
- Mostrado EXACTO en el detalle del producto
- Cálculo según CP del comprador
- Integración con API de UES (tabla fija al principio si la API tarda en estar lista)

### Tarifa sugerida (a confirmar con UES)

| Destino | Costo | Tiempo |
|---|---|---|
| Paysandú | Gratis | 24-48hs |
| Departamentos vecinos (Salto, Río Negro, Soriano) | Gratis arriba de $1.500 | 2-3 días |
| Resto del interior | Gratis arriba de $3.000, $200 si no | 3-5 días |
| Montevideo y Canelones | Gratis arriba de $3.000, $200 si no | 2-3 días |

⚠️ **Acción pendiente:** contactar a UES Upostal para obtener tarifas reales, condiciones del acuerdo, y acceso a la API.

---

## 13. Carrito y checkout

### Carrito

✅ **Visualización:** sidebar lateral (drawer que sale desde la derecha)

✅ **Persistencia:**
- Sin cuenta: en localStorage del navegador
- Al registrarse: se migra a la base de datos del usuario
- Sincroniza entre dispositivos cuando está registrado

✅ **Productos de varios vendedores:** se mezclan en el mismo carrito (un solo pago, división interna)

✅ **Cupones:** desde el MVP, código aplicable en carrito y checkout

✅ **Acciones en el carrito:**
- Cambiar cantidad
- Eliminar
- Ir a pagar

⚡ **Sugerencia mejorada:** agregar "Guardar para después" (mueve a favoritos sin eliminarlo) en Fase 2. Muchos eCommerce lo tienen y aumenta conversión.

### Checkout

✅ **Formato:** 4 pasos separados
1. Dirección
2. Envío
3. Pago
4. Confirmación (revisar todo + botón "Pagar")

✅ **Métodos de pago:**
- **Mercado Pago** (incluye internamente: tarjetas, Abitab, Redpagos, transferencia, QR, dinero en cuenta)
- **Efectivo al retirar en local** (solo si elige retiro)

✅ **Cuotas:** a criterio de Mercado Pago (sin absorber costos al inicio)

✅ **Confirmación post-pago:**
- Email completo con resumen del pedido
- Número de pedido, productos, total, dirección, fecha estimada
- Notificación push en la app

### Reglas operativas

✅ **Reserva de stock durante checkout:** 15 minutos

✅ **Email de recuperación de carrito abandonado:** sí, a la 1 hora

✅ **Cancelación de pedido:** hasta 24 horas después de pagar (si todavía no se envió)

✅ **Pago al vendedor (revendedor):** Mercado Pago retiene 7-14 días automático

✅ **Facturación:**
- **Factura electrónica DGI obligatoria**
- ⚠️ Requiere contratación de proveedor (Memory, ZurediWebnet o similar)
- Costo: USD 30-100/mes
- ⚠️ Consultar con contador uruguayo antes de lanzar (tipo de empresa, régimen)

---

## 14. Estados del pedido y seguimiento

✅ **Estados del pedido:**

```
1. PAGO PENDIENTE
   ↓
2. PAGADO / EN PREPARACIÓN
   ↓
3. LISTO PARA ENVIAR
   ↓
4. EN CAMINO
   ↓
5. ENTREGADO
   ↓
6. COMPLETADO

Estados alternativos: CANCELADO | PROBLEMA | DEVUELTO
```

✅ **Notificaciones por cambio de estado:**
- Push notification: en TODOS los cambios
- Email: solo en críticos (Pagado, En camino, Entregado, Problema)
- ⚡ Esta separación entre push y email evita saturar al usuario

✅ **Tracking en tiempo real:** SÍ, integrado con API de UES
- ⚠️ Acción pendiente: contactar a UES para acceso a API
- Mientras tanto: link externo al sitio de UES con número de seguimiento

✅ **Evidencia de entrega:** confirmación manual del comprador
- Botón "Recibí mi pedido" en la app
- Timeout de 7 días: si no confirma, se da por entregado

✅ **Chat comprador-vendedor:**
- Sí, dentro de la plataforma
- Activo hasta que el pedido se marca como "completado"
- ⚠️ Funcionalidad pesada de programar (real-time, notificaciones, etc.)
- ⚡ **Alternativa más simple:** WhatsApp del vendedor visible en el detalle del pedido. Más fácil de implementar, mejor UX en Uruguay. Considerá esta opción si el desarrollo del chat se demora.

✅ **Página de seguimiento:** dentro de "Mis pedidos" (sin página dedicada separada)

---

## 15. Reseñas y opiniones

✅ **Quién puede opinar:** solo si compró (verificada)
- Se habilita cuando el pedido pasa a "Completado"
- Email a los 3 días post-entrega pidiendo opinión

✅ **Contenido de opinión:**
- Estrellas (1-5)
- Texto
- Foto opcional

✅ **Qué se califica:**
- Producto (público en el detalle)
- Vendedor (afecta su reputación general)
- Envío NO se califica (es responsabilidad de Mercado Nuestro)

✅ **Moderación:** automática (filtros de lenguaje ofensivo y spam)
⚡ **Sugerencia mejorada agregada:** botón "Reportar opinión" en cada reseña para que la comunidad ayude a detectar problemas. Las reportadas van a cola de revisión manual del admin.

✅ **Respuesta del vendedor:** sí, pública visible para todos
- Una respuesta por opinión
- También se modera

---

## 16. Favoritos

✅ **Acceso:** solo usuarios registrados
- Al darle al corazón sin login, modal "Para guardar favoritos necesitás una cuenta"

✅ **Qué se puede guardar:** solo productos

✅ **Listas:** una sola lista "Mis favoritos" (sin múltiples listas)

✅ **Notificaciones automáticas:**
- Cuando un producto favorito baja de precio
- Cuando vuelve a tener stock

⚡ **Sugerencia mejorada:** en Fase 2 considerá agregar:
- Múltiples listas con nombre ("Regalo de mamá", "Para casa nueva")
- Seguir vendedores (no solo productos)

---

## 17. Notificaciones

✅ **Canales:**
- Email
- Push notifications (web y mobile)
- SMS solo para verificación de cuenta y recuperación de contraseña (no notificaciones generales)

✅ **Preferencias del usuario:** panel completo
- Cada tipo de notificación se puede activar/desactivar
- **Las notificaciones de pedidos son obligatorias** (no se pueden desactivar por motivos operativos)

⚡ **Sugerencia mejorada:** agrupar las preferencias en categorías:
- Pedidos (obligatorias, no se desactivan)
- Campañas (novedades, cierres, etc.)
- Favoritos (baja de precio, stock)
- Marketing y novedades (newsletter, promos)
- Mensajes (chats de vendedores)

✅ **Newsletter:** solo opt-in al registrarse (casilla tildable opcional)

✅ **Notificaciones in-app:** banner pequeño no intrusivo arriba del contenido

✅ **Historial de notificaciones:** 
- Campanita en el header con contador de no leídas
- Página dedicada `/app/mi-cuenta/notificaciones` con historial completo

### Lista completa de notificaciones del sistema

| Trigger | Canal | Categoría |
|---|---|---|
| Registro exitoso | SMS (código) | Verificación |
| Email verificado | Email | Cuenta |
| Pago confirmado | Email + Push | Pedidos |
| Pedido en preparación | Push | Pedidos |
| Pedido listo para envío | Push | Pedidos |
| Pedido en camino | Email + Push | Pedidos |
| Pedido entregado | Email + Push | Pedidos |
| Pedir opinión (3 días post-entrega) | Email + Push | Marketing |
| Carrito abandonado (1 hora) | Email | Marketing |
| Producto favorito baja de precio | Email + Push | Favoritos |
| Producto favorito vuelve a tener stock | Email + Push | Favoritos |
| Campaña a la que te sumaste pasa a cierre | Email + Push | Campañas |
| Campaña que seguís arranca | Email + Push | Campañas |
| Campaña concretada (alcanzó MOQ) | Email + Push | Campañas |
| Campaña cancelada (no alcanzó MOQ) | Email + Push | Campañas |
| Tu propuesta fue convertida en campaña | Email + Push | Propuestas |
| Nuevo mensaje del vendedor | Push | Mensajes |
| Reseña respondida por vendedor | Push | Mensajes |
| Newsletter (opcional) | Email | Marketing |

---

## 18. Mi cuenta del usuario

✅ **Direcciones:**
- Hasta 3 por usuario
- Datos básicos: calle, número, depto, ciudad, código postal
- Una marcada como "predeterminada" para checkout
- ⚡ **Sugerencia mejorada:** agregar campo "Referencias" (ej: "frente a la plaza", "casa blanca"). Muy útil en Uruguay, especialmente interior. El repartidor lo agradece.

✅ **Métodos de pago guardados:**
- **Tokenización en Mercado Pago** (NO se guardan tarjetas en nuestra base de datos)
- ⚠️ Esto es crítico legalmente (PCI DSS)
- El usuario ve "Visa **** 1234" pero los datos reales están en Mercado Pago

✅ **Eliminar cuenta:**
- Auto-servicio inmediato
- Modal de confirmación con contraseña
- ⚠️ Los datos de facturación electrónica se conservan 10 años por ley DGI (en archivo aparte)

⚡ **Sugerencia mejorada:** considerá agregar **30 días de gracia** antes de eliminar definitivamente. La cuenta se desactiva inmediatamente pero el usuario puede recuperarla si se arrepiente. Lo usan Google, Meta, etc. Es lo profesional y reduce reclamos.

✅ **2FA (autenticación dos pasos):**
- Solo con **Google Authenticator** (app autenticadora)
- Obligatorio para: **Admin** e **Importadores Profesionales** (Fase 2)
- No disponible para usuarios comunes en el MVP

### Estructura de "Mi cuenta"

```
👤 MI CUENTA
├── Perfil
│   ├── Foto, nombre, fecha de nacimiento
│   ├── Email (verificado)
│   ├── Teléfono (verificado)
│   ├── CI
│   └── Cambiar contraseña
├── Mis pedidos
├── Mis campañas (las que me sumé)
├── Mis propuestas
├── Mis favoritos
├── Mis opiniones (las que dejé)
├── Mis direcciones (hasta 3)
├── Métodos de pago (tarjetas tokenizadas)
├── Notificaciones (preferencias)
├── Seguridad
│   ├── Cambiar contraseña
│   └── Eliminar cuenta
└── Ayuda y soporte
```

---

## 19. Campañas (parte 1)

> Esta sección está parcialmente definida. La parte 2 se completa en el próximo chat.

✅ **Concepto:** compra grupal donde la gente se suma para que se importe un producto desde China. Cuanta más gente, mejor precio (escalones de precio).

✅ **Escalones de precio:**
- Definidos por el creador (admin o importador) en cada campaña
- Dependen de la negociación con la fábrica china
- Cantidad de escalones variable según producto

Ejemplo:
```
- 10 unidades = $1.500 c/u
- 30 unidades = $1.200 c/u
- 50 unidades = $1.000 c/u
- 100 unidades = $800 c/u
```

✅ **Modelo de pago:**
- 30% de seña al sumarse
- 70% al cierre de la campaña (cuando se confirma)

✅ **Devolución de seña:**

| Momento | Política |
|---|---|
| Días 1-5 desde que se sumó | Devolución TOTAL (por ley uruguaya, derecho de arrepentimiento) |
| Día 6 hasta 72hs antes del cierre | Devolución con descuento del 20% (cubre comisión Mercado Pago) |
| Últimas 72hs antes del cierre | Sin devolución posible |

⚠️ **Importante legal:** la política de devolución debe estar VISIBLE en la página de cada campaña antes de sumarse.

✅ **Si NO se alcanza el MOQ:**
- Cancelación automática
- Devolución total a todos los participantes (aunque hayan pasado los días)
- Email con campañas similares activas

✅ **Sistema de invitaciones con incentivo:**
- Link único por usuario
- Cuando un invitado se suma a una campaña con tu link, recibís un descuento
- ⚠️ Requiere sistema de atribución (cookies, tracking, prevención de fraude)

### Decisiones PENDIENTES sobre Campañas (próximo chat)

🚧 ¿Cuál es el monto/% del descuento por referido?
🚧 ¿Cuándo se acredita el descuento (al sumarse el invitado o al confirmar la campaña)?
🚧 ¿Las campañas tienen duración fija o variable?
🚧 ¿Se ven los participantes (avatares, cantidad)?
🚧 ¿Se puede modificar la cantidad reservada después de pagar seña?
🚧 ¿Cómo se hace el envío de la campaña cuando llega a Uruguay (envío a domicilio, todos al local, etc.)?
🚧 ¿Hay confirmación de calidad antes de la entrega final?
🚧 ¿El comprador ve el "estado del barco" (En fábrica → En aduana → En depósito)?
🚧 ¿Pueden existir varias campañas del mismo producto al mismo tiempo?
🚧 ¿Categorías de campañas usan las mismas que el marketplace o son separadas?

---

## 20. Temas pendientes para próximo chat

Los siguientes temas quedan para definir en el próximo chat:

🚧 **Tema 12 — Campañas (parte 2):** completar todo el flujo
🚧 **Tema 13 — Propuestas:** cómo crear, votar, conversión a campaña
🚧 **Tema 14 — Vendedores por catálogo:** dashboard, link único, comisiones
🚧 **Tema 15 — Crear campaña (admin/importadores):** flujo de creación, gestión
🚧 **Tema 16 — Panel Admin completo:** dashboard, gestión de todo
🚧 **Tema 17 — Reclamos y devoluciones:** flujo completo
🚧 **Tema 18 — Soporte al cliente:** canales, tiempos, tickets
🚧 **Tema 19 — Datos legales y políticas:** términos, privacidad, devoluciones, cookies
🚧 **Tema 20 — Lanzamiento y growth:** estrategia inicial, métricas

---

## 21. Prompt para Claude Code

Cuando arranques una sesión nueva con Claude Code, copiale y pegale este texto al inicio:

```
Antes de hacer cualquier cosa, leé los siguientes documentos en orden:
1. /MERCADO_NUESTRO_DECISIONES.md (este documento, el más importante)
2. /ESTRUCTURA_APP.md (arquitectura del producto)
3. /COLORES.md (paleta oficial)
4. /HEADER.md (especificación del header)
5. /logos/LOGOS.md (uso de logos)
6. /iconos/ICONOS.md (uso de íconos)

Después de leerlos, confirmame que entendiste estos puntos críticos:

1. LA WEB HOME (mercadonuestro.uy/) YA ESTÁ ARMADA Y NO SE TOCA. 
   Trabajamos solo en la Web App (mercadonuestro.uy/app).

2. La Web App tiene 4 secciones:
   - Mercado Nuestro (marketplace, pantalla principal)
   - Campañas (compra grupal)
   - Propuestas (votación comunitaria)
   - Vendedores por catálogo (Fase 2, solo "Próximamente" en MVP)

3. Marketplace (Mercado Nuestro) y Campañas son MUNDOS SEPARADOS, 
   NO mezclan productos. El marketplace solo tiene productos disponibles 
   en Uruguay. Las campañas son productos a importar.

4. Stack: Next.js 15 + TypeScript + Tailwind + Supabase + Mercado Pago.

5. Tokenización de tarjetas en Mercado Pago (NUNCA guardar tarjetas en 
   nuestra BD, es ilegal sin PCI DSS).

6. Facturación electrónica DGI obligatoria (preparar BD desde día 1).

7. Roles: Visitante, Comprador, Revendedor (auto-activado con 5+ unidades), 
   Vendedor por catálogo (Fase 2), Importador Profesional (Fase 2), Admin.

8. Admin va en subdominio separado: admin.mercadonuestro.uy

9. 2FA con Google Authenticator obligatorio para Admin e Importadores.

10. Lo más importante: NO INVENTES NADA. Si algo no está definido en 
    los documentos, PREGUNTAME ANTES de implementar. Es preferible 
    pausar y preguntar que avanzar mal.

Después de confirmar que entendiste, decime con qué tarea querés que 
empiece. Vamos paso a paso, sin apurarnos.
```

---

## 22. Próximos pasos sugeridos

### Para vos (paralelo al desarrollo)

1. **Trámites legales:**
   - [ ] Constituir la empresa (si todavía no la tenés)
   - [ ] Consultar con contador uruguayo sobre régimen tributario
   - [ ] Contratar proveedor de facturación electrónica DGI
   - [ ] Definir los Términos y Condiciones, Política de Privacidad y Política de Devoluciones

2. **Acuerdos comerciales:**
   - [ ] Contactar a UES Upostal para negociar tarifas y acceso a API
   - [ ] Abrir cuenta de Mercado Pago Business (si no la tenés)
   - [ ] Contratar dominio si todavía no está: mercadonuestro.uy

3. **Cuentas técnicas:**
   - [ ] Crear cuenta en Vercel
   - [ ] Crear cuenta en Supabase
   - [ ] Crear cuenta en Resend (emails)
   - [ ] Crear cuenta en Twilio (SMS)
   - [ ] Crear cuenta en Firebase (push notifications)
   - [ ] Crear cuenta en Sentry (monitoreo)
   - [ ] Crear repositorio en GitHub

### Para Claude Code (desarrollo)

Con la información de este documento, Claude Code puede empezar a:

1. **Setup inicial del proyecto:**
   - Crear proyecto Next.js 15 con TypeScript
   - Configurar Tailwind con la paleta de COLORES.md
   - Configurar Supabase
   - Definir esquema de base de datos según los roles y entidades definidas
   - Configurar autenticación (email, Google, Facebook)

2. **Componentes base:**
   - Header de 3 barras (según HEADER.md)
   - Footer doble
   - Tab bar mobile
   - Componente de Card de producto
   - Componente de Card de campaña
   - Layouts base

3. **Páginas básicas:**
   - Home del marketplace `/app`
   - Página de categoría `/app/categoria/[slug]`
   - Detalle de producto `/app/producto/[slug]`
   - Carrito (sidebar)
   - Login/Registro

4. **Esperar definiciones** de las páginas/funcionalidades pendientes (campañas detalle, propuestas, vendedores, etc.)

---

## VERSIONADO

- **v1.0** (actual): primera versión con 12 temas decididos + Campañas parte 1
- **v1.1** (próximo chat): agregar Campañas parte 2, Propuestas, Vendedores
- **v1.2** (chat siguiente): agregar Crear campaña, Admin, Reclamos, Soporte, Legales
- **v2.0:** consolidación final pre-desarrollo
