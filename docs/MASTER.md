# MASTER.md — Documento Maestro de Mercado Nuestro

> Este documento es la referencia última del proyecto Mercado Nuestro. Cubre desde el modelo de negocio hasta los detalles técnicos de implementación. Está organizado en 10 bloques temáticos que se construyen unos sobre otros.
>
> **Audiencias previstas:**
> - Para programar con Claude Code: usar como referencia cruzada cuando el CLAUDE.md no alcanza
> - Para mostrar a socios, inversores o asesores: documento profesional del proyecto
> - Para consultar uno mismo: cerebro escrito del negocio
>
> **Mantenimiento:** este documento es vivo. Cuando se aprenda algo nuevo de un usuario real, cuando se tome una decisión importante, cuando un asesor agregue contexto legal, todo eso vuelve acá.

---

## Tabla de contenidos

- [Bloque 1 — Modelo de negocio](#bloque-1--modelo-de-negocio)
- [Bloque 2 — Roles y permisos de usuarios](#bloque-2--roles-y-permisos-de-usuarios)
- [Bloque 3 — Flujos de usuario completos](#bloque-3--flujos-de-usuario-completos)
- [Bloque 4 — Modelo de datos](#bloque-4--modelo-de-datos)
- [Bloque 5 — Arquitectura técnica](#bloque-5--arquitectura-técnica)
- [Bloque 6 — Pantallas y navegación](#bloque-6--pantallas-y-navegación)
- [Bloque 7 — Reglas de negocio críticas](#bloque-7--reglas-de-negocio-críticas)
- [Bloque 8 — Marco legal y operativo](#bloque-8--marco-legal-y-operativo)
- [Bloque 9 — Plan de lanzamiento](#bloque-9--plan-de-lanzamiento)
- [Bloque 10 — Estructura para Claude Code](#bloque-10--estructura-para-claude-code)

---

# Bloque 1 — Modelo de negocio

## 1.1 Qué es Mercado Nuestro

Mercado Nuestro es una plataforma uruguaya de comercio que integra cuatro modelos en un solo ecosistema: importación grupal colaborativa, marketplace de reventa entre usuarios, venta directa de stock disponible, y red de vendedores por catálogo digital. Su propósito es permitir que personas y pequeños comerciantes uruguayos accedan a precios de importación al por mayor sumándose entre sí, eliminando la ventaja exclusiva que hoy tienen las grandes empresas importadoras.

## 1.2 El problema que resuelve

Uruguay es un mercado chico. Los proveedores extranjeros, especialmente de China, otorgan mejores precios por volumen. Las grandes importadoras compran cantidades altas y obtienen precios bajos que los importadores chicos no pueden igualar. Esto genera tres consecuencias para el mercado uruguayo: precios finales altos al consumidor porque hay poca competencia real, imposibilidad de subsistir para el importador pequeño, y dependencia del consumidor de las pocas marcas que dominan cada categoría.

La consecuencia secundaria es que el usuario final paga sobreprecios sistemáticos sobre productos que en origen valen mucho menos. Un artículo que en China cuesta USD 5 puede llegar a venderse en USD 30 o más en una tienda local. Parte de esa diferencia es legítima (impuestos, logística, margen razonable) pero una parte importante es captura de valor por falta de competencia.

## 1.3 La solución que propone Mercado Nuestro

La plataforma agrupa la demanda dispersa de muchos compradores chicos hasta alcanzar volúmenes que justifican una importación directa al precio que paga un importador grande. El operador de la plataforma actúa como importador formal con RUT y empresa habilitada, asume la gestión aduanera y logística, y entrega el producto a cada participante a un precio dramáticamente menor al de tienda.

Además, los participantes pueden importar para consumo propio o para reventa. Quienes importan para revender publican su stock en el marketplace integrado, donde otros usuarios pueden comprar productos que ya están físicamente en Uruguay. Esto convierte a los usuarios en una red de distribución descentralizada que compite con las tiendas tradicionales.

## 1.4 Las cuatro líneas de negocio

**Línea 1 — Importación grupal.** Es el motor del sistema. Mercado Nuestro abre campañas de importación con un producto, un precio escalonado por volumen, una cantidad mínima de orden (MOQ) y una fecha límite. Los usuarios reservan unidades pagando una seña. Cuando se alcanza el MOQ, la campaña se cierra, se cobra el saldo, y se ejecuta la importación. La operación gana por comisión sobre el valor de cada campaña ejecutada.

**Línea 2 — Marketplace de reventa.** Los usuarios que importaron para revender publican su stock en una sección de la plataforma. Como obtuvieron el producto a precio de importación grupal, pueden ofrecerlo a un precio inferior al de tiendas tradicionales y aún así obtener margen. Mercado Nuestro gana por comisión sobre cada venta del marketplace.

**Línea 3 — Venta directa de stock disponible.** El local físico de Paysandú (Leandro Gómez 1076) opera como punto de venta de muestras, productos sobrantes de campañas y stock seleccionado para venta inmediata. Estos productos se publican también en la web con etiqueta de "disponible ya", y se compran como en cualquier eCommerce tradicional. La operación gana por margen directo sobre el precio de venta.

**Línea 4 — Red de vendedores por catálogo digital.** Personas registradas como vendedores reciben un catálogo digital propio (link personalizado) y cobran comisión más bonos por objetivos sobre cada venta generada a través de su catálogo. Esto convierte a la red de vendedores en un canal de adquisición y distribución descentralizado, especialmente potente en el interior del país. La operación no paga por adquirir esos clientes, paga solo cuando hay venta concretada.

## 1.5 Cómo se conectan las cuatro líneas

Las cuatro líneas no son negocios separados sino que se alimentan entre sí formando un ciclo virtuoso. Las campañas de importación generan stock en manos de usuarios revendedores, que alimentan el marketplace. El marketplace y la venta directa generan tráfico y reputación que atraen más usuarios a las campañas. Los vendedores por catálogo distribuyen tanto productos en campaña (reservas) como productos disponibles (venta directa y marketplace), ampliando el alcance de las otras tres líneas. El local físico de Paysandú soporta a las cuatro: como vidriera, como punto de retiro, como sede de transmisiones en vivo, y como prueba de existencia física que genera confianza.

## 1.6 Propuesta de valor por tipo de usuario

**Para el comprador final:** acceso a productos de calidad importada al precio más bajo posible en Uruguay, con una garantía de plataforma sobre la operación. Acepta esperar más tiempo (entre 30 y 90 días según el caso) a cambio de pagar mucho menos.

**Para el comprador-revendedor:** acceso a stock a precio de mayorista sin necesidad de tener empresa importadora, sin tramitar aduana, sin asumir el riesgo logístico, y con un canal de venta integrado en la misma plataforma.

**Para el vendedor por catálogo:** posibilidad de generar ingresos vendiendo desde su celular sin invertir dinero ni tener stock, con un catálogo profesional que se actualiza solo, comisiones competitivas y bonos por desempeño.

**Para el comprador inmediato:** acceso a productos disponibles ahora a un precio menor al de tiendas tradicionales, con la opción de retirar en local o recibir a domicilio.

## 1.7 Modelo de ingresos consolidado

Mercado Nuestro genera ingresos por cinco vías simultáneas: comisión sobre el valor de cada campaña de importación ejecutada, comisión sobre cada venta del marketplace de reventa, margen comercial directo sobre la venta de stock disponible, comisión sobre la importación cuando la realiza un vendedor avanzado (futuro), y eventuales ingresos por servicios premium o destacados (futuro).

La estructura de comisiones inicial propuesta (preliminar, ajustar con datos reales) es: entre 10% y 15% sobre el valor FOB de cada campaña de importación, entre 7% y 10% sobre cada transacción del marketplace, margen libre sobre stock disponible según producto, y modelo a definir para vendedores avanzados cuando se habilite esa función.

## 1.8 Diferenciación frente a alternativas existentes

**Frente a Mercado Libre Uruguay:** Mercado Nuestro no compite por la misma franja. Mercado Libre vende productos disponibles a precios de tienda con comisiones del 13-18% para el vendedor. Mercado Nuestro vende a precios de importación con espera, y a precios menores que tienda en su sección disponible. El usuario de Mercado Nuestro acepta un trade-off de tiempo a cambio de un precio sustancialmente menor.

**Frente a comprar directamente en AliExpress/Shein/Temu:** Mercado Nuestro ofrece soporte local en español, garantía sobre la operación, posibilidad de pagar en pesos uruguayos por Abitab o transferencia, retiro físico en local, y resolución de problemas con persona real. Las plataformas chinas tienen precios bajos pero el comprador uruguayo asume todo el riesgo aduanero, los costos de courier no incluidos en el precio mostrado, y la imposibilidad de reclamar localmente si algo falla.

**Frente a importadores tradicionales uruguayos:** Mercado Nuestro traslada el descuento por volumen al consumidor en vez de capturarlo como margen. Es una propuesta estructuralmente más competitiva en precio, sostenida por la operación colaborativa.

**Frente a otros modelos de compra grupal:** en Uruguay no existe hoy una plataforma consolidada de importación grupal con esta estructura. Los intentos suelen ser informales (grupos de WhatsApp, publicaciones aisladas) sin garantías, sin transparencia de precios, sin marketplace integrado y sin red de vendedores.

## 1.9 Mercado objetivo inicial

**Geográfico:** Uruguay completo, con foco inicial en Paysandú (zona de influencia directa del local físico) y Montevideo (mayor concentración de demanda). Expansión natural a Salto, Maldonado, Canelones y resto del interior en una segunda etapa.

**Demográfico:** personas entre 25 y 55 años con cierta familiaridad con compras online o disposición a aprender, sensibles al precio, dispuestas a esperar a cambio de ahorrar. Subgrupos clave: pequeños comerciantes que revenden, emprendedores de redes sociales, padres de familia que buscan ahorrar en categorías específicas (electrónica, ropa, hogar), vendedores de catálogo tradicional con interés en migrar a digital.

**Por uso:** consumidores finales que compran para sí mismos, revendedores que compran para ofrecer en sus propios canales (Instagram, WhatsApp, ferias, local), y vendedores que se suman a la red de catálogo digital para generar ingresos sin invertir.

## 1.10 Visión a tres años

En el horizonte corto (año 1) la plataforma busca validar el modelo con 6 a 10 campañas exitosas, construir base de usuarios entre 1.000 y 3.000 cuentas activas, consolidar el local de Paysandú como referencia, y armar una red inicial de 30 a 50 vendedores por catálogo activos. En el horizonte medio (año 2) busca expandir el catálogo a múltiples verticales, llegar a 10.000 usuarios, habilitar a vendedores avanzados como organizadores de campañas, e incorporar transmisiones en vivo regulares con influencers locales y proveedores chinos. En el horizonte largo (año 3) busca posicionarse como la principal plataforma de compra colaborativa de Uruguay, evaluar expansión regional (Argentina y Paraguay tienen mercados similares con dinámica parecida), y explorar líneas de negocio adicionales como financiamiento de campañas, logística para terceros, o marca propia.

---

# Bloque 2 — Roles y permisos de usuarios

## 2.1 Filosofía de roles

Mercado Nuestro maneja varios tipos de usuario con permisos distintos, pero la filosofía es que un mismo usuario puede acumular roles a lo largo de su vida en la plataforma. Una persona puede empezar como simple comprador, después sumarse como vendedor por catálogo, y eventualmente convertirse en importador con campañas propias. No son cuentas separadas: es la misma cuenta con capacidades que se van habilitando.

Esto tiene dos consecuencias técnicas importantes. Primero, en la base de datos no usamos un campo único `tipo_usuario` sino un sistema de roles que se asignan a la cuenta. Segundo, la interfaz se adapta dinámicamente a lo que el usuario puede hacer: si activa el rol vendedor, le aparece la sección de catálogo; si no, no le aparece.

## 2.2 Los seis roles del sistema

**Rol 1 — Visitante (no registrado).** Es cualquier persona que entra a la web sin haber creado cuenta. Puede navegar el catálogo, ver campañas activas, ver productos del marketplace y del local, leer reseñas, ver precios, ver el progreso de las campañas. No puede reservar, comprar, dejar reseñas ni contactar. Cuando intenta hacer algo de eso, se le pide que cree cuenta o inicie sesión. Esta navegación abierta es importante para SEO y para que la gente conozca la plataforma sin fricción.

**Rol 2 — Comprador.** Es el usuario registrado básico. Es el rol que tienen por defecto todos al crear cuenta. Puede reservar unidades en campañas activas, comprar productos disponibles (stock local), comprar productos del marketplace, agregar a lista de deseos, dejar reseñas sobre productos que efectivamente compró, ver su historial de pedidos, gestionar sus direcciones, gestionar sus métodos de pago, recibir notificaciones, contactar al soporte. No puede vender, ni publicar productos, ni acceder a paneles especiales.

**Rol 3 — Vendedor por catálogo.** Es un comprador que además se inscribió formalmente en el programa de vendedores. Tiene un panel propio con su catálogo digital personalizado (link único tipo `mercadonuestro.uy/v/maria-perez`), ve sus comisiones acumuladas, sus objetivos del mes y el progreso hacia el próximo escalón, sus clientes referidos, su historial de ventas. Comparte el catálogo por WhatsApp o redes sociales y cada venta que entra por su link le genera comisión automática. No tiene stock propio: vende lo que está disponible en la plataforma. No publica productos.

**Rol 4 — Revendedor / Importador minorista.** Es un comprador que participó en campañas de importación y tiene stock propio que quiere revender. Puede publicar productos en el marketplace, gestionar su stock, fijar precios de reventa, responder consultas de compradores, gestionar envíos de sus ventas, ver su historial como vendedor del marketplace. Para acceder a este rol, el usuario debe haber recibido al menos una importación de una campaña, lo que garantiza que tiene producto real para vender. No abre campañas propias.

**Rol 5 — Importador avanzado.** Es un revendedor con trayectoria que solicita y obtiene permiso para abrir sus propias campañas de importación bajo el paraguas de Mercado Nuestro. La plataforma sigue siendo el importador formal y opera la aduana, pero el usuario lidera la curaduría del producto, negocia con el proveedor, y cobra una comisión adicional. Este rol se habilita en Fase 3, no en el MVP. Se deja definido para que el sistema de permisos esté preparado desde el inicio.

**Rol 6 — Administrador.** Es el equipo interno de Mercado Nuestro. Tiene acceso completo a la plataforma vía un panel administrativo separado del sitio público. Puede crear y gestionar campañas, aprobar usuarios para roles avanzados, gestionar productos del local físico, ver todos los pedidos, gestionar inventario, ver métricas y reportes, gestionar contenido, responder consultas de soporte, ejecutar acciones de excepción.

## 2.3 Subdivisiones dentro del rol administrador

Aunque al inicio el admin es una sola persona, conviene dejar previstos sub-roles administrativos para cuando crezca el equipo: Super-admin (acceso total incluyendo configuración del sistema y gestión de otros admins), Operador de campañas (puede crear y gestionar campañas, pero no toca configuración general ni ve datos financieros consolidados), Atención al cliente (responde consultas, ve pedidos, puede emitir reembolsos hasta cierto monto, no toca campañas ni inventario), y Encargado de local (gestiona stock físico de Paysandú, marca productos como retirados, no toca el resto). El sistema de permisos lo soporta desde el día uno aunque se implemente después.

## 2.4 Tabla resumen de permisos

| Acción | Visitante | Comprador | Vendedor cat. | Revendedor | Imp. avanzado | Admin |
|---|---|---|---|---|---|---|
| Navegar catálogo | Sí | Sí | Sí | Sí | Sí | Sí |
| Ver precios y campañas | Sí | Sí | Sí | Sí | Sí | Sí |
| Crear cuenta | Sí | — | — | — | — | — |
| Reservar en campañas | No | Sí | Sí | Sí | Sí | Sí |
| Comprar disponible | No | Sí | Sí | Sí | Sí | Sí |
| Dejar reseñas | No | Cond | Cond | Cond | Cond | Sí |
| Lista de deseos | No | Sí | Sí | Sí | Sí | Sí |
| Catálogo digital propio | No | No | Sí | Cond | Sí | Sí |
| Publicar en marketplace | No | No | No | Sí | Sí | Sí |
| Abrir campañas propias | No | No | No | No | Sí | Sí |
| Acceso panel admin | No | No | No | No | No | Sí |
| Ver datos de otros usuarios | No | No | No | No | No | Cond |

**Condicionalidades importantes:** para dejar reseñas, el usuario debe haber comprado efectivamente el producto. Para que un revendedor tenga catálogo digital propio, debe activarlo en su panel (no es automático, es opcional). Para que un admin vea datos de otros usuarios, depende del sub-rol y de los permisos específicos asignados.

## 2.5 Cómo se obtiene cada rol

**Comprador:** automático al crear cuenta y verificar email.

**Vendedor por catálogo:** el usuario solicita el rol desde su perfil. Lee y acepta las condiciones del programa. En el MVP la aprobación es automática para que no haya fricción. En etapas posteriores se podría agregar verificación manual si aparecen casos de abuso.

**Revendedor:** se habilita automáticamente cuando el usuario recibe la entrega de su primer pedido en una campaña con cantidad mayor a un umbral (configurable, sugerido 5 unidades del mismo producto). El sistema le manda una notificación: "Acabás de recibir varias unidades de X producto. ¿Querés publicarlas para reventa?". Si acepta, se activa el rol.

**Importador avanzado:** solicitud manual con revisión por parte del administrador. Requisitos sugeridos: al menos 6 meses como revendedor activo, mínimo de ventas concretadas en el marketplace, reputación promedio aceptable, sin incidentes graves. Funcionalidad Fase 3.

**Administrador:** lo asigna otro administrador desde el panel. Nunca es automático ni autoservicio.

## 2.6 Verificación de identidad

**Comprador:** verificación de email y teléfono (con código SMS o WhatsApp).

**Vendedor por catálogo:** además del email y teléfono, cédula de identidad uruguaya (foto del documento) y dirección. Necesario porque se le paga dinero y debe emitirse comprobante.

**Revendedor:** mismo nivel que vendedor por catálogo. Más adelante, si supera cierto volumen, debería tener RUT propio (responsabilidad del usuario).

**Importador avanzado:** verificación reforzada, incluyendo RUT activo, antecedentes, y firma de un acuerdo formal con Mercado Nuestro.

## 2.7 Inicio de sesión y autenticación

Métodos soportados:

- **Email y contraseña:** disponible siempre.
- **Google (OAuth):** muy usado en Uruguay, sube la conversión de registro.
- **WhatsApp / Teléfono:** ingreso por código SMS o WhatsApp. Importante para Uruguay porque mucha gente del interior y mayor no tiene Gmail activo pero sí WhatsApp. Implementable con Supabase Auth + Twilio. Sugerido para Fase 2.
- **Apple ID:** opcional, recomendado si se llega a tener app móvil iOS.

Cualquier método elegido lleva a la misma cuenta del usuario. Si alguien se registró con email y después inicia con Google del mismo email, debe entrar a la misma cuenta.

## 2.8 Sesiones y seguridad

Las sesiones duran por defecto 30 días con renovación automática. El usuario puede cerrar sesión manualmente. Se pide reautenticación para acciones sensibles: cambiar contraseña, cambiar email, cambiar método de pago principal, retirar comisiones. Toda la autenticación pasa por Supabase Auth.

Las cuentas se pueden bloquear desde el panel admin por motivos como: fraude detectado, abuso del sistema, reclamos múltiples sin resolver, incumplimiento de términos. El bloqueo congela todas las funciones del usuario pero conserva el historial para auditoría.

## 2.9 Datos personales que se guardan por rol

**Comprador:** nombre completo, email, teléfono, dirección de envío principal, direcciones adicionales opcionales, fecha de nacimiento opcional, preferencias de notificación.

**Vendedor por catálogo / Revendedor:** todo lo del comprador, más cédula de identidad, dirección fiscal, eventualmente RUT, datos bancarios o medio de cobro para recibir comisiones, foto de perfil pública (opcional), nombre o nombre comercial visible en el catálogo público.

**Importador avanzado:** todo lo anterior, más RUT obligatorio, datos de la empresa si la tiene, acuerdo firmado con la plataforma.

Todos los datos sensibles se almacenan cifrados. La cédula de identidad y los datos bancarios solo son accesibles para el administrador autorizado y para el propio usuario, nunca para otros usuarios.

## 2.10 Implicaciones técnicas

En la base de datos: tabla `users` con datos básicos, tabla `user_roles` que asocia usuarios con roles (uno a muchos), tabla `role_permissions` que define qué puede hacer cada rol, y tabla `user_verifications` que registra los documentos cargados y su estado.

En el frontend: cada componente que muestra un botón de acción consulta los permisos del usuario antes de renderizarse. Si no tiene el permiso, el botón no aparece o aparece con una llamada a obtener el permiso.

En el backend: cada endpoint de la API valida los permisos antes de ejecutar la acción. Nunca confiar en que el frontend ocultó el botón.

---

# Bloque 3 — Flujos de usuario completos

## 3.1 Filosofía de diseño de flujos

Cada flujo de Mercado Nuestro está pensado para que el usuario nunca tenga dudas sobre tres cosas: qué está comprando exactamente, cuándo lo va a recibir, y cuánto va a terminar pagando en total. Esto es crítico porque el modelo de importación grupal naturalmente genera incertidumbre. Si el usuario tiene alguna de esas tres incógnitas sin resolver al momento de pagar, se va a frustrar después y va a generar reclamos.

Por eso cada flujo crítico tiene tres principios: transparencia total de costos (mostrar siempre el total final), comunicación proactiva (avisar al usuario cada cambio de estado sin que tenga que entrar a consultar), y opciones claras en cada bifurcación.

## 3.2 Flujo: registro de nuevo usuario

El usuario entra a la web y navega como visitante. En algún momento intenta hacer una acción que requiere cuenta (reservar, comprar, dejar reseña). El sistema le muestra un modal con tres opciones: continuar con Google, continuar con email, o entrar si ya tiene cuenta.

Si elige Google, autoriza con Google y el sistema crea automáticamente la cuenta con su nombre y email. Le pide después un dato adicional obligatorio: teléfono celular para notificaciones. Le envía código de verificación por SMS (o WhatsApp en Fase 2) que ingresa para confirmar.

Si elige email, completa: nombre, apellido, email, contraseña, teléfono. El sistema le envía email de verificación con link y código SMS para el teléfono. Tiene que confirmar ambos para activar la cuenta.

Después del registro, el sistema le muestra una pantalla de bienvenida con tres opciones: "Quiero empezar a comprar" (lo lleva al catálogo), "Quiero vender desde mi celular" (lo lleva al onboarding de vendedor por catálogo), o "Quiero conocer la plataforma" (lo lleva a una pantalla explicativa de cómo funcionan las campañas).

Datos que se piden en el registro: solo lo mínimo. Dirección de envío, fecha de nacimiento, preferencias de comunicación, todo se completa después cuando el usuario hace su primera compra o entra a su perfil.

## 3.3 Flujo: ciclo de vida completo de una campaña de importación

Este es el flujo más complejo y el más importante. Se divide en seis etapas.

### Etapa 1 — Creación de la campaña (admin)

El admin desde el panel crea una nueva campaña cargando: nombre del producto, descripción, fotos, características técnicas, link al proveedor (visible solo a admins), precio FOB de origen, costo estimado total por unidad, escalones de precio por volumen, MOQ, cantidad máxima opcional, fecha límite de cierre, fecha estimada de llegada, política de devolución específica, categoría, porcentaje de seña requerido (sugerido 30%).

**Importante:** los escalones de precio los define el admin según información del proveedor. No son automáticos. Cada producto tiene sus propios escalones porque dependen del MOQ del proveedor.

Antes de publicarla, vista previa. La campaña queda en estado `borrador` hasta publicación. Una vez publicada, no se pueden cambiar: MOQ, escalones de precio, fecha límite. Se pueden editar: descripciones, fotos adicionales, FAQ.

### Etapa 2 — Campaña activa, usuarios reservan

La campaña aparece en la home y en la sección de campañas activas. Muestra: foto principal, nombre, precio actual según volumen alcanzado, precio mínimo posible si se completa el escalón máximo, barra de progreso visual (cantidad reservada sobre MOQ), tiempo restante hasta el cierre, cantidad de personas sumadas.

El usuario entra al detalle, ve fotos, descripción, características, reseñas si hay (de campañas anteriores del mismo producto), y decide cuántas unidades quiere reservar. El sistema muestra desglose claro: precio actual por unidad por la cantidad, seña a pagar ahora (30%), saldo a pagar al cierre (70%), costo estimado de envío local (informativo), total final aproximado. Si el precio mejora por volumen, muestra: "Si la campaña llega a 300 unidades, vas a pagar solo USD 8 por unidad en lugar de USD 10".

El usuario confirma. Pasa al checkout de seña. Elige método de pago. Paga la seña. Recibe email + notificación de confirmación. La barra de progreso se actualiza.

**Función de compartir:** botón prominente que abre opciones: WhatsApp (con mensaje pre-armado editable), Instagram, Facebook, copiar link, QR. El link compartido incluye parámetro de atribución.

El usuario puede entrar a "Mis pedidos" y ver el estado. Puede cancelar la reserva hasta **72 horas antes del cierre** con devolución de seña. Después de ese plazo, la seña se considera comprometida.

### Etapa 3 — Cierre de la campaña

Llega la fecha límite. El sistema verifica si se alcanzó el MOQ.

**Si SÍ se alcanzó:** la campaña pasa a estado `cerrada_exitosa`. El sistema notifica a todos los participantes: "Tu campaña se cerró exitosamente. Llegaste a X unidades, el precio final es USD Y por unidad". Calcula automáticamente el saldo que cada uno debe pagar (precio final menos seña ya pagada, por la cantidad reservada). Si pagaron seña basada en un precio mayor, la diferencia se descuenta del saldo o se acredita como crédito. Le da al usuario 5 días hábiles para pagar el saldo. Si paga en plazo, su pedido queda en estado `pagado, esperando llegada`. Si no paga, pierde la seña y su lugar se libera.

**Si NO se alcanzó el MOQ:** la campaña pasa a estado `cerrada_fallida`. El sistema notifica: "Lamentablemente la campaña no alcanzó el mínimo necesario. Estamos devolviendo las señas". Se devuelven automáticamente al método de pago original en X días hábiles. El usuario puede optar por dejar el dinero como crédito en cuenta con bonus del 5%.

**Situación intermedia:** si la campaña está al 85% del MOQ y restan menos de 7 días, el admin puede decidir extender el plazo UNA SOLA VEZ por hasta 7 días. Se notifica a los participantes.

### Etapa 4 — Importación en curso

La campaña se ejecutó. El admin paga al proveedor, gestiona la importación. El sistema permite cargar actualizaciones de estado que se notifican a los participantes: "Pedido confirmado con proveedor", "Producto despachado desde origen", "En tránsito marítimo", "Llegó a aduana de Montevideo", "En proceso de despacho aduanero", "Llegó al depósito de Paysandú", "Listo para entrega".

Cada actualización dispara una notificación. Esto es lo que más calma la ansiedad del usuario. Los plazos largos se toleran mucho mejor cuando hay comunicación frecuente.

### Etapa 5 — Entrega al usuario

Cuando el producto llegó al depósito y está listo, el sistema le pregunta al usuario cómo quiere recibirlo: retiro gratuito en local de Paysandú, envío a su dirección con la empresa de logística (costo a cargo del usuario, se cobra al confirmar envío), retiro en punto de la empresa de logística.

El usuario elige y, si corresponde, paga el envío. La empresa retira del depósito, entrega al usuario, marca como entregado. El sistema lo refleja. El usuario recibe notificación y se le invita a dejar reseña (habilitada 3 días después de la entrega).

### Etapa 6 — Cierre del ciclo y opciones post-venta

Una vez entregado, el usuario tiene 7 días para reclamar si el producto tiene defectos. Los reclamos se gestionan desde su panel y llegan al admin.

Si el usuario recibió más de 5 unidades del mismo producto (umbral configurable), el sistema le ofrece automáticamente activar el rol de revendedor y publicar el sobrante en el marketplace. Le muestra incluso un precio sugerido de reventa.

## 3.4 Flujo: compra de producto disponible (stock local)

Flujo de eCommerce tradicional, mucho más simple.

El usuario navega el catálogo, filtra por "disponible ya". Ve productos con etiqueta clara de "Disponible, llega en 2 a 5 días hábiles". Entra al detalle. Ve foto, descripción, precio fijo, stock disponible. Si está agotado, ve la opción "Avisarme cuando vuelva" o, si está siendo importado en una campaña activa, "Reservar en próxima campaña".

Agrega al carrito o "Comprar ahora". El carrito puede contener productos de distintos tipos: disponibles, reservas en campañas, productos del marketplace. Cada item muestra claramente su tipo y plazo de entrega.

Va al checkout. Elige dirección de envío (o retiro en local). Elige método de pago. Confirma. Recibe confirmación.

**Distinción importante en el carrito:** los productos disponibles se pagan 100% al confirmar. Las reservas de campañas se pagan 30% al confirmar (seña). Esto se ve claro en el resumen: "Pagás ahora USD X, vas a pagar después USD Y cuando se cierre la campaña".

## 3.5 Flujo: compra en el marketplace de reventa

Similar al de stock disponible pero con un revendedor en el medio.

El usuario entra al marketplace, navega productos publicados. Cada publicación muestra: foto, precio, nombre del vendedor, reputación, tiempo en la plataforma, productos vendidos.

El usuario entra al detalle. Puede contactar al vendedor con preguntas a través de un chat interno (no se pasan WhatsApps ni teléfonos). Si se decide, agrega al carrito y va al checkout.

**Decisión clave:** el pago siempre pasa por Mercado Nuestro como intermediario (modelo escrow). El comprador paga a la plataforma. La plataforma retiene el pago. El revendedor despacha. Cuando el comprador confirma recepción (o pasan 3 días sin reclamo), la plataforma libera el dinero al revendedor menos la comisión.

El envío de productos del marketplace lo coordina el revendedor con sus propios medios o con la misma empresa de logística que usa la plataforma. El comprador paga el envío al confirmar la compra.

## 3.6 Flujo: alta y operativa del vendedor por catálogo

Un comprador entra a su perfil, ve un banner "Generá ingresos vendiendo desde tu celular". Hace clic, ve la pantalla explicativa. Hace clic en "Quiero ser vendedor". Acepta los términos, completa datos adicionales (cédula, dirección fiscal, datos para cobrar), elige su "nombre de vendedor" (que forma su URL: `mercadonuestro.uy/v/maria-perez`), sube foto de perfil. Aprobación automática en el MVP.

Una vez activado, accede al panel de vendedor con:

**Sección Mi catálogo:** link público que comparte, vista previa, opción de seleccionar qué categorías destacar, opción de añadir mensaje propio o foto al inicio. Los productos son automáticamente los que tiene la plataforma. El vendedor no curaduría stock, solo lo distribuye.

**Sección Mis ventas:** lista de pedidos hechos por clientes que entraron por su link, con estado y comisión generada por cada uno.

**Sección Objetivos:** progreso visual hacia el próximo escalón de comisión.

**Sección Cobros:** comisiones disponibles para retirar, pendientes, historial de retiros. Botón "Solicitar pago".

**Sección Mis clientes:** lista de personas que compraron por su catálogo, con opción de contactarlas vía email interno.

**Sección Materiales:** textos sugeridos para promocionar campañas, banners para redes sociales, tips de venta.

**Atribución de venta:** cuando el cliente entra por el link único, el sistema graba una cookie de atribución que dura 30 días desde la última actividad. Si el cliente compra dentro de ese plazo, la venta se atribuye al vendedor. Si el cliente se registra por el link, ese vendedor queda como "su vendedor de referencia" permanentemente, hasta que el cliente elija otro.

**Pago de comisión:** se calcula sobre el valor del producto vendido, sin contar envío, impuestos o costos administrativos. Se "consolida" (pasa a estar disponible para retirar) cuando se confirma la entrega del producto al cliente. Los retiros tienen un mínimo de USD 20. El método de pago lo define el vendedor: transferencia, Mercado Pago, Abitab.

## 3.7 Flujo: publicación en marketplace por un revendedor

Un usuario con rol revendedor entra a su panel y ve "Publicar en marketplace". Elige el producto que quiere publicar de una lista de productos que efectivamente recibió en campañas anteriores (el sistema sabe qué tiene, no se puede publicar lo que no se compró). Define: cantidad a poner a la venta, precio de venta, descripción adicional opcional, fotos adicionales.

El sistema le muestra antes de publicar: "Este producto se vende actualmente en tiendas a USD X. Tu costo fue USD Y. Estás publicando a USD Z. Tu margen bruto sería USD W, menos nuestra comisión del N%, te quedarían USD V".

La publicación queda activa. Cuando alguien compra, el revendedor recibe notificación inmediata con los datos del envío. Tiene 3 días hábiles para despachar. El sistema le ofrece imprimir una etiqueta de envío si quiere usar la empresa de logística integrada. Cuando despacha, marca como "enviado" y carga el código de seguimiento. Cuando el comprador recibe, la plata se libera (menos comisión) automáticamente o tras 3 días sin reclamo.

Si el revendedor no despacha en plazo, recordatorio. Si pasan 7 días hábiles sin despachar, se cancela la venta y se devuelve el dinero al comprador.

## 3.8 Flujo: gestión administrativa diaria

Cada mañana el admin entra al panel y ve un dashboard con: campañas activas y su estado, pedidos del día, tickets de soporte pendientes, alertas (reclamos abiertos, vendedores que no cumplen, productos con stock bajo, pagos pendientes de conciliar), métricas resumen del día anterior.

Acciones más frecuentes: revisar avance de campañas activas (varias veces al día), actualizar estado de campañas en curso, responder consultas de soporte, marcar productos del local como vendidos o repuestos, conciliar pagos que entraron por Abitab/transferencia.

## 3.9 Flujo: lista de deseos y notificaciones

El usuario puede agregar productos a su lista de deseos desde cualquier producto. Sirve para:

- Si el producto es de campaña próxima, recibe notificación cuando se abre la campaña.
- Si el producto es disponible y está sin stock, recibe notificación cuando vuelve.
- Si el producto es de marketplace, puede recibir notificación si baja de cierto precio.

La lista de deseos también sirve como señal para el admin: si muchos usuarios tienen el mismo producto en deseos pero no está en campaña activa, es señal de abrir una.

## 3.10 Flujo: propuesta de productos por la comunidad (Fase 2)

Cualquier usuario registrado puede proponer un producto que le gustaría que se importe. Sube: nombre, descripción, link de referencia, cantidad que personalmente compraría, precio máximo que estaría dispuesto a pagar. La propuesta queda pública. Otros usuarios pueden sumarse marcando interés.

Cuando una propuesta junta suficiente interés (umbral configurable, por ejemplo 30 personas comprometidas con cantidades sumando 100+ unidades), entra a la cola de revisión del admin. El admin evalúa factibilidad, y si es viable, la convierte en campaña oficial.

## 3.11 Flujo: transmisión en vivo (Fase 3)

Planificado pero no en MVP. La plataforma soporta lives integrados donde un influencer o el equipo muestran productos en tiempo real. Durante el live se pueden mostrar productos destacados con botón "reservar ahora" o "comprar ahora" directamente en la transmisión. La compra se completa sin salir del live. Hay chat de espectadores con moderación.

## 3.12 Flujos de excepción y soporte

**Reclamo de un usuario:** desde cualquier pedido entregado, el usuario puede abrir un reclamo en 7 días. Adjunta foto, describe el problema, elige tipo. El reclamo entra a la cola del admin. Se gestiona desde el panel: comunicación por chat interno, resolución (reembolso total, parcial, reposición, rechazo). El usuario puede apelar una vez.

**Devolución de seña por cancelación voluntaria:** si el usuario cancela dentro de plazo (72h antes del cierre), la seña se devuelve automáticamente. Si está fuera de plazo, no se devuelve.

**Cambio de método de pago de saldo:** un usuario que pagó seña con tarjeta puede pagar el saldo con otro método.

**Pedido fragmentado:** si un usuario reservó 10 unidades pero el proveedor solo pudo enviar 8, el sistema le notifica, le reembolsa la diferencia, y le da opción de mantener el pedido reducido o cancelarlo completo.

**Llegada parcial al país:** si parte del contenedor llegó y parte está demorado, el admin puede marcar la campaña como "entrega parcial" y gestionar entregas escalonadas.

**Usuario inactivo:** cuentas sin actividad por más de X meses se marcan como inactivas. No se borran, pero se ocultan de listados públicos.

## 3.13 Comunicaciones automáticas

Cada flujo dispara comunicaciones automáticas:

- Al registrarse: email de bienvenida con explicación y código de verificación.
- Al reservar en campaña: email + notificación con resumen y plazos.
- Cuando una campaña cambia de estado: notificación correspondiente.
- Cuando se cierra el saldo a pagar: email + notificación + recordatorio cada 24h hasta pago o expiración.
- Cuando llega un producto: notificación pidiendo definir modalidad de entrega.
- Cuando se confirma entrega: notificación con invitación a reseña y oferta de publicar en marketplace.
- Cuando el saldo de comisión supera el mínimo: notificación.
- Cuando hay un reclamo: notificación + actualización por cada respuesta.

Canal por defecto: email + notificación in-app. WhatsApp en Fase 2 para mensajes críticos.

---

# Bloque 4 — Modelo de datos

## 4.1 Filosofía del modelo de datos

El modelo de datos tiene que soportar simultáneamente cuatro lógicas distintas sin duplicar información ni crear caos. La clave es identificar conceptos comunes (un producto es un producto, un usuario es un usuario) y separar bien lo específico de cada flujo.

Base de datos: PostgreSQL vía Supabase. Relaciones bien definidas, búsquedas rápidas, triggers para automatizar acciones.

## 4.2 Tablas del área de usuarios

**users**: tabla central de cuentas. Campos: id, email, nombre, apellido, teléfono, fecha de nacimiento, foto de perfil, fecha de creación, fecha de última actividad, estado (activa, suspendida, eliminada). La autenticación la maneja Supabase Auth.

**user_addresses**: direcciones del usuario. Un usuario puede tener varias. Campos: id, usuario asociado, nombre (ej. "Casa"), dirección completa, ciudad, departamento, código postal, es principal sí/no, instrucciones.

**user_roles**: relación entre usuarios y roles. Campos: id, usuario, rol, fecha de asignación, asignado por, activo sí/no.

**user_verifications**: documentos de verificación. Campos: usuario, tipo (cédula, RUT, comprobante de domicilio), archivo (URL al storage), fecha de carga, estado (pendiente, aprobado, rechazado), revisor, motivo de rechazo.

**seller_profiles**: información extendida para usuarios con rol vendedor o revendedor. Campos: usuario, nombre comercial visible, slug único para URL, bio, foto pública, calificación promedio, total de ventas, fecha de alta, método de cobro preferido, datos para ese cobro.

## 4.3 Tablas del área de productos

**categories**: árbol de categorías. Campos: id, nombre, slug, categoría padre (puede ser nulo), ícono, orden, activa sí/no.

**products**: catálogo maestro. Campos: id, nombre, slug, descripción larga, descripción corta, categoría, marca, foto principal, fotos adicionales, características técnicas (JSON), peso, dimensiones, ID del proveedor en origen, estado, fecha de creación.

**product_variants**: variantes de un producto cuando aplica. Campos: producto base, nombre de la variante, atributos específicos (JSON), foto específica, SKU.

## 4.4 Tablas del área de campañas de importación

**campaigns**: cada fila es una campaña. Campos: id, producto asociado, título, descripción específica, foto destacada, MOQ, cantidad máxima opcional, porcentaje de seña, fecha de apertura, fecha de cierre programada, fecha de cierre real, estado (borrador, activa, cerrada_exitosa, cerrada_fallida, en_proceso, entregada, finalizada, cancelada), fecha estimada de llegada, política de devolución específica, creada por, notas internas.

**campaign_pricing_tiers**: los escalones de precio. Campos: campaña, escalón número, cantidad mínima del escalón, cantidad máxima del escalón, precio por unidad en USD, precio por unidad en pesos al cierre.

**campaign_reservations**: reservas. Campos: id, campaña, usuario, cantidad reservada, precio mostrado al reservar (referencia), seña pagada, método de pago de seña, fecha de reserva, estado (activa, cancelada, confirmada, pagada_total, entregada), fecha de cancelación, motivo, atribución a vendedor por catálogo, atribución a usuario que compartió.

**campaign_payments**: pagos asociados a reservas. Campos: reserva asociada, tipo (seña, saldo, ajuste), monto, moneda, método, fecha, estado, ID externo de pasarela, comprobante.

**campaign_status_updates**: actualizaciones de estado durante la importación. Campos: campaña, fecha, tipo, descripción, foto opcional, visible al usuario sí/no, cargada por.

## 4.5 Tablas del área de stock disponible

**inventory_items**: ítems de stock físico disponible. Campos: id, producto, variante si aplica, cantidad disponible, cantidad reservada, ubicación física, precio de venta unitario, costo unitario, fecha de ingreso, campaña de origen si vino de una campaña, notas.

Los productos del local físico también van acá. Cuando se vende algo en el local, se descuenta de esta misma tabla, así no hay desincronización entre web y local.

## 4.6 Tablas del área de marketplace

**marketplace_listings**: publicaciones de revendedores. Campos: id, vendedor, producto, variante, cantidad disponible, cantidad total publicada originalmente, precio, fotos propias del vendedor, descripción adicional, estado (activa, pausada, agotada, eliminada), fecha de publicación, calificación.

**marketplace_orders**: órdenes del marketplace. Campos: id, publicación, comprador, vendedor (replicado para acceso rápido), cantidad, precio unitario al momento, total, comisión de la plataforma, monto al vendedor, estado, fecha de pago, fecha de despacho, fecha de entrega, código de seguimiento, dirección de envío, método de envío.

**marketplace_messages**: chat interno comprador-vendedor. Campos: id, conversación asociada, remitente, destinatario, mensaje, archivos adjuntos, fecha, leído sí/no.

## 4.7 Tablas del área de órdenes y pagos generales

**orders**: orden representa cualquier transacción. Es la entidad unificadora. Una orden puede contener reservas de campañas, compras de stock, compras del marketplace, o mezcla. Campos: id, usuario, fecha, total, moneda, estado general, dirección de envío seleccionada, método de envío, atribución a vendedor por catálogo, atribución a quien compartió, notas del cliente.

**order_items**: ítems individuales de una orden. Campos: orden, tipo (campaña, stock, marketplace), referencia al ítem, cantidad, precio unitario, subtotal.

**payments**: pagos asociados a órdenes. Campos: orden, monto, moneda, método, estado, fecha, ID externo de pasarela, comprobante.

**user_credits**: saldo a favor del usuario. Campos: usuario, monto disponible, monto reservado en transacciones pendientes.

**credit_movements**: cada movimiento del saldo. Campos: usuario, fecha, monto, tipo (ajuste_precio_campaña, devolución_seña_campaña_fallida, bonus_campaña_fallida, reembolso, uso_en_compra, regalo, ajuste_manual), referencia al evento.

## 4.8 Tablas del área de vendedores por catálogo

**catalog_links**: links de atribución que cada vendedor comparte. Campos: vendedor, slug del link, nombre interno, creado, activo.

**catalog_attributions**: cuando un visitante entra por un link, se guarda esto. Campos: link, identificador del visitante (cookie/sesión o usuario si logueado), fecha de primera visita, fecha de última actividad, fecha de expiración.

**catalog_sales**: registro de ventas atribuidas. Campos: vendedor, orden asociada, monto atribuible, porcentaje de comisión aplicado, monto de comisión calculado, estado (pendiente, consolidada, pagada), fecha de consolidación, fecha de pago.

**commission_tiers**: configuración de escalones de comisión. Campos: nivel, monto mínimo mensual, porcentaje base, productos o categorías excluidas.

**commission_payouts**: pagos efectivos hechos al vendedor. Campos: vendedor, período (mes), monto total, método, fecha de solicitud, fecha de pago, comprobante.

## 4.9 Tablas del área de reseñas y reputación

**reviews**: reseñas de productos. Campos: id, producto reseñado, usuario, orden asociada, puntaje (1-5), título, comentario, fotos, fecha, estado, respuestas del admin.

**marketplace_listing_reviews**: reseñas específicas del marketplace. Campos: publicación o orden, usuario, puntaje, comentario, fecha.

**seller_ratings**: agregado de calificación de vendedores. Campos: vendedor, puntaje promedio, total de reseñas, distribución, última actualización.

## 4.10 Tablas del área de listas de deseos y propuestas

**wishlists**: items en lista de deseos. Campos: usuario, producto, fecha de adición, notificar si baja precio sí/no, notificar si vuelve a stock sí/no.

**product_proposals**: propuestas hechas por la comunidad (Fase 2). Campos: id, propuesto por, título, descripción, link de referencia, foto, categoría sugerida, cantidad que el proponente compraría, precio máximo, fecha, estado.

**product_proposal_interests**: usuarios que se sumaron a una propuesta. Campos: propuesta, usuario, cantidad que compraría, precio máximo, fecha.

## 4.11 Tablas del área de soporte y reclamos

**support_tickets**: tickets de atención. Campos: id, usuario, asunto, categoría, descripción inicial, estado, prioridad, asignado a admin, fecha de apertura, fecha de cierre, calificación.

**support_ticket_messages**: mensajes dentro de un ticket. Campos: ticket, remitente, mensaje, archivos adjuntos, fecha, visible al cliente sí/no.

**claims**: reclamos formales sobre productos entregados. Campos: usuario, orden, item específico, tipo, descripción, fotos, fecha, estado, resolución aplicada, monto del reembolso, fecha de resolución.

## 4.12 Tablas del área de comunicaciones

**notifications**: notificaciones generadas para usuarios. Campos: id, usuario, tipo, título, cuerpo, datos contextuales (JSON), leída sí/no, fecha, canal (in_app, email, sms, whatsapp).

**notification_preferences**: preferencias por usuario. Campos: usuario, tipo de notificación, canales activos.

**email_campaigns**: campañas de email marketing. Campos: nombre, segmento, asunto, cuerpo, fecha programada, fecha de envío, métricas.

## 4.13 Tablas del área de configuración y administración

**settings**: parámetros configurables del sistema. Campos: clave, valor, descripción, tipo de dato. Acá viven: porcentaje de comisión default, plazo de cancelación de seña, umbral para auto-revendedor, tipo de cambio actual.

**admin_actions_log**: registro de acciones sensibles hechas por admins. Campos: admin, acción, entidad afectada, datos antes, datos después, fecha, IP.

**system_logs**: logs técnicos generales.

## 4.14 Vistas y agregaciones

**campaign_progress_view**: estado actual de cada campaña con cantidad reservada, escalón actual, escalón siguiente, faltante para próximo escalón, % al MOQ, tiempo restante.

**user_stats_view**: para cada usuario, cantidad de compras, monto total gastado, productos comprados, puede ser revendedor sí/no.

**seller_dashboard_view**: para cada vendedor por catálogo, ventas del mes, comisión acumulada, progreso a próximo nivel, top productos.

## 4.15 Diagrama de relaciones principales

```
users
├── user_roles (uno a muchos)
├── user_addresses (uno a muchos)
├── seller_profiles (uno a uno opcional)
├── orders (uno a muchos)
├── campaign_reservations (uno a muchos)
├── reviews (uno a muchos)
├── wishlists (uno a muchos)
├── notifications (uno a muchos)
├── claims (uno a muchos)
└── user_credits (uno a uno)

products
├── campaigns (uno a muchos)
├── inventory_items (uno a muchos)
├── marketplace_listings (uno a muchos)
├── reviews (uno a muchos)
└── categories (muchos a uno)

campaigns
├── campaign_pricing_tiers (uno a muchos)
├── campaign_reservations (uno a muchos)
└── campaign_status_updates (uno a muchos)

campaign_reservations
└── campaign_payments (uno a muchos)

orders
├── order_items (uno a muchos)
└── payments (uno a muchos)

seller_profiles
├── marketplace_listings (uno a muchos)
├── catalog_links (uno a muchos)
└── catalog_sales (uno a muchos)

marketplace_listings
└── marketplace_orders (uno a muchos)
```

---

# Bloque 5 — Arquitectura técnica

## 5.1 Stack tecnológico definitivo

**Framework principal:** Next.js 15 con App Router y TypeScript. React Server Components, Server Actions. TypeScript estricto no negociable.

**Base de datos y backend:** Supabase. PostgreSQL administrado, autenticación incorporada (email, Google, etc.), storage de archivos, realtime, APIs autogeneradas.

**Estilos:** Tailwind CSS para utility classes, shadcn/ui como librería de componentes (copiada al proyecto).

**Pagos:** Mercado Pago Uruguay. Maneja tarjetas, transferencias, Abitab/Redpagos con una sola integración.

**Comunicaciones:** Resend para emails transaccionales, Twilio para SMS y WhatsApp Business API cuando se sume.

**Hosting:** Vercel para frontend y API routes. Despliegue automático desde GitHub, CDN global.

**Almacenamiento de imágenes:** Supabase Storage para empezar. Migrar a Cloudflare R2 si crece mucho.

**Búsqueda:** PostgreSQL full text search nativo. Algolia o Meilisearch si crece complejidad.

**Analítica:** Vercel Analytics + Plausible o Posthog.

**Monitoreo:** Sentry para errores en producción.

**Repositorio:** GitHub privado.

## 5.2 Estructura de carpetas

```
mercado-nuestro/
├── app/                          # Rutas Next.js App Router
│   ├── (public)/
│   ├── (auth)/
│   ├── (user)/
│   ├── (revendedor)/
│   ├── admin/
│   └── api/
├── components/
│   ├── ui/                       # shadcn
│   ├── campanas/
│   ├── productos/
│   ├── marketplace/
│   ├── usuario/
│   └── admin/
├── lib/
│   ├── supabase/
│   ├── mercadopago/
│   ├── email/
│   ├── notifications/
│   ├── validations/              # Zod schemas
│   ├── utils/
│   └── constants/
├── hooks/
├── types/
├── public/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
├── CLAUDE.md
├── README.md
├── package.json
└── tsconfig.json
```

## 5.3 Integraciones externas necesarias

- **Mercado Pago Uruguay:** cuenta de negocio con credenciales de producción y prueba. Webhooks para confirmar pagos.
- **Supabase:** proyecto creado, esquema cargado, políticas RLS configuradas.
- **Resend:** cuenta con dominio verificado (mercadonuestro.uy). Tier gratuito incluye 3000 emails/mes.
- **Twilio (Fase 2):** cuenta con número aprobado para WhatsApp Business API. Tiene proceso que puede tardar semanas, conviene iniciar temprano.
- **Google Cloud Console:** para configurar OAuth de Google.
- **Cloudflare (opcional):** DNS, CDN extra, protección DDoS.
- **Sentry:** cuenta gratuita.
- **Vercel:** cuenta conectada a GitHub.

## 5.4 Seguridad

**Autenticación:** delegada a Supabase Auth. Maneja hashing, JWT, refresh tokens.

**Autorización:** Row Level Security (RLS) de PostgreSQL. Reglas se aplican a nivel de base de datos. Aún si hay un bug en la aplicación, la base rechaza la consulta.

**Validación de inputs:** Zod para todos los datos. Nada se procesa sin validar.

**Protección contra ataques comunes:** Next.js maneja la mayoría por defecto. Cuidado con renderizar HTML de usuarios.

**Manejo de secretos:** todas las claves de API en variables de entorno. Vercel y Supabase tienen gestión integrada.

**HTTPS obligatorio:** Vercel lo provee por defecto.

**Datos sensibles:** cédula y documentos en Supabase Storage con políticas restrictivas. Datos bancarios cifrados.

**Rate limiting:** límite de requests por IP para evitar fuerza bruta o scraping.

## 5.5 Performance

**Server components por defecto.** Next.js 15 los usa por defecto.

**Caché de Supabase:** queries comunes cacheadas a nivel de servidor con revalidación inteligente.

**Imágenes optimizadas:** next/image automáticamente sirve WebP, AVIF con tamaños responsive.

**Lazy loading:** componentes pesados se cargan solo cuando se necesitan.

**Pagination y virtual scrolling:** listados largos.

**CDN global:** Vercel sirve archivos estáticos desde la región más cercana.

## 5.6 Deployment y CI/CD

**Branches:** main = producción, develop = staging, feature branches para cambios.

**Despliegue automático:** push a main despliega producción, push a develop despliega staging.

**Preview deployments:** cada PR genera un deployment temporal.

**Migraciones de base de datos:** se ejecutan manualmente al principio para tener control.

**Variables de entorno:** distintas por ambiente. Vercel y Supabase lo gestionan.

**Backups:** Supabase hace backups automáticos diarios. Descargar dump manual semanal como respaldo extra.

## 5.7 Escalabilidad esperada

Para los primeros 12 meses, el stack soporta:

- Hasta 50.000 usuarios registrados
- Hasta 5.000 usuarios activos por día
- Hasta 500 transacciones por día
- Hasta 100 GB de imágenes y datos

Cuando se acerquen esos límites: upgrade de Supabase, upgrade de Vercel, migración de imágenes a Cloudflare R2, agregar Redis para caché.

---

# Bloque 6 — Pantallas y navegación

## 6.1 Filosofía de UX

Mercado Nuestro tiene que sentirse simple a pesar de su complejidad. Un usuario nuevo debe poder hacer su primera reserva en menos de 5 minutos sin ayuda. Tres niveles máximo de navegación.

## 6.2 Mapa completo de pantallas

### Pantallas públicas

**Home:** hero con propuesta de valor en una frase. Carrusel de campañas destacadas con barra de progreso, tiempo restante y precio actual. Sección de productos disponibles para entrega inmediata. "Cómo funciona" en 3 pasos. Testimonios. Footer con info de empresa.

**Campañas activas:** listado completo. Filtros por categoría, precio, tiempo restante, porcentaje completado. Cada campaña como tarjeta con foto, nombre, escalón actual, próximo escalón, barra de progreso, faltantes para próximo escalón, tiempo restante, botón "Reservar".

**Detalle de campaña:** la pantalla más importante. Foto principal grande con galería. Nombre. Descripción. Características técnicas. Barra de progreso de escalones de precio (con checkmarks de los desbloqueados). Cantidad reservada/MOQ. Tiempo restante con countdown. Selector de cantidad. Cálculo dinámico de seña y saldo. Botón "Reservar". Botón "Compartir" (WhatsApp, Instagram, link). Avatares de últimos participantes (prueba social). Reseñas. FAQ específicas. Política de devolución.

**Marketplace:** listado de productos publicados por revendedores. Filtros. Cada producto como tarjeta con foto, precio, nombre del vendedor, su rating.

**Detalle de producto del marketplace:** similar a producto pero con énfasis en el vendedor (perfil, reputación, otras publicaciones), opción de contactar por chat, precio, stock, opciones de envío, botón "Comprar".

**Disponible (stock inmediato):** listado con etiqueta "Disponible ya" y plazo de entrega corto.

**Detalle de producto disponible:** eCommerce clásico. Galería, descripción, precio, stock, envío, "Comprar ahora" y "Agregar al carrito".

**Catálogo de vendedor:** URL `/vendedor/maria-perez`. Foto del vendedor, bio, productos destacados, todas las campañas y productos activos. Reservas y compras se atribuyen automáticamente.

**Cómo funciona:** explicación detallada del modelo.

**Programa de vendedores:** explicación de cómo ganar dinero. Comisiones, ejemplos, testimonios.

**Páginas legales:** términos, privacidad, devoluciones, envíos.

**Páginas informativas:** quiénes somos, contacto, blog.

### Pantallas de autenticación

**Login, Registro, Verificación de email, Recuperar contraseña, Verificación de teléfono.**

### Pantallas del panel de usuario (comprador)

**Dashboard:** pedidos en curso, próximas entregas, campañas participando, notificaciones recientes.

**Mis pedidos:** listado con filtros por estado.

**Detalle de pedido:** información completa, productos, montos, pagos, saldo pendiente, dirección, estado con timeline, opciones de cancelar/reclamar.

**Mis reservas en campañas:** vista específica.

**Lista de deseos:** productos guardados, alertas configurables.

**Mis reclamos.**

**Direcciones, Métodos de pago, Notificaciones, Perfil, Crédito en cuenta.**

### Pantallas del panel de vendedor por catálogo

**Dashboard, Mi catálogo, Mis ventas, Mis clientes, Mis comisiones, Objetivos, Materiales.**

### Pantallas del panel de revendedor

**Dashboard, Mis publicaciones, Crear publicación, Pedidos a despachar, Mi stock, Mensajes.**

### Pantallas del panel administrativo

**Dashboard admin, Gestión de campañas, Crear/editar campaña, Gestión de productos, Gestión de inventario, Gestión de usuarios, Aprobación de roles, Gestión de pedidos, Gestión de reclamos, Gestión de comisiones, Reportes financieros, Configuración general, Configuración de contenido, Logs y auditoría.**

## 6.3 Navegación principal

**Header:** logo, búsqueda al centro, ícono de carrito con contador, ícono de notificaciones con badge, ícono de usuario.

**Menú principal:** Inicio, Campañas, Marketplace, Disponible, Cómo funciona, Ser vendedor.

**Mobile:** menú hamburguesa, búsqueda accesible, carrito y usuario siempre visibles.

**Footer:** info de empresa, enlaces legales, redes sociales, métodos de pago, sello del local físico.

**Sidebar de usuario logueado:** acceso rápido a dashboard, pedidos, reservas, deseos, vendedor (si aplica), revendedor (si aplica), reclamos, perfil, salir.

**Sidebar de admin:** todas las secciones administrativas.

## 6.4 Estados de la interfaz

Cada pantalla tiene que manejar:

- **Loading:** skeletons o spinners.
- **Empty:** mensajes amables con call to action.
- **Error:** mensaje claro y opción de reintentar.
- **Sin permisos:** explicación y cómo obtenerlos.
- **Offline:** detección de conexión perdida.

## 6.5 Diseño responsive

Mobile first obligatorio. Especialmente importante:

- Catálogo de campañas legible en pantalla chica.
- Botón "Compartir" muy accesible.
- Checkout optimizado con teclado numérico.
- Panel de vendedor por catálogo pensado primero en mobile.

---

# Bloque 7 — Reglas de negocio críticas

## 7.1 Por qué este bloque existe

Estas son reglas que se ejecutan automáticamente en el sistema. No son decisiones que se toman cada vez, son políticas programadas. Si cambian, hay que cambiar el código.

## 7.2 Reglas sobre campañas

**Apertura:** solo el admin crea campañas. Una vez publicada con reservas, no se pueden modificar: MOQ, escalones de precio, porcentaje de seña, fecha de cierre. Se pueden editar: descripciones, fotos adicionales, FAQ.

**Cantidad por usuario:** sin límite por defecto, configurable por campaña.

**Cancelación voluntaria:** permitida hasta **72 horas antes del cierre**. En plazo: seña devuelta en 7 días hábiles. Fuera de plazo: seña no se devuelve si la campaña sigue activa.

**Cancelación si la campaña se cancela:** señas devueltas automáticamente. Opción de dejar como crédito con bonus 5%.

**Extensión de plazo:** admin puede extender UNA SOLA VEZ si la campaña está al 85% del MOQ y restan menos de 7 días. Máximo 7 días de extensión. Notificar a todos.

**Cierre antes del plazo:** posible si se alcanza el escalón máximo de precio y cupo máximo (si fue definido).

**Cierre exitoso:** se alcanzó al menos el MOQ. Precio final = escalón correspondiente al volumen total reservado.

**Cierre fallido:** no se alcanzó el MOQ. Devolución de señas.

**Pago del saldo:** 5 días hábiles tras cierre exitoso. Recordatorios automáticos. Si no paga: pierde seña y lugar.

**Ajuste por mejor precio:** si el precio final es menor al que vio al reservar, la diferencia se descuenta del saldo o se acredita como crédito.

## 7.3 Reglas sobre precios y monedas

**Moneda base:** USD para cálculos internos.

**Visualización:** usuario elige USD o UYU.

**Tipo de cambio:** admin lo carga manualmente con periodicidad (idealmente diaria).

**Pago:** en pesos o dólares según método. MP cobra en pesos. Transferencias en cualquier moneda. Abitab/Redpagos solo en pesos. El sistema registra el monto cobrado en moneda original y la conversión aplicada.

**Comisiones:** se calculan en USD y se convierten a UYU al pago.

## 7.4 Reglas sobre el marketplace

**Quién publica:** solo revendedores activos (con stock real recibido).

**Qué se publica:** solo productos que el usuario efectivamente recibió.

**Precio mínimo:** el sistema sugiere rango pero no obliga. Puede haber precio mínimo absoluto configurable por categoría.

**Pago al revendedor:** modelo escrow. Comprador paga a Mercado Nuestro. Se libera al revendedor cuando: comprador confirma entrega O pasan 3 días sin reclamo.

**Plazo de despacho:** 3 días hábiles. Sin despacho en 7 días: cancela la venta y reembolsa.

**Comisión:** entre 7% y 10% según categoría.

**Reseñas mutuas:** comprador y vendedor pueden reseñarse en 30 días post-venta.

## 7.5 Reglas sobre vendedores por catálogo

**Comisión base:** entre 8% y 15% según categoría.

**Escalones por volumen mensual (preliminar):**
- Hasta USD 500: comisión base
- USD 501-1500: +2% sobre todo lo del mes
- USD 1501-3000: +3%
- Más de USD 3000: +5%

**Atribución:** cookie de 30 días desde última visita por link. Si se registra por el link, vendedor queda como referencia permanente hasta que el cliente lo cambie.

**Pago:** comisiones se "consolidan" al confirmar entrega. Retiro mínimo USD 20. Pagos los primeros 5 días hábiles de cada mes.

**Penalizaciones:** cancelaciones o reclamos descuentan comisión. Si deja saldo negativo, se compensa con ventas futuras.

**Recambio de referencia:** el cliente puede cambiar su vendedor desde su perfil.

## 7.6 Reglas sobre devoluciones y reclamos

**Plazo para reclamar:** 7 días corridos desde la entrega confirmada.

**Tipos válidos:** defectuoso, no llegó, llegó equivocado, faltante, no corresponde a descripción.

**Evidencia:** foto del producto, foto del embalaje, descripción.

**Resoluciones:** reembolso total, parcial, reposición, reemplazo equivalente, rechazo con motivo.

**Plazo de resolución:** 5 días hábiles. Si no responde, escala a prioridad alta.

**Apelación:** una vez, va a otro admin si hay.

**Reembolsos:** al método original en 10 días hábiles. Si no es posible: crédito en cuenta o transferencia.

**Excepciones:** electrónica puede tener garantía extendida. Productos perecederos o íntimos no admiten devolución salvo defecto evidente.

## 7.7 Reglas sobre envíos

**Modalidades:** retiro gratuito en local de Paysandú, envío con empresa de logística partner, retiro en puntos de la empresa.

**Cobro:** envío lo paga el usuario al confirmar modalidad. La empresa lo cobra directo al cliente. Excepción: promociones específicas.

**Tiempos:** 1-3 días Paysandú, 3-7 días resto del país.

**Costo estimado vs real:** la web muestra estimado, la empresa confirma real. Si hay diferencia significativa, se notifica antes de despachar.

**Seguro:** la empresa asume responsabilidad hasta cierto monto. Productos de alto valor: seguro adicional opcional.

## 7.8 Reglas sobre pagos

**Métodos:** tarjetas vía MP, transferencia bancaria, MP directo, Abitab, Redpagos, crédito en cuenta.

**Verificación de transferencias:** manualmente o automáticamente vía integración bancaria si está disponible. Pago en estado `pendiente` hasta verificar.

**Fraudes:** si MP detecta fraude, reserva se anula automáticamente.

**Reembolsos:** al método original cuando posible. Si no: crédito o transferencia.

## 7.9 Reglas sobre verificación de usuarios

**Comprador:** email + teléfono antes del primer pago.

**Vendedor por catálogo y revendedor:** además, cédula cargada y aprobada antes del primer cobro o despacho.

**Importador avanzado:** verificación completa con RUT, antecedentes, acuerdo (Fase 3).

**Sospecha de fraude:** admin puede congelar cuenta y solicitar verificación adicional.

## 7.10 Reglas sobre datos y privacidad

**Datos visibles a otros usuarios:** nombre comercial del vendedor, foto pública, reputación, productos publicados, fecha de alta.

**Datos privados:** dirección, teléfono, cédula, datos bancarios, historial de compras.

**Cookies:** se informan al primer ingreso con opción de aceptar.

**Eliminación de cuenta:** anonimización de datos personales, conservación de transacciones por obligación contable.

---

# Bloque 8 — Marco legal y operativo

## 8.1 Advertencia importante

Este bloque define un esqueleto razonable, pero **hay que validar todo con un contador o abogado uruguayo antes de operar**. La legislación uruguaya tiene particularidades que requieren asesoramiento profesional local.

## 8.2 Estructura legal recomendada

**Tipo de empresa:** Sociedad por Acciones Simplificada (SAS) es la forma más ágil. Pocos requisitos, responsabilidad limitada, flexible.

**Inscripción:** ante DGI para el RUT, ante BPS para aportes, ante Ministerio de Trabajo si hay empleados.

**Habilitación municipal:** del local físico de Paysandú según normas locales.

**Habilitación específica:** importadora ante Dirección Nacional de Aduanas. Trabajar con un despachante de aduana habilitado al menos al inicio.

## 8.3 Aspectos tributarios

**IVA:** Uruguay tiene IVA del 22% básico y 10% mínimo para algunos productos. Las importaciones pagan IVA al ingresar. La venta posterior también lo factura. Conviene asesorarse con contador.

**Impuestos a la renta:** las ganancias de la SAS pagan IRAE. Hay regímenes simplificados para empresas chicas.

**Impuestos a las importaciones:** tasa global arancelaria, recargos específicos, tasa consular. Varían mucho por producto. Para electrónica y ropa son altos. El contador puede calcular el costo total por categoría.

**Comisiones a vendedores:** son ingresos para ellos. Si superan ciertos montos deben tributar. Revisar con contador para no traspasar a "relación de dependencia".

## 8.4 Aspectos aduaneros

**Modalidad:** importación comercial formal con RUT. El régimen de courier (puerta a puerta) tiene límites (3 envíos/año, USD 200) y no sirve para volumen.

**Despachante de aduana:** profesional habilitado obligatorio. Cobra honorarios por despacho (USD 100-300 según volumen).

**Documentación:** factura comercial, packing list, bill of lading o air waybill, certificado de origen.

**Restricciones específicas:** algunos productos requieren autorización adicional (cosméticos, alimentos, electrónica con radiofrecuencia, juguetes). Conocer restricciones por categoría antes de comprometer campaña.

**Tiempos:** 30-50 días marítimo, 7-15 días aéreo desde China. Más despacho aduanero (3-10 días).

## 8.5 Documentación legal de la plataforma

**Términos y condiciones generales:** roles, obligaciones, política de pagos, devoluciones, limitación de responsabilidad, jurisdicción.

**Política de privacidad:** recolección, uso y protección de datos personales. Ley 18.331 de Uruguay.

**Política de cookies:** descripción de cookies usadas.

**Condiciones para vendedores por catálogo:** acuerdo separado. Importante: NO es relación de dependencia laboral sino colaboración comercial.

**Condiciones para revendedores:** acuerdo que establece que la plataforma es intermediaria, responsabilidad del producto del revendedor.

**Condiciones para importadores avanzados:** acuerdo más detallado (Fase 3).

**Política de protección al consumidor:** Ley 17.250 de Defensa del Consumidor. Información clara, derecho de arrepentimiento de 5 días en compras a distancia, garantías legales mínimas.

**Factura electrónica:** Comprobante Fiscal Electrónico (CFE) es obligatorio. Servicios que se integran: Pyme Factura, Memory, Tu Factura.

## 8.6 Propiedad intelectual

**Marca:** registrar "Mercado Nuestro" en DNPI en clases 35 y 39. Costo USD 200-400 por clase, vigencia 10 años renovables.

**Dominio:** mercadonuestro.uy. Registrar también variantes para protección.

**Software:** código propio. Librerías open source respetar licencias (mayoría son permisivas: MIT, Apache).

## 8.7 Aspectos laborales

Si se contratan personas:

**Modalidades:** empleados en dependencia, monotributistas, facturación por sociedad.

**Empleados clave eventualmente:** encargado de operaciones, atención al cliente, encargado de local, marketing.

## 8.8 Seguros

**Responsabilidad civil:** reclamos por daños de productos. Importante para electrónica.

**Carga:** mercadería en tránsito desde China y desde aduana al depósito.

**Local:** robo, incendio, daños.

**Transporte local:** si la empresa de logística no lo incluye.

## 8.9 Atención al cliente y obligaciones de información

Por Ley 17.250 brindar información clara y accesible sobre: empresa (datos completos, RUT, dirección), producto (características, garantía, plazos), proceso de compra (pasos, costos totales, devolución), atención (canales y plazos).

Canal de atención claro (mail, WhatsApp, teléfono) con horarios publicados es obligación legal.

## 8.10 Lista de verificación pre-lanzamiento legal

- [ ] Empresa constituida y con RUT activo
- [ ] Habilitación de importadora obtenida
- [ ] Despachante de aduana contratado
- [ ] Sistema de facturación electrónica integrado
- [ ] Términos y condiciones por abogado y publicados
- [ ] Política de privacidad publicada
- [ ] Cumplimiento Ley de Datos Personales (URCDP)
- [ ] Cumplimiento Ley del Consumidor
- [ ] Marca registrada o solicitada
- [ ] Dominios registrados
- [ ] Cuenta bancaria empresarial
- [ ] Acuerdo con empresa de logística firmado
- [ ] Acuerdo con Mercado Pago
- [ ] Habilitación del local físico vigente
- [ ] Seguros contratados

---

# Bloque 9 — Plan de lanzamiento

## 9.1 Filosofía del plan

Construir por etapas. Cada etapa con objetivo claro y criterio de éxito antes de pasar a la siguiente. Lanzar MVP funcional lo antes posible, validar con usuarios reales, agregar funciones según crece.

Regla: si una funcionalidad no es indispensable para que el usuario complete su primer flujo de éxito, no va en el MVP.

## 9.2 Fase 0 — Preparación (semanas 1-2)

- Trámites legales iniciales (constitución SAS, RUT, despachante, abogado).
- Identidad visual (logo, colores, tipografía).
- Productos iniciales (3-5 productos definidos, cotizaciones, fotos).
- Cuentas y servicios (Supabase, Vercel, GitHub, MP, Resend, dominio).
- Entorno de desarrollo (Node.js, GitHub, Claude Code, repo creado).
- Documento maestro (este) y CLAUDE.md.

## 9.3 Fase 1 — MVP (semanas 3-10)

**Semana 3 — Cimientos técnicos.** Proyecto Next.js, Tailwind + shadcn, Supabase, primeras tablas, autenticación.

**Semana 4 — Catálogo público.** Home, listado de campañas, detalle de campaña con barra de progreso de escalones, detalle de producto. Diseño responsive básico. Sin compra todavía.

**Semana 5 — Reservas y carrito.** Lógica de reserva con cálculo dinámico de precios. Carrito. Integración MP para señas con tarjeta. Checkout.

**Semana 6 — Panel de usuario.** Dashboard, reservas, pedidos, perfil, deseos. Notificaciones in-app básicas.

**Semana 7 — Stock disponible.** Inventory, sección "Disponible", checkout con mezcla. Métodos adicionales (Abitab/Redpagos).

**Semana 8 — Panel admin básico.** Gestión de campañas, productos, inventario, pedidos, reservas. Funcional aunque no bonito.

**Semana 9 — Comunicaciones automáticas.** Emails transaccionales con Resend. Notificaciones in-app. Recordatorios.

**Semana 10 — Testing y ajustes.** Probar flujos extremo a extremo. Corregir bugs. 2-3 campañas reales en soft launch. 10-20 usuarios de confianza probando.

**Criterio de éxito:** 1 campaña real cerrada con éxito, productos entregados, sin reclamos graves.

## 9.4 Fase 2 — Expansión (semanas 11-22)

**Semanas 11-12 — Vendedores por catálogo.**

**Semanas 13-15 — Marketplace de reventa.**

**Semanas 16-17 — Mejoras de experiencia (reseñas, búsqueda, mobile).**

**Semanas 18-19 — WhatsApp integrado.**

**Semanas 20-21 — Local físico integrado (retiros, POS básico).**

**Semana 22 — Propuestas comunitarias.**

**Criterio de éxito:** 20+ vendedores activos generando ventas, marketplace con 50+ publicaciones, primera campaña desde propuesta comunitaria.

## 9.5 Fase 3 — Escala (semanas 23-40)

- Lives shopping integrados
- Importadores avanzados
- App móvil nativa
- Cotizaciones a pedido
- Programa de referidos
- Sistema de subastas o flash sales

**Criterio de éxito:** plataforma consolidada con miles de usuarios activos.

## 9.6 Hitos importantes

- Mes 1: primer registro, primera reserva
- Mes 3: primera campaña cerrada exitosamente, primer producto entregado
- Mes 6: primera campaña en escalón máximo, primera reseña 5 estrellas, 100 usuarios
- Mes 9: 500 usuarios activos, campaña con 50+ participantes, primera comisión pagada
- Mes 12: 1000-3000 usuarios totales, marketplace con flujo constante, ingresos positivos
- Mes 18: plataforma rentable, equipo creciendo, expansión a nuevos verticales

## 9.7 Riesgos identificados y mitigaciones

**Campañas que no llegan al MOQ:** empezar con MOQs conservadores, primero entre conocidos, escalar gradualmente.

**Problemas con la primera importación:** productos simples (sin restricciones, valor bajo), trabajar de cerca con despachante.

**Fraudes en pagos:** MP tiene antifraude, montos chicos al inicio, verificar usuarios.

**Reclamos por calidad china:** política clara de devoluciones, fotos reales no del catálogo, reseñas honestas, escalonado de productos por confianza.

**No llega suficiente gente:** marketing concreto desde inicio, aprovechamiento del local físico, alianzas con influencers locales.

**Programación más lenta:** este documento ayuda muchísimo a Claude Code. Si igual se complica, contratar programador junior de apoyo.

## 9.8 Estrategia de adquisición de primeros usuarios

- **Lanzamiento desde red personal:** primeros 30 usuarios de familia, amigos, ex-clientes.
- **Local físico como punto de captación:** cartel con QR a la web.
- **Redes sociales locales:** Instagram, TikTok, Facebook. Contenido educativo, casos reales, campañas activas.
- **Influencers locales chicos:** no los grandes. Los de Paysandú, Salto, Mercedes. Acuerdo de comisión.
- **Grupos de WhatsApp y Facebook:** participación genuina, no spam.
- **Alianzas con comercios pequeños:** importarles productos específicos, ellos como revendedores.
- **Prensa local:** notas en diarios y radios de Paysandú y zona.

---

# Bloque 10 — Estructura para Claude Code

## 10.1 Por qué este bloque existe

Cuando Claude Code arranca cada sesión, lee el `CLAUDE.md` en la raíz del proyecto. Pero también necesita poder consultar este documento maestro y otros documentos complementarios cuando profundiza en un tema específico.

## 10.2 Archivo CLAUDE.md en la raíz

Es el contexto vivo del proyecto. Se actualiza constantemente. Incluye:

- Qué es Mercado Nuestro (resumen)
- Estado actual del proyecto (qué está hecho, qué sigue)
- Stack técnico definitivo
- Reglas de negocio resumidas
- Convenciones de código
- Seguridad
- Estructura del repo
- Variables de entorno
- Cosas que NUNCA hacer
- Cómo trabajar con Claude Code

Ver archivo `CLAUDE.md` separado en la raíz del proyecto.

## 10.3 Documentos complementarios

**`/docs/MASTER.md`** — Este documento. Referencia última y completa.

**`/docs/BUSINESS.md`** — Versión resumida de los bloques 1, 3 y 7 para consulta rápida de reglas de negocio.

**`/docs/ARCHITECTURE.md`** — Bloque 5 expandido. Decisiones técnicas y justificación.

**`/docs/DECISIONS.md`** — Registro vivo de decisiones que se van tomando durante el desarrollo. Cada decisión con: fecha, contexto, opciones consideradas, decisión tomada, motivo.

**`/docs/FLOWS.md`** — Bloque 3 expandido con detalle de cada flujo paso a paso.

**`/docs/SCHEMA.md`** — Bloque 4 expandido con campos exactos de cada tabla.

**`/docs/PROMPTS.md`** — Prompts útiles para Claude Code en tareas recurrentes.

## 10.4 Estructura del repositorio inicial

```
mercado-nuestro/
├── .github/
│   └── workflows/
├── docs/
│   ├── MASTER.md
│   ├── BUSINESS.md
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   ├── FLOWS.md
│   ├── SCHEMA.md
│   └── PROMPTS.md
├── public/
├── src/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
├── LICENSE
├── package.json
└── tsconfig.json
```

## 10.5 Variables de entorno necesarias

```bash
# Next.js
NEXT_PUBLIC_APP_URL=

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
RESEND_FROM_EMAIL=

# Twilio (Fase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentry
SENTRY_DSN=

# Configuración
DEFAULT_CURRENCY=USD
ADMIN_EMAIL=
DEFAULT_TIMEZONE=America/Montevideo
```

## 10.6 Prompts iniciales sugeridos

**Inicializar proyecto:**
"Vamos a inicializar el proyecto Mercado Nuestro. Leé el CLAUDE.md y el MASTER.md para entender el contexto. Creá un proyecto Next.js 15 con TypeScript, Tailwind CSS, y configurá la estructura de carpetas según lo definido en el bloque 5 del MASTER. Configurá ESLint, Prettier, y un .gitignore apropiado."

**Autenticación:**
"Implementá la autenticación con Supabase Auth. Necesitamos: registro con email/contraseña, registro con Google, login con ambos, recuperación de contraseña, verificación de email, verificación de teléfono por SMS. Las pantallas están en sección 6 del MASTER. Usá Server Actions y validación con Zod."

**Crear campaña:**
"Implementá la creación de campaña desde el panel admin. La estructura de datos está en sección 4.4 del MASTER. El flujo está en sección 3.3 etapa 1. Formulario con todos los campos, validación, guardado, vista previa antes de publicar."

**Detalle de campaña:**
"Implementá la página de detalle de campaña con la barra de progreso de escalones de precio. Mostrar: foto, descripción, escalón actual, próximo escalón, faltantes para próximo escalón, tiempo restante, selector de cantidad, cálculo dinámico de seña y saldo, botón reservar, botón compartir. Mobile first."

## 10.7 Buenas prácticas trabajando con Claude Code

- **Trabajar por funcionalidades chicas.** No pedir "construime toda la plataforma".
- **Revisar lo que genera.** Especialmente lógica de pagos, precios, validaciones de seguridad.
- **Mantener CLAUDE.md actualizado.** Cada cambio importante de dirección, reflejarlo.
- **Documentar decisiones inesperadas en DECISIONS.md.**
- **Tests para lógica crítica.** Cálculo de campañas, comisiones, pagos.
- **Pedir explicaciones** cuando genere código que no se entiende.

## 10.8 Cómo evoluciona este documento

Este documento maestro cambia a medida que avanza el proyecto. Está bien que cambie. Lo importante es registrar los cambios.

- Cuando aprendas algo importante de un usuario real, agregalo.
- Cuando tomes una decisión nueva, marcala.
- Cuando descubras una regla legal nueva, agregala al Bloque 8.
- Cada trimestre revisá los porcentajes de comisión con datos reales.

Este documento es el cerebro escrito del negocio. Mientras esté vivo, el negocio tiene memoria.

---

## Cierre

Llegaste al final del documento maestro. Este documento sumado al `CLAUDE.md` y a los archivos complementarios en `/docs/` te dan todo el contexto necesario para construir, mantener y escalar Mercado Nuestro.

**Si sos vos leyéndolo:** este es tu mapa. Volvé a él cada vez que tengas una duda sobre por qué decidiste algo o cómo se supone que funciona.

**Si sos Claude Code:** este es tu referencia. Cuando algo no esté claro, buscalo acá antes de improvisar.

**Si sos un asesor o socio nuevo del proyecto:** este documento te da el contexto completo en un solo lugar. Leelo de corrido o saltá a los bloques que te interesen.

Última actualización: documento creado a partir de las definiciones acordadas en las conversaciones iniciales del proyecto. Estado del proyecto al momento de creación: Fase 0 (Preparación).
