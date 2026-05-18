-- ============================================================================
-- Seed data — desarrollo / demo
-- ----------------------------------------------------------------------------
-- Este archivo lo aplica `supabase db reset` cuando se trabaja con CLI local,
-- y también lo aplicamos manualmente en cloud vía SQL Editor para tener data
-- de demo en /campanas. Es idempotente (usa ON CONFLICT DO NOTHING) para que
-- se pueda correr varias veces sin fallar.
--
-- Lo que crea:
--   - 1 usuario admin (admin@mercadonuestro.uy) con rol admin
--   - 4 categorías raíz
--   - 1 producto demo (cámara IP WiFi)
--   - 1 campaña activa con 3 escalones de precio
-- ============================================================================

do $$
declare
  v_admin_id uuid;
  v_cat_electronica uuid;
  v_product_id uuid;
  v_campaign_id uuid;
begin
  -- Admin user. Si ya existe (segunda corrida), reusamos su id.
  select id into v_admin_id from auth.users where email = 'admin@mercadonuestro.uy';

  if v_admin_id is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@mercadonuestro.uy',
      crypt('Admin_MN_2026!Temp', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Mercado Nuestro Admin"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now()),
      '', '', '', ''
    )
    returning id into v_admin_id;
    -- El trigger on_auth_user_created crea automáticamente el profile y el
    -- rol "comprador" para v_admin_id.
  end if;

  -- Sumamos rol admin (acumulable). El profile y rol comprador ya existen.
  insert into public.user_roles (user_id, role, assigned_by)
  values (v_admin_id, 'admin', v_admin_id)
  on conflict (user_id, role) do nothing;

  -- Categorías raíz
  insert into public.categories (name, slug, icon, display_order)
  values
    ('Electrónica', 'electronica', 'Cpu', 1),
    ('Hogar', 'hogar', 'Home', 2),
    ('Indumentaria', 'indumentaria', 'Shirt', 3),
    ('Deportes y aire libre', 'deportes', 'Bike', 4)
  on conflict (slug) do nothing;

  select id into v_cat_electronica from public.categories where slug = 'electronica';

  -- Producto demo: Cámara IP WiFi 1080P
  select id into v_product_id from public.products where slug = 'camara-ip-wifi-1080p';

  if v_product_id is null then
    insert into public.products (
      name, slug, short_description, long_description,
      category_id, brand, main_image_url, attributes
    )
    values (
      'Cámara IP WiFi 1080P interior/exterior',
      'camara-ip-wifi-1080p',
      'Cámara de seguridad con visión nocturna, audio bidireccional y app para celular.',
      'Cámara IP WiFi 1080P resistente a la intemperie (IP66). Detección de movimiento con notificaciones push al celular, visión nocturna infrarroja hasta 10 metros, audio bidireccional para hablar con quien esté del otro lado, almacenamiento en microSD o nube. Compatible con Alexa y Google Home. Se conecta a tu WiFi en menos de 5 minutos con la app oficial. Ideal para casas, locales, depósitos y oficinas.',
      v_cat_electronica,
      'Generic',
      'https://placehold.co/1200x800/22c55e/ffffff?text=C%C3%A1mara+IP+WiFi+1080P',
      jsonb_build_object(
        'resolucion', '1080P Full HD',
        'vision_nocturna', '10 metros (IR)',
        'audio', 'Bidireccional',
        'conectividad', 'WiFi 2.4 GHz',
        'almacenamiento', 'MicroSD hasta 128GB / Nube',
        'resistencia', 'IP66 (exterior)',
        'compatibilidad', 'Alexa, Google Home, iOS, Android'
      )
    )
    returning id into v_product_id;
  end if;

  -- Campaña activa
  select id into v_campaign_id from public.campaigns where slug = 'camara-ip-wifi-primera-tanda';

  if v_campaign_id is null then
    insert into public.campaigns (
      product_id, title, slug, description, hero_image_url,
      moq, max_quantity, deposit_percentage,
      opens_at, closes_at, estimated_arrival_at,
      status, return_policy, created_by
    )
    values (
      v_product_id,
      'Cámara IP WiFi · Primera tanda 2026',
      'camara-ip-wifi-primera-tanda',
      'Sumate a la primera importación grupal del año. Cuantas más unidades reservamos, mejor el precio para todos. Llegada estimada: 45 a 60 días desde el cierre.',
      'https://placehold.co/1600x900/16a34a/ffffff?text=C%C3%A1mara+IP+WiFi+%E2%80%A2+Primera+tanda',
      30,
      150,
      30,
      timezone('utc', now()),
      timezone('utc', now()) + interval '14 days',
      (current_date + interval '60 days')::date,
      'activa',
      'Garantía de 6 meses contra defecto de fábrica. Devolución total si el producto no funciona al recibirlo.',
      v_admin_id
    )
    returning id into v_campaign_id;

    -- Escalones de precio (centavos USD: 2500 = USD 25, 1800 = USD 18, 1400 = USD 14)
    insert into public.campaign_pricing_tiers (
      campaign_id, tier_number, min_quantity, max_quantity, unit_price_cents_usd
    )
    values
      (v_campaign_id, 1, 1, 10, 2500),
      (v_campaign_id, 2, 11, 30, 1800),
      (v_campaign_id, 3, 31, 100, 1400);
  end if;
end $$;
