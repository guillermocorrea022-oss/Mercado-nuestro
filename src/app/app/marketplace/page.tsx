import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck, Star } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";
import { fixMojibake } from "@/lib/encoding";
import { HeroCarousel, type HeroSlide } from "@/components/layout/HeroCarousel";
import { AdSlot } from "@/components/marketplace/AdSlot";
import { BrandsMosaic } from "@/components/marketplace/BrandsMosaic";
import {
  CampaignsAndFeaturedSplit,
  type SplitCampaignCard,
  type SplitFeaturedCard,
} from "@/components/marketplace/CampaignsAndFeaturedSplit";
import { CategoryHighlights } from "@/components/marketplace/CategoryHighlights";
import {
  FlashDeals,
  type FlashDealItem,
} from "@/components/marketplace/FlashDeals";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ServiceStrip } from "@/components/marketplace/ServiceStrip";
import { IconMN } from "@/components/ui/IconMN";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mercado Nuestro — La tienda",
  description:
    "Stock real de importadores uruguayos + productos de Mercado Nuestro. Precio de importación, sin intermediarios. Compra 100% protegida.",
};

// Slides del hero carousel — promociones destacadas que rotan automáticamente.
// Las imágenes naturales son 2048x768 (16:6 panorámicas estilo Mercado Libre)
// y se muestran en su tamaño completo sin crop ni zoom.
// El sufijo "-v2" en el nombre es para invalidar el cache de optimización
// de Next/Image (que tenía resultadas para las imágenes viejas 1672x941).
// ─── Mock flash deals ─────────────────────────────────────────────────────────
// Datos placeholder para la sección "Ofertas del día". Cuando la BD tenga
// productos con campos `original_price_cents` y `flash_deal_until`, reemplazar
// con una query real. Por ahora muestra la UI con productos mock.
const MOCK_FLASH_DEALS: FlashDealItem[] = [
  {
    id: "deal-1",
    slug: "1",
    name: "Auriculares Bluetooth con cancelación de ruido",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    originalPriceCents: 8900,
    priceCents: 4990,
    stockProgressPct: 87,
  },
  {
    id: "deal-2",
    slug: "2",
    name: "Cámara IP WiFi 1080P para casa",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop",
    originalPriceCents: 4500,
    priceCents: 2490,
    stockProgressPct: 65,
  },
  {
    id: "deal-3",
    slug: "3",
    name: "Robot aspiradora con navegación láser",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop",
    originalPriceCents: 24900,
    priceCents: 16900,
    stockProgressPct: 42,
  },
  {
    id: "deal-4",
    slug: "4",
    name: "Power Bank 20.000 mAh carga rápida",
    image:
      "https://images.unsplash.com/photo-1609692814859-8b3a5f8e0fde?w=600&h=600&fit=crop",
    originalPriceCents: 3500,
    priceCents: 1990,
    stockProgressPct: 92,
  },
];

// ─── Mock split (campañas + destacados) ──────────────────────────────────────
// Datos para la sección "Campañas de importación" + "Destacados Mercado Nuestro"
// que va arriba de las ofertas del día. Cuando la DB tenga campañas activas y
// productos con stock real, reemplazar con queries.
const MOCK_SPLIT_CAMPAIGNS: SplitCampaignCard[] = [
  {
    id: "camp-1",
    slug: "auriculares-inalambricos-pro",
    name: "Auriculares Inalámbricos Pro 2da Generación",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop",
    priceUsd: 79.99,
    goalUnits: 100,
    progressPct: 62,
    daysLeft: 3,
  },
  {
    id: "camp-2",
    slug: "smartwatch-series-9",
    name: "Smartwatch Series 9 45mm GPS",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop",
    priceUsd: 199.0,
    goalUnits: 80,
    progressPct: 75,
    daysLeft: 5,
  },
  {
    id: "camp-3",
    slug: "cafetera-espresso-automatica",
    name: "Cafetera Espresso Automática",
    image:
      "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&h=600&fit=crop",
    priceUsd: 129.0,
    goalUnits: 60,
    progressPct: 40,
    daysLeft: 6,
  },
];

const MOCK_SPLIT_FEATURED: SplitFeaturedCard[] = [
  {
    id: "feat-1",
    slug: "sofa-3-cuerpos-beige",
    name: "Sofá 3 Cuerpos Beige Textil",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    priceUyu: 15990,
    inStock: true,
  },
  {
    id: "feat-2",
    slug: "freidora-aire-6l",
    name: "Freidora de Aire 6.5L Digital",
    image:
      "https://images.unsplash.com/photo-1648505152680-19f2a2fdc4d3?w=600&h=600&fit=crop",
    priceUyu: 4890,
    inStock: true,
  },
  {
    id: "feat-3",
    slug: "zapatillas-urbanas-unisex",
    name: "Zapatillas Urbanas Unisex",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    priceUyu: 2490,
    inStock: true,
  },
];

const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero-carousel/envio-gratis-v2.png",
    alt: "Envío gratis en tu primera compra",
    href: "/app/marketplace?promo=envio-gratis",
    background: "#1E3A8A",
  },
  {
    image: "/hero-carousel/imperdibles-v2.png",
    alt: "Imperdibles en bazar y organización — hasta 40% OFF",
    href: "/app/marketplace?cat=hogar",
    background: "#F5F5F5",
  },
  {
    image: "/hero-carousel/jueves-moda-v2.png",
    alt: "Jueves de moda — hasta 30% OFF",
    href: "/app/marketplace?cat=indumentaria",
    background: "#E8E1D8",
  },
];

export const revalidate = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductInfo = {
  name: string;
  main_image_url: string | null;
  brand: string | null;
  category_id: string | null;
};

type RawListing = {
  id: string;
  seller_id: string;
  price_cents_usd: number;
  quantity_available: number;
  description: string | null;
  product: ProductInfo | ProductInfo[] | null;
};

type SellerInfo = {
  user_id: string;
  display_name: string;
  slug: string;
  rating_avg: number;
  total_sales: number;
};

type ListingRow = RawListing & { seller: SellerInfo | null };

// ─── Static data ──────────────────────────────────────────────────────────────

const PROMO_TILES = [
  {
    id: "electronica",
    cat: "Electrónica",
    title: "Los mejores gadgets",
    cta: "Ver más",
    href: "/app/marketplace?cat=electronica",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    overlay: "from-blue/80",
  },
  {
    id: "hogar",
    cat: "Hogar",
    title: "Para tu casa",
    cta: "Ver más",
    href: "/app/marketplace?cat=hogar",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
    overlay: "from-navy/80",
  },
  {
    id: "herramientas",
    cat: "Herramientas",
    title: "Todo lo que necesitás",
    cta: "Ver más",
    href: "/app/marketplace?cat=herramientas",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop",
    overlay: "from-black/70",
  },
  {
    id: "indumentaria",
    cat: "Indumentaria",
    title: "Tu estilo, tu precio",
    cta: "Ver más",
    href: "/app/marketplace?cat=indumentaria",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop",
    overlay: "from-yellow/80",
  },
];

const CATEGORY_GRID = [
  {
    label: "Electrónica",
    value: "electronica",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=220&fit=crop",
  },
  {
    label: "Hogar",
    value: "hogar",
    image:
      "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=300&h=220&fit=crop",
  },
  {
    label: "Herramientas",
    value: "herramientas",
    image:
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=220&fit=crop",
  },
  {
    label: "Indumentaria",
    value: "indumentaria",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=220&fit=crop",
  },
  {
    label: "Deportes",
    value: "deportes",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=220&fit=crop",
  },
  {
    label: "Otros",
    value: "otros",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=220&fit=crop",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const { q = "", cat = "" } = await searchParams;
  const isSearching = Boolean(q.trim()) || Boolean(cat.trim());

  const supabase = await createClient();

  // Query 1: listings con producto (sin join a seller_profiles — FK apunta a
  // profiles.id, no a seller_profiles.user_id; hacemos merge en memoria).
  const { data: rawListings } = await supabase
    .from("marketplace_listings")
    .select(
      "id, seller_id, price_cents_usd, quantity_available, description, product:products(name, main_image_url, brand, category_id)",
    )
    .eq("status", "activa")
    .gt("quantity_available", 0)
    .order("created_at", { ascending: false })
    .returns<RawListing[]>();

  // Query 2: seller_profiles para los seller_ids de los listings.
  const sellerIds = [...new Set((rawListings ?? []).map((l) => l.seller_id))];
  const { data: sellers } =
    sellerIds.length > 0
      ? await supabase
          .from("seller_profiles")
          .select("user_id, display_name, slug, rating_avg, total_sales")
          .in("user_id", sellerIds)
          .returns<SellerInfo[]>()
      : { data: [] as SellerInfo[] };

  const sellerMap = Object.fromEntries(
    (sellers ?? []).map((s) => [s.user_id, s]),
  );

  const allListings: ListingRow[] = (rawListings ?? []).map((l) => ({
    ...l,
    seller: sellerMap[l.seller_id] ?? null,
  }));

  // ─── Resolver categoría seleccionada ─────────────────────────────────────
  // Si viene ?cat=indumentaria, buscamos:
  //   1. La categoría raíz con ese slug
  //   2. Todas sus subcategorías descendientes (recursivo en memoria)
  // Después filtramos los listings cuyo product.category_id esté en ese set.
  let categoryName: string | null = null;
  let allowedCategoryIds: Set<string> | null = null;

  if (cat.trim()) {
    const { data: allCats } = await supabase
      .from("categories")
      .select("id, slug, name, parent_id")
      .eq("active", true)
      .returns<
        { id: string; slug: string; name: string; parent_id: string | null }[]
      >();

    const cats = allCats ?? [];
    const root = cats.find((c) => c.slug === cat.trim());

    if (root) {
      categoryName = root.name;
      // BFS para juntar root + todos sus descendientes
      const ids = new Set<string>([root.id]);
      const queue = [root.id];
      while (queue.length > 0) {
        const parentId = queue.shift()!;
        for (const child of cats) {
          if (child.parent_id === parentId && !ids.has(child.id)) {
            ids.add(child.id);
            queue.push(child.id);
          }
        }
      }
      allowedCategoryIds = ids;
    }
  }

  // ─── Filtrado en memoria por q y cat ─────────────────────────────────────
  let filtered = allListings;

  if (allowedCategoryIds) {
    filtered = filtered.filter((l) => {
      const product = Array.isArray(l.product) ? l.product[0] : l.product;
      const catId = product?.category_id;
      return catId ? allowedCategoryIds!.has(catId) : false;
    });
  }

  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter((l) => {
      const product = Array.isArray(l.product) ? l.product[0] : l.product;
      return (
        product?.name?.toLowerCase().includes(needle) ||
        product?.brand?.toLowerCase().includes(needle) ||
        l.description?.toLowerCase().includes(needle)
      );
    });
  }

  // Productos destacados y más vendidos para la homepage.
  const featured = allListings.slice(0, 4);
  const bestSellers = [...allListings]
    .sort((a, b) => (b.seller?.rating_avg ?? 0) - (a.seller?.rating_avg ?? 0))
    .slice(0, 4);

  // Helper para mapear un listing del query a la forma que espera ListingCard.
  // El componente ListingCard es Client (necesita state para el modal de carrito)
  // así que recibe datos serializables planos en lugar del row crudo.
  function toCardData(l: ListingRow) {
    const product = Array.isArray(l.product) ? l.product[0] : l.product;
    return {
      id: l.id,
      // Fix de mojibake en strings que vienen de DB (Electrónica, Cámara, etc.)
      productName: fixMojibake(product?.name ?? "Producto"),
      productImage: product?.main_image_url ?? null,
      brand: product?.brand ? fixMojibake(product.brand) : null,
      priceCentsUsd: l.price_cents_usd,
      quantityAvailable: l.quantity_available,
      seller: l.seller
        ? {
            displayName: fixMojibake(l.seller.display_name),
            ratingAvg: l.seller.rating_avg,
          }
        : null,
    };
  }

  return (
    <>
      {/* ════════ HERO CAROUSEL ════════
          3 slides panorámicos (2048x768) que rotan automáticamente cada 5s.
          ES el hero principal de la pantalla — va PRIMERO, antes que cualquier
          otro texto. */}
      <HeroCarousel slides={HERO_SLIDES} />


      {/* ════════ SECCIONES PREMIUM (cuando NO está buscando) ════════
          Estructura ML-style para una home de marketplace premium con
          identidad Mercado Nuestro. El usuario llena los AdSlots con
          imágenes reales después. */}
      {!isSearching && (
        // Wrapper bg-neutral-gray-50 para que el degradado del HeroCarousel
        // (que termina en ese mismo color) se funda sin costuras, y la
        // ServiceStrip que se solapa con el hero tenga el bg correcto detrás.
        <div className="bg-neutral-gray-50">
          {/* Servicios destacados (envío, pago, garantía, devolución, retiro) */}
          <ServiceStrip />

          {/* Banner promocional #1 — primer impacto después del hero */}
          <section className="bg-neutral-gray-50 pb-8 sm:pb-10">
            <AppContainer>
              <AdSlot
                size="xl"
                image="/banners/banner1.png"
                mobileImage="/banners/banner1celular.png"
                alt="Promoción Mercado Nuestro"
                href="/app/marketplace?q=."
              />
            </AppContainer>
          </section>

          {/* Split 50/50: Campañas activas + Destacados Mercado Nuestro.
              Es el "elevator pitch" visual: las dos líneas de negocio
              principales en un solo bloque. Va ARRIBA de las ofertas del día. */}
          <CampaignsAndFeaturedSplit
            campaigns={MOCK_SPLIT_CAMPAIGNS}
            featured={MOCK_SPLIT_FEATURED}
          />

          {/* Ofertas del día con timer */}
          <FlashDeals items={MOCK_FLASH_DEALS} />

          {/* Categorías destacadas (4 tarjetas grandes con foto) */}
          <CategoryHighlights />

          {/* Banner promocional #2 — entre Categorías destacadas y el resto */}
          <section className="bg-white pb-8 sm:pb-12">
            <AppContainer>
              <AdSlot
                size="xl"
                image="/banners/banner2.png"
                mobileImage="/banners/banner2celular.png"
                alt="Promoción Mercado Nuestro"
                href="/app/campanas"
              />
            </AppContainer>
          </section>
        </div>
      )}

      {/* ════════ CONTENIDO PRINCIPAL ════════ */}
      <div className="min-h-screen bg-neutral-gray-50">
        {isSearching ? (
          /* ──────── VISTA DE BÚSQUEDA / FILTRO ──────── */
          <AppContainer className="py-6">
            {/* Breadcrumb */}
            <nav
              aria-label="Ubicación"
              className="mb-4 flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-blue hover:underline">
                Inicio
              </Link>
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <Link
                href="/app/marketplace"
                className="hover:text-blue hover:underline"
              >
                Mercado Nuestro
              </Link>
              {categoryName && (
                <>
                  <ChevronRight className="size-3 shrink-0" aria-hidden />
                  <span className="font-medium text-foreground">
                    {fixMojibake(categoryName)}
                  </span>
                </>
              )}
              {q && (
                <>
                  <ChevronRight className="size-3 shrink-0" aria-hidden />
                  <span className="font-medium text-foreground">
                    &quot;{q}&quot;
                  </span>
                </>
              )}
            </nav>

            {/* Encabezado de categoría — solo cuando estamos filtrando por
                cat= y no por texto libre. Muestra el nombre grande +
                cantidad de productos. */}
            {categoryName && !q.trim() && (
              <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                    {fixMojibake(categoryName)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {filtered.length === 0
                      ? "Todavía no hay productos en esta categoría"
                      : `${filtered.length} ${
                          filtered.length === 1 ? "producto" : "productos"
                        } disponibles`}
                  </p>
                </div>
              </header>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
                  <Search className="size-8 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-5 text-lg font-bold text-foreground">
                  {categoryName && !q.trim()
                    ? `Sin productos en ${fixMojibake(categoryName)} todavía`
                    : `Sin resultados para "${q}"`}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {categoryName && !q.trim()
                    ? "Cuando un importador publique algo de esta categoría, va a aparecer acá."
                    : "Probá con otro término o explorá todas las publicaciones."}
                </p>
                <Link
                  href="/app/marketplace"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-blue px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  Ver toda la tienda
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                {/* Sidebar de filtros */}
                <aside className="hidden lg:block">
                  <div className="sticky top-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Filtrar por
                    </h2>
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Precio
                      </p>
                      <div className="mt-3 space-y-1.5">
                        {[
                          "Hasta USD 50",
                          "USD 50 – 100",
                          "USD 100 – 200",
                          "Más de USD 200",
                        ].map((r) => (
                          <label
                            key={r}
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                          >
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-border" />
                            {r}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Estado
                      </p>
                      <div className="mt-3 space-y-1.5">
                        {["Nuevo", "Usado – como nuevo", "Usado"].map((s) => (
                          <label
                            key={s}
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                          >
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-border" />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl bg-blue/8 p-4">
                      <p className="text-xs font-bold text-blue">
                        ¿Querés vender?
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Publicá lo que importaste en minutos.
                      </p>
                      <Link
                        href="/perfil/revendedor"
                        className="mt-3 block rounded-lg bg-blue px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-navy"
                      >
                        Publicar ahora
                      </Link>
                    </div>
                  </div>
                </aside>

                {/* Resultados */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {filtered.length}
                      </span>{" "}
                      {filtered.length === 1 ? "publicación" : "publicaciones"}
                    </p>
                    <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue/30">
                      <option>Más reciente</option>
                      <option>Menor precio</option>
                      <option>Mayor precio</option>
                      <option>Mejor reputación</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {filtered.map((l) => (
                      <ListingCard key={l.id} listing={toCardData(l)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AppContainer>
        ) : (
          /* ──────── HOMEPAGE ESTILO BAZAR ──────── */
          <div className="space-y-6 py-6">
            {/* ── 1. Promo tiles ── */}
            <AppContainer>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PROMO_TILES.map((tile) => (
                  <Link
                    key={tile.id}
                    href={tile.href}
                    className="group relative h-44 overflow-hidden rounded-2xl sm:h-52"
                  >
                    <Image
                      src={tile.image}
                      alt={tile.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${tile.overlay} via-transparent to-transparent`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                        {tile.cat}
                      </p>
                      <h3 className="mt-0.5 text-sm font-extrabold uppercase leading-tight text-white sm:text-base">
                        {tile.title}
                      </h3>
                      <span className="mt-1 inline-block text-xs font-semibold text-white/90 underline underline-offset-2">
                        {tile.cta} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </AppContainer>

            {/* ── 2. Productos destacados ── */}
            {featured.length > 0 && (
              <AppContainer>
                <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-foreground">
                      Productos destacados
                    </h2>
                    <Link
                      href="/app/marketplace?q=."
                      className="text-sm font-semibold text-blue hover:underline"
                    >
                      Ver todos
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {featured.map((l) => (
                      <ListingCard key={l.id} listing={toCardData(l)} compact />
                    ))}
                  </div>
                </div>
              </AppContainer>
            )}

            {/* ── 3. Más vendidos / mejor puntuados ── */}
            {bestSellers.length > 0 && (
              <AppContainer>
                <div
                  id="mas-vendidos"
                  className="scroll-mt-[180px] rounded-2xl bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-foreground">
                      Más vendidos
                    </h2>
                    <Link
                      href="/app/marketplace?q=."
                      className="text-sm font-semibold text-blue hover:underline"
                    >
                      Ver todos
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {bestSellers.map((l) => (
                      <ListingCard key={l.id} listing={toCardData(l)} compact />
                    ))}
                  </div>
                </div>
              </AppContainer>
            )}

            {/* ── 4. Categorías con fotos ── */}
            <AppContainer>
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-foreground">
                    Explorar por categoría
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {CATEGORY_GRID.map((c) => (
                    <Link
                      key={c.value}
                      href={`/app/marketplace?cat=${c.value}`}
                      className="group overflow-hidden rounded-xl border border-border transition-all hover:border-blue/40 hover:shadow-md"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-muted">
                        <Image
                          src={c.image}
                          alt={c.label}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="bg-white px-3 py-2.5 text-center">
                        <p className="text-xs font-bold text-foreground">
                          {c.label}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </AppContainer>

            {/* ── 5. CTA publicar ── */}
            <AppContainer>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue/20 bg-blue/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue">
                    <IconMN name="vendedor" variant="blanco" size={24} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      ¿Importaste y te sobró stock?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Publicá en Mercado Nuestro, nosotros nos encargamos del cobro.
                    </p>
                  </div>
                </div>
                <Link
                  href="/perfil/revendedor"
                  className="rounded-full bg-blue px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-navy"
                >
                  Publicar producto
                </Link>
              </div>
            </AppContainer>
          </div>
        )}
      </div>

      {/* ════════ SECCIONES PREMIUM FINALES (después del contenido principal,
                 cuando NO está buscando) ════════ */}
      {!isSearching && (
        <>
          {/* Grid de tiendas oficiales / marcas */}
          <BrandsMosaic />

          {/* Banner promocional #3 — cierre antes del footer */}
          <section className="bg-white py-12 sm:py-16">
            <AppContainer>
              <AdSlot
                size="xl"
                image="/banners/banner3.png"
                mobileImage="/banners/banner3celular.png"
                alt="Promoción Mercado Nuestro"
                href="/app/marketplace?q=."
              />
            </AppContainer>
          </section>
        </>
      )}
    </>
  );
}

