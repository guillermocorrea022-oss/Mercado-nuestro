-- ============================================================================
-- Seed marketplace demo — productos y vendedores ficticios
-- ----------------------------------------------------------------------------
-- Crea 3 vendedores demo + 6 productos con imágenes reales de Unsplash +
-- 6 publicaciones activas en el marketplace para ver el diseño con datos.
-- Es idempotente: se puede correr varias veces sin errores.
--
-- Correr en: Supabase → SQL Editor → New query → Paste → Run
-- ============================================================================

do $$
declare
  -- Sellers
  v_seller1_id  uuid;
  v_seller2_id  uuid;
  v_seller3_id  uuid;

  -- Categories
  v_cat_elec    uuid;
  v_cat_hogar   uuid;

  -- Products
  v_prod_auriculares   uuid;
  v_prod_smartwatch    uuid;
  v_prod_robot         uuid;
  v_prod_parlante      uuid;
  v_prod_powerbank     uuid;
  v_prod_lampara       uuid;

begin

  -- ──────────────────────────────────────────────────────────────────────────
  -- 1. VENDEDORES DEMO  (usuarios auth + profiles + seller_profiles + roles)
  -- ──────────────────────────────────────────────────────────────────────────

  -- Vendedor 1 · Carolina M. · Paysandú
  select id into v_seller1_id
    from auth.users where email = 'carolina@demo.mercadonuestro.uy';

  if v_seller1_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      'carolina@demo.mercadonuestro.uy',
      crypt('Demo_Carolina_2026!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Carolina M."}'::jsonb,
      timezone('utc', now()), timezone('utc', now()),
      '', '', '', ''
    ) returning id into v_seller1_id;
  end if;

  update public.profiles
    set first_name = 'Carolina', last_name = 'M.'
    where id = v_seller1_id;

  insert into public.user_roles (user_id, role, assigned_by)
    values (v_seller1_id, 'revendedor', v_seller1_id)
    on conflict (user_id, role) do nothing;

  insert into public.seller_profiles
    (user_id, display_name, slug, bio, rating_avg, total_sales)
  values (
    v_seller1_id,
    'Carolina M.',
    'carolina-m',
    'Importo electrónica y accesorios tech desde hace 2 años desde Paysandú. Todo con garantía y soporte post-venta.',
    4.8,
    12
  ) on conflict (user_id) do nothing;


  -- Vendedor 2 · Diego R. · Montevideo
  select id into v_seller2_id
    from auth.users where email = 'diego@demo.mercadonuestro.uy';

  if v_seller2_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      'diego@demo.mercadonuestro.uy',
      crypt('Demo_Diego_2026!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Diego R."}'::jsonb,
      timezone('utc', now()), timezone('utc', now()),
      '', '', '', ''
    ) returning id into v_seller2_id;
  end if;

  update public.profiles
    set first_name = 'Diego', last_name = 'R.'
    where id = v_seller2_id;

  insert into public.user_roles (user_id, role, assigned_by)
    values (v_seller2_id, 'revendedor', v_seller2_id)
    on conflict (user_id, role) do nothing;

  insert into public.seller_profiles
    (user_id, display_name, slug, bio, rating_avg, total_sales)
  values (
    v_seller2_id,
    'Diego R.',
    'diego-r',
    'Revendedor verificado en Montevideo. Importé 3 tandas y publico el stock que me sobró. Despacho en 24 h.',
    4.9,
    28
  ) on conflict (user_id) do nothing;


  -- Vendedor 3 · Susana P. · Salto
  select id into v_seller3_id
    from auth.users where email = 'susana@demo.mercadonuestro.uy';

  if v_seller3_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(), 'authenticated', 'authenticated',
      'susana@demo.mercadonuestro.uy',
      crypt('Demo_Susana_2026!', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Susana P."}'::jsonb,
      timezone('utc', now()), timezone('utc', now()),
      '', '', '', ''
    ) returning id into v_seller3_id;
  end if;

  update public.profiles
    set first_name = 'Susana', last_name = 'P.'
    where id = v_seller3_id;

  insert into public.user_roles (user_id, role, assigned_by)
    values (v_seller3_id, 'revendedor', v_seller3_id)
    on conflict (user_id, role) do nothing;

  insert into public.seller_profiles
    (user_id, display_name, slug, bio, rating_avg, total_sales)
  values (
    v_seller3_id,
    'Susana P.',
    'susana-p',
    'Desde Salto. Compro en campañas para uso personal y revendo el sobrante. Atención personalizada.',
    4.5,
    7
  ) on conflict (user_id) do nothing;


  -- ──────────────────────────────────────────────────────────────────────────
  -- 2. CATEGORÍAS (idempotente, ya existe Electrónica y Hogar del seed base)
  -- ──────────────────────────────────────────────────────────────────────────

  select id into v_cat_elec  from public.categories where slug = 'electronica';
  select id into v_cat_hogar from public.categories where slug = 'hogar';

  -- Si no existen (instancia limpia), las creamos.
  if v_cat_elec is null then
    insert into public.categories (name, slug, icon, display_order)
      values ('Electrónica', 'electronica', 'Cpu', 1)
      returning id into v_cat_elec;
  end if;

  if v_cat_hogar is null then
    insert into public.categories (name, slug, icon, display_order)
      values ('Hogar', 'hogar', 'Home', 2)
      returning id into v_cat_hogar;
  end if;


  -- ──────────────────────────────────────────────────────────────────────────
  -- 3. PRODUCTOS con imágenes reales de Unsplash
  -- ──────────────────────────────────────────────────────────────────────────

  -- Producto 1: Auriculares Bluetooth TWS
  select id into v_prod_auriculares
    from public.products where slug = 'auriculares-bluetooth-tws-pro';

  if v_prod_auriculares is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Auriculares Bluetooth TWS Pro',
      'auriculares-bluetooth-tws-pro',
      'SoundMax',
      'Auriculares inalámbricos con cancelación activa de ruido, 30 hs de batería y sonido Hi-Fi.',
      'Auriculares True Wireless Stereo con cancelación activa de ruido (ANC) de última generación. Drivers de 10 mm, respuesta de frecuencia 20 Hz–20 kHz, latencia <60 ms para gaming. Estuche de carga con 25 hs adicionales de batería. IPX4 resistente al sudor. Compatible con iOS y Android. Control táctil en cada auricular. Conectividad Bluetooth 5.2 con alcance 15 m.',
      v_cat_elec,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Conectividad',    'Bluetooth 5.2',
        'Batería',         '8 hs + 22 hs (estuche)',
        'Cancelación',     'ANC activo',
        'Resistencia',     'IPX4',
        'Driver',          '10 mm Hi-Fi',
        'Latencia',        '<60 ms',
        'Compatibilidad',  'iOS / Android / Windows'
      )
    ) returning id into v_prod_auriculares;
  end if;


  -- Producto 2: Smartwatch Fitness
  select id into v_prod_smartwatch
    from public.products where slug = 'smartwatch-fitness-gt4';

  if v_prod_smartwatch is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Smartwatch Fitness GT4',
      'smartwatch-fitness-gt4',
      'FitPro',
      'Reloj inteligente con GPS, monitor cardíaco, 100+ modos deportivos y hasta 14 días de batería.',
      'Smartwatch de gama media-alta con pantalla AMOLED 1.43", resolución 466×466, GPS integrado, monitor de frecuencia cardíaca óptico 24/7, SpO2, sensor de estrés. 100+ modos deportivos. Notificaciones de llamadas, SMS y apps. Resistencia al agua 5 ATM (natación). Carga magnética, batería que dura hasta 14 días en uso normal.',
      v_cat_elec,
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Pantalla',        'AMOLED 1.43"',
        'GPS',             'Integrado',
        'Batería',         'Hasta 14 días',
        'Resistencia',     '5 ATM (natación)',
        'Sensor',          'Cardíaco + SpO2 + Estrés',
        'Deportes',        '100+ modos',
        'Carga',           'Magnética rápida'
      )
    ) returning id into v_prod_smartwatch;
  end if;


  -- Producto 3: Robot Aspiradora
  select id into v_prod_robot
    from public.products where slug = 'robot-aspiradora-laser-nav';

  if v_prod_robot is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Robot Aspiradora con Navegación Láser',
      'robot-aspiradora-laser-nav',
      'RoboClean',
      'Aspiradora robótica con mapeo láser LiDAR, succión 2700 Pa, fregado y vaciado automático.',
      'Robot aspiradora de alto rendimiento con navegación láser LiDAR para mapeo preciso de hasta 250 m². Succión regulable hasta 2700 Pa. Función de fregado con depósito de 150 ml. Compatible con Alexa, Google Home y app propia. Planifica zonas, habitaciones virtuales y horarios de limpieza. Batería para 120 min. Vuelve solo a la base a cargar. Bolsa antipolvo de 2.5 L.',
      v_cat_hogar,
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Navegación',      'LiDAR láser',
        'Succión',         '2700 Pa',
        'Cobertura',       'Hasta 250 m²',
        'Batería',         '120 min',
        'Fregado',         'Sí (depósito 150 ml)',
        'Bolsa',           '2.5 L antipolvo',
        'Integración',     'Alexa / Google Home'
      )
    ) returning id into v_prod_robot;
  end if;


  -- Producto 4: Parlante Bluetooth portátil
  select id into v_prod_parlante
    from public.products where slug = 'parlante-bluetooth-waterproof-360';

  if v_prod_parlante is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Parlante Bluetooth Waterproof 360°',
      'parlante-bluetooth-waterproof-360',
      'BoomBox',
      'Parlante portátil con sonido 360°, 20 hs de batería, resistente al agua IPX7 y carga rápida.',
      'Parlante Bluetooth portátil con tecnología de sonido omnidireccional 360° y dos tweeters de alta frecuencia. Potencia de salida 30 W RMS. IPX7: sumergible hasta 1 metro. Bluetooth 5.0 con alcance 30 m. Modo de emparejamiento doble para conectar dos parlantes en estéreo. Batería de 5000 mAh con carga rápida USB-C. Resistente a caídas desde 1 m.',
      v_cat_elec,
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Potencia',        '30 W RMS',
        'Sonido',          '360° omnidireccional',
        'Bluetooth',       '5.0 · 30 m',
        'Batería',         '20 hs · carga rápida',
        'Resistencia',     'IPX7 (1 metro)',
        'Carga',           'USB-C',
        'Caídas',          'Resistente hasta 1 m'
      )
    ) returning id into v_prod_parlante;
  end if;


  -- Producto 5: Power bank solar 20000 mAh
  select id into v_prod_powerbank
    from public.products where slug = 'powerbank-solar-20000mah';

  if v_prod_powerbank is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Power Bank Solar 20000 mAh',
      'powerbank-solar-20000mah',
      'SolarCharge',
      'Banco de energía con panel solar, 20000 mAh, carga rápida PD 20W y linterna integrada.',
      'Power bank de alta capacidad con panel solar policristalino para carga de emergencia. Capacidad 20000 mAh — carga 4 veces un smartphone estándar. Puerto USB-C PD 20W para laptops y tablets. Puertos USB-A (18W) × 2. Pantalla LED de porcentaje. Linterna integrada con 3 modos (continuo, parpadeante, SOS). Carcasa de plástico reciclado con refuerzo de caucho.',
      v_cat_elec,
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Capacidad',       '20000 mAh',
        'Panel solar',     'Policristalino',
        'Salida USB-C',    'PD 20W',
        'Salidas USB-A',   '2× 18W',
        'Linterna',        '3 modos',
        'Pantalla',        'LED porcentaje',
        'Carcasa',         'Plástico reciclado + caucho'
      )
    ) returning id into v_prod_powerbank;
  end if;


  -- Producto 6: Lámpara LED de escritorio
  select id into v_prod_lampara
    from public.products where slug = 'lampara-led-escritorio-regulable';

  if v_prod_lampara is null then
    insert into public.products (
      name, slug, brand, short_description, long_description,
      category_id, main_image_url, attributes
    ) values (
      'Lámpara LED de Escritorio Regulable',
      'lampara-led-escritorio-regulable',
      'LuxDesk',
      'Lámpara de escritorio con 5 temperaturas de color, 10 niveles de brillo, cargador USB y brazo flexible.',
      'Lámpara LED de escritorio con panel de 48 LEDs de bajo consumo (8W). 5 temperaturas de color (2700 K–6500 K) y 10 niveles de brillo ajustables con un solo toque. Brazo flexible de 360° para orientar la luz. Función de memoria que recuerda el último ajuste. Puerto USB integrado para cargar el celular. Base con adhesivo o clip para mesa. Certificación CE, RoHS.',
      v_cat_hogar,
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
      jsonb_build_object(
        'Potencia',        '8 W LED',
        'Temperaturas',    '5 (2700 K – 6500 K)',
        'Brillo',          '10 niveles',
        'Brazo',           'Flexible 360°',
        'USB carga',       'Integrado',
        'Certificación',   'CE · RoHS',
        'Memoria',         'Último ajuste'
      )
    ) returning id into v_prod_lampara;
  end if;


  -- ──────────────────────────────────────────────────────────────────────────
  -- 4. MARKETPLACE LISTINGS (status activa, stock disponible)
  -- ──────────────────────────────────────────────────────────────────────────
  -- Usamos ON CONFLICT DO NOTHING sobre (seller_id, product_id) para
  -- que sea idempotente. Si la tabla no tiene ese unique constraint, el
  -- bloque igual es seguro porque verificamos con un SELECT previo.

  -- Auriculares · Carolina
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller1_id and product_id = v_prod_auriculares
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller1_id, v_prod_auriculares, 4, 5,
      3490,  -- USD 34.90
      'activa',
      'Caja abierta para verificar el contenido, nunca usados. Incluye cable de carga, puntas de repuesto (S/M/L) y estuche. Sin garantía de fábrica pero te acompaño personalmente ante cualquier problema.'
    );
  end if;

  -- Smartwatch · Carolina
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller1_id and product_id = v_prod_smartwatch
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller1_id, v_prod_smartwatch, 2, 3,
      5490,  -- USD 54.90
      'Sin uso. Caja sellada de fábrica. Importé 3 unidades para reventa, me quedan 2. Coordino entrega en Paysandú sin costo.'
    );
  end if;

  -- Robot aspiradora · Diego
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller2_id and product_id = v_prod_robot
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller2_id, v_prod_robot, 1, 2,
      8990,  -- USD 89.90
      'Unidad nueva, caja sellada. Importé 2 y me sobró una. Incluyo bolsas de repuesto ×3. Despacho desde Montevideo en 24h hábiles.'
    );
  end if;

  -- Parlante · Diego
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller2_id and product_id = v_prod_parlante
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller2_id, v_prod_parlante, 3, 5,
      4290,  -- USD 42.90
      'Nuevos en caja. Traje 5 unidades para regalos de fin de año, me quedan 3. Se los probé todos antes de despachar. Colores disponibles: negro y gris.'
    );
  end if;

  -- Power bank · Susana
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller3_id and product_id = v_prod_powerbank
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller3_id, v_prod_powerbank, 5, 6,
      2790,  -- USD 27.90
      'Nuevos, caja sellada. Ideal para camping y cortes de luz. Me sobró stock de una tanda anterior. Envío a todo Uruguay.'
    );
  end if;

  -- Lámpara · Susana
  if not exists (
    select 1 from public.marketplace_listings
    where seller_id = v_seller3_id and product_id = v_prod_lampara
  ) then
    insert into public.marketplace_listings
      (seller_id, product_id, quantity_available, quantity_total,
       price_cents_usd, status, description)
    values (
      v_seller3_id, v_prod_lampara, 8, 10,
      2190,  -- USD 21.90
      'Stock disponible. Sin abrir. Perfecta para estudio o escritorio. Las probé todas antes de publicar — funcionan a la perfección.'
    );
  end if;

end $$;
