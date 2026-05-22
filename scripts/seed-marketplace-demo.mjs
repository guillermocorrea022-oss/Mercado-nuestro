// scripts/seed-marketplace-demo.mjs
// Corre con: node scripts/seed-marketplace-demo.mjs
// Crea 3 vendedores demo + 6 productos + 6 listings en el marketplace.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Leer .env.local manualmente (no queremos depender de dotenv)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...rest] = l.split("=");
      return [k.trim(), rest.join("=").trim().replace(/^"|"$/g, "")];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function log(msg) { console.log(`  ${msg}`); }
function ok(msg)  { console.log(`  ✅ ${msg}`); }
function skip(msg){ console.log(`  ⏭  ${msg} (ya existe)`); }
function err(msg, e) { console.error(`  ❌ ${msg}`, e?.message ?? e); }

async function getOrCreateUser(email, displayName) {
  // Buscar usuario existente via admin API
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) { err("listUsers", listErr); return null; }

  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    skip(`usuario ${email}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: `Demo_MN_2026!${displayName.replace(/\s/g, "")}`,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (error) { err(`crear usuario ${email}`, error); return null; }
  ok(`usuario creado: ${email}`);
  return data.user.id;
}

async function upsertProfile(userId, firstName, lastName) {
  const { error } = await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", userId);
  if (error) err(`profile ${userId}`, error);
  else ok(`profile actualizado: ${firstName} ${lastName}`);
}

async function ensureRole(userId, role) {
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role, assigned_by: userId })
    .select();
  if (error?.code === "23505") { skip(`rol ${role} para ${userId}`); }
  else if (error) err(`rol ${role}`, error);
  else ok(`rol ${role} asignado`);
}

async function upsertSellerProfile(userId, data) {
  const { data: existing } = await supabase
    .from("seller_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) { skip(`seller_profile ${data.display_name}`); return; }

  const { error } = await supabase.from("seller_profiles").insert({ user_id: userId, ...data });
  if (error) err(`seller_profile ${data.display_name}`, error);
  else ok(`seller_profile: ${data.display_name}`);
}

async function getOrCreateProduct(slug, data) {
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) { skip(`producto ${slug}`); return existing.id; }

  const { data: created, error } = await supabase
    .from("products")
    .insert({ slug, ...data })
    .select("id")
    .single();
  if (error) { err(`producto ${slug}`, error); return null; }
  ok(`producto creado: ${data.name}`);
  return created.id;
}

async function getOrCreateListing(sellerId, productId, data) {
  const { data: existing } = await supabase
    .from("marketplace_listings")
    .select("id")
    .eq("seller_id", sellerId)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) { skip(`listing seller=${sellerId} prod=${productId}`); return; }

  const { error } = await supabase.from("marketplace_listings").insert({
    seller_id: sellerId,
    product_id: productId,
    ...data,
  });
  if (error) err(`listing ${productId}`, error);
  else ok(`listing creado: ${data.description?.slice(0, 50) ?? ""}...`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Categorías
// ─────────────────────────────────────────────────────────────────────────────

async function getCatId(slug) {
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (data) return data.id;

  const names = { electronica: "Electrónica", hogar: "Hogar" };
  const icons = { electronica: "Cpu", hogar: "Home" };
  const orders = { electronica: 1, hogar: 2 };
  const { data: created, error } = await supabase
    .from("categories")
    .insert({ name: names[slug], slug, icon: icons[slug], display_order: orders[slug] })
    .select("id")
    .single();
  if (error) { err(`categoría ${slug}`, error); return null; }
  ok(`categoría creada: ${slug}`);
  return created.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n🚀  Seeding marketplace demo...\n");

// 1. Categorías
console.log("📂  Categorías");
const catElec  = await getCatId("electronica");
const catHogar = await getCatId("hogar");

// 2. Vendedores
console.log("\n👤  Vendedor 1 · Carolina M.");
const s1 = await getOrCreateUser("carolina@demo.mercadonuestro.uy", "Carolina M.");
if (s1) {
  await upsertProfile(s1, "Carolina", "M.");
  await ensureRole(s1, "comprador");
  await ensureRole(s1, "revendedor");
  await upsertSellerProfile(s1, {
    display_name: "Carolina M.",
    slug: "carolina-m",
    bio: "Importo electrónica y accesorios tech desde hace 2 años en Paysandú. Todo con garantía y atención post-venta.",
    rating_avg: 4.8,
    total_sales: 12,
  });
}

console.log("\n👤  Vendedor 2 · Diego R.");
const s2 = await getOrCreateUser("diego@demo.mercadonuestro.uy", "Diego R.");
if (s2) {
  await upsertProfile(s2, "Diego", "R.");
  await ensureRole(s2, "comprador");
  await ensureRole(s2, "revendedor");
  await upsertSellerProfile(s2, {
    display_name: "Diego R.",
    slug: "diego-r",
    bio: "Revendedor verificado en Montevideo. Importé 3 tandas y publico el stock sobrante. Despacho en 24 h.",
    rating_avg: 4.9,
    total_sales: 28,
  });
}

console.log("\n👤  Vendedor 3 · Susana P.");
const s3 = await getOrCreateUser("susana@demo.mercadonuestro.uy", "Susana P.");
if (s3) {
  await upsertProfile(s3, "Susana", "P.");
  await ensureRole(s3, "comprador");
  await ensureRole(s3, "revendedor");
  await upsertSellerProfile(s3, {
    display_name: "Susana P.",
    slug: "susana-p",
    bio: "Desde Salto. Compro en campañas para uso personal y revendo el sobrante. Atención personalizada.",
    rating_avg: 4.5,
    total_sales: 7,
  });
}

// 3. Productos
console.log("\n📦  Productos");

const pAuriculares = await getOrCreateProduct("auriculares-bluetooth-tws-pro", {
  name: "Auriculares Bluetooth TWS Pro",
  brand: "SoundMax",
  short_description: "Auriculares inalámbricos con cancelación activa de ruido, 30 hs de batería y sonido Hi-Fi.",
  long_description:
    "Auriculares True Wireless Stereo con cancelación activa de ruido (ANC). Drivers de 10 mm, respuesta 20 Hz–20 kHz, latencia <60 ms. Estuche de carga con 22 hs adicionales. IPX4 resistente al sudor. Compatible iOS y Android. Bluetooth 5.2, alcance 15 m.",
  category_id: catElec,
  main_image_url:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Conectividad: "Bluetooth 5.2",
    Batería: "8 hs + 22 hs (estuche)",
    Cancelación: "ANC activo",
    Resistencia: "IPX4",
    Driver: "10 mm Hi-Fi",
    Latencia: "<60 ms",
    Compatibilidad: "iOS / Android / Windows",
  },
});

const pSmartwatch = await getOrCreateProduct("smartwatch-fitness-gt4", {
  name: "Smartwatch Fitness GT4",
  brand: "FitPro",
  short_description: "Reloj inteligente con GPS, monitor cardíaco, 100+ modos deportivos y 14 días de batería.",
  long_description:
    "Smartwatch con pantalla AMOLED 1.43\", resolución 466×466, GPS integrado, monitor cardíaco 24/7, SpO2, sensor de estrés. 100+ modos deportivos. Notificaciones push. Resistencia 5 ATM. Batería hasta 14 días en uso normal.",
  category_id: catElec,
  main_image_url:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Pantalla: "AMOLED 1.43\"",
    GPS: "Integrado",
    Batería: "Hasta 14 días",
    Resistencia: "5 ATM (natación)",
    Sensor: "Cardíaco + SpO2 + Estrés",
    Deportes: "100+ modos",
    Carga: "Magnética rápida",
  },
});

const pRobot = await getOrCreateProduct("robot-aspiradora-laser-nav", {
  name: "Robot Aspiradora con Navegación Láser",
  brand: "RoboClean",
  short_description: "Aspiradora robótica con mapeo LiDAR, succión 2700 Pa, fregado y 120 min de autonomía.",
  long_description:
    "Robot con navegación láser LiDAR para mapeo preciso de hasta 250 m². Succión regulable hasta 2700 Pa. Función de fregado con depósito 150 ml. Compatible con Alexa y Google Home. Batería 120 min, vuelve solo a la base a cargar.",
  category_id: catHogar,
  main_image_url:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Navegación: "LiDAR láser",
    Succión: "2700 Pa",
    Cobertura: "Hasta 250 m²",
    Batería: "120 min",
    Fregado: "Sí (depósito 150 ml)",
    Bolsa: "2.5 L antipolvo",
    Integración: "Alexa / Google Home",
  },
});

const pParlante = await getOrCreateProduct("parlante-bluetooth-waterproof-360", {
  name: "Parlante Bluetooth Waterproof 360°",
  brand: "BoomBox",
  short_description: "Parlante portátil 360°, 30 W, 20 hs de batería, IPX7 y carga rápida USB-C.",
  long_description:
    "Parlante Bluetooth con sonido omnidireccional 360° y dos tweeters de alta frecuencia. 30 W RMS. IPX7 sumergible 1 m. Bluetooth 5.0, alcance 30 m. Modo estéreo dual. Batería 5000 mAh con carga rápida USB-C. Resistente a caídas.",
  category_id: catElec,
  main_image_url:
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Potencia: "30 W RMS",
    Sonido: "360° omnidireccional",
    Bluetooth: "5.0 · 30 m",
    Batería: "20 hs · carga rápida",
    Resistencia: "IPX7 (1 metro)",
    Carga: "USB-C",
    Caídas: "Resistente hasta 1 m",
  },
});

const pPowerbank = await getOrCreateProduct("powerbank-solar-20000mah", {
  name: "Power Bank Solar 20000 mAh",
  brand: "SolarCharge",
  short_description: "Banco de energía con panel solar, 20000 mAh, carga rápida PD 20W y linterna integrada.",
  long_description:
    "Power bank con panel solar policristalino de emergencia. 20000 mAh — carga 4 veces un smartphone. Puerto USB-C PD 20W para laptops. Puertos USB-A (18W) × 2. Pantalla LED de porcentaje. Linterna 3 modos (continuo / parpadeante / SOS).",
  category_id: catElec,
  main_image_url:
    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Capacidad: "20000 mAh",
    "Panel solar": "Policristalino",
    "Salida USB-C": "PD 20W",
    "Salidas USB-A": "2× 18W",
    Linterna: "3 modos",
    Pantalla: "LED porcentaje",
  },
});

const pLampara = await getOrCreateProduct("lampara-led-escritorio-regulable", {
  name: "Lámpara LED de Escritorio Regulable",
  brand: "LuxDesk",
  short_description: "Lámpara de escritorio con 5 temperaturas de color, 10 niveles de brillo y cargador USB.",
  long_description:
    "Lámpara LED con 48 LEDs (8 W). 5 temperaturas de color (2700 K–6500 K) y 10 niveles de brillo con un solo toque. Brazo flexible 360°. Función memoria. Puerto USB integrado para carga. Certificación CE, RoHS.",
  category_id: catHogar,
  main_image_url:
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80",
  attributes: {
    Potencia: "8 W LED",
    Temperaturas: "5 (2700 K – 6500 K)",
    Brillo: "10 niveles",
    Brazo: "Flexible 360°",
    "USB carga": "Integrado",
    Certificación: "CE · RoHS",
    Memoria: "Último ajuste",
  },
});

// 4. Listings
if (s1 && pAuriculares && pSmartwatch) {
  console.log("\n🏪  Listings · Carolina");
  await getOrCreateListing(s1, pAuriculares, {
    quantity_available: 4,
    quantity_total: 5,
    price_cents_usd: 3490,
    status: "activa",
    description:
      "Caja abierta para verificar el contenido, nunca usados. Incluye cable de carga, puntas de repuesto (S/M/L) y estuche. Te acompaño ante cualquier problema.",
  });
  await getOrCreateListing(s1, pSmartwatch, {
    quantity_available: 2,
    quantity_total: 3,
    price_cents_usd: 5490,
    status: "activa",
    description:
      "Sin uso, caja sellada de fábrica. Importé 3 unidades para reventa, me quedan 2. Coordino entrega en Paysandú sin costo adicional.",
  });
}

if (s2 && pRobot && pParlante) {
  console.log("\n🏪  Listings · Diego");
  await getOrCreateListing(s2, pRobot, {
    quantity_available: 1,
    quantity_total: 2,
    price_cents_usd: 8990,
    status: "activa",
    description:
      "Unidad nueva, caja sellada. Importé 2 y me sobró una. Incluyo bolsas de repuesto ×3. Despacho desde Montevideo en 24 h hábiles.",
  });
  await getOrCreateListing(s2, pParlante, {
    quantity_available: 3,
    quantity_total: 5,
    price_cents_usd: 4290,
    status: "activa",
    description:
      "Nuevos en caja. Traje 5 unidades para regalos, me quedan 3. Colores disponibles: negro y gris. Los probé todos antes de despachar.",
  });
}

if (s3 && pPowerbank && pLampara) {
  console.log("\n🏪  Listings · Susana");
  await getOrCreateListing(s3, pPowerbank, {
    quantity_available: 5,
    quantity_total: 6,
    price_cents_usd: 2790,
    status: "activa",
    description:
      "Nuevos, caja sellada. Ideal para camping y cortes de luz. Me sobró stock de una tanda anterior. Envío a todo Uruguay.",
  });
  await getOrCreateListing(s3, pLampara, {
    quantity_available: 8,
    quantity_total: 10,
    price_cents_usd: 2190,
    status: "activa",
    description:
      "Stock disponible, sin abrir. Perfecta para estudio o escritorio. Las probé todas — funcionan perfecto.",
  });
}

console.log("\n✨  ¡Listo! Marketplace demo cargado.\n");
