import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import {
  CampaignCard,
  type CampaignCardData,
} from "@/components/campanas/CampaignCard";
import {
  ActivityCard,
  type ActivityCardData,
} from "@/components/home/ActivityCard";
import { QuickStartForm } from "@/components/home/QuickStartForm";
import { Container } from "@/components/layout/Container";
import { BlobDivider } from "@/components/motion/BlobDivider";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { StackedCards } from "@/components/motion/StackedCards";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Accordion } from "@/components/ui/accordion";
import { IconMN } from "@/components/ui/IconMN";
import { StarRating } from "@/components/ui/star-rating";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FeaturedCampaignRow = {
  id: string;
  slug: string;
  title: string;
  hero_image_url: string | null;
  product:
    | { name: string; main_image_url: string | null }
    | { name: string; main_image_url: string | null }[]
    | null;
  pricing_tiers:
    | Database["public"]["Tables"]["campaign_pricing_tiers"]["Row"][]
    | null;
};

async function getFeaturedCampaigns(): Promise<CampaignCardData[]> {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, title, hero_image_url,
      product:products(name, main_image_url),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("status", "activa")
    .order("closes_at", { ascending: true })
    .limit(3)
    .returns<FeaturedCampaignRow[]>();

  if (!campaigns || campaigns.length === 0) return [];

  const ids = campaigns.map((c) => c.id);
  const { data: progress } = await supabase
    .from("campaign_progress_view")
    .select("*")
    .in("campaign_id", ids)
    .returns<
      Database["public"]["Views"]["campaign_progress_view"]["Row"][]
    >();
  const progressByCampaign = new Map(
    progress?.map((p) => [p.campaign_id, p]) ?? [],
  );

  return campaigns.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    hero_image_url: c.hero_image_url,
    product: Array.isArray(c.product) ? c.product[0] ?? null : c.product,
    pricing_tiers: c.pricing_tiers ?? [],
    progress: progressByCampaign.get(c.id) ?? null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Contenido estático del home — copy rioplatense.
// ─────────────────────────────────────────────────────────────────────────────

const activities: ActivityCardData[] = [
  {
    id: "campanas",
    badge: "Línea 01",
    title: "Importación grupal",
    requirements: "Reserva con seña del 30% · Saldo al cerrar la campaña",
    description:
      "Sumate con otros uruguayos a importar el mismo producto. Cuanto más cantidad reservamos entre todos, mejor es el precio para todos.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    details: [
      {
        id: "c-1",
        title: "Qué es una campaña",
        content:
          "Una ventana de tiempo donde reservás unidades del mismo producto. Al cerrar, todos pagan el precio del mejor escalón alcanzado.",
      },
      {
        id: "c-2",
        title: "Si no llegamos al objetivo",
        content:
          "Devolvemos la seña al método de pago original o, si elegís, queda como crédito en cuenta con 5% extra de bonificación.",
      },
    ],
    included: [
      "Precio escalonado retroactivo",
      "Seña reembolsable",
      "Soporte en español",
    ],
    excluded: ["Stock inmediato", "Entrega en menos de 30 días"],
    primaryCta: { label: "Ver campañas", href: "/campanas" },
    secondaryCta: { label: "Cómo funciona", href: "/como-funciona" },
    rightVariant: "blue",
  },
  {
    id: "disponible",
    badge: "Línea 02",
    title: "Stock disponible",
    requirements: "Entrega 2 a 5 días hábiles · Retiro gratis en Paysandú",
    description:
      "Productos que ya están en nuestro local de Paysandú o en depósito. Comprás y te llegan rapidísimo, como cualquier eCommerce.",
    image:
      "https://images.unsplash.com/photo-1556909211-d5b0bb0e6f6d?auto=format&fit=crop&w=1200&q=80",
    details: [
      {
        id: "d-1",
        title: "Cómo es la entrega",
        content:
          "Despacho a todo Uruguay en 2 a 5 días hábiles. Si vivís en Paysandú, retiro gratis en Leandro Gómez 1076.",
      },
      {
        id: "d-2",
        title: "Métodos de pago",
        content:
          "Mercado Pago, transferencia, Abitab, Redpagos o crédito en cuenta. Sin recargos por elegir uno u otro.",
      },
    ],
    included: ["Garantía local 6 meses", "Cambios sin cargo", "Factura"],
    excluded: ["Precios de campaña"],
    primaryCta: { label: "Ver stock", href: "/disponible" },
    secondaryCta: { label: "Garantía", href: "/devoluciones" },
    rightVariant: "navy",
  },
  {
    id: "marketplace",
    badge: "Línea 03",
    title: "Marketplace de reventa",
    requirements: "Pago protegido · Vendedores verificados",
    description:
      "Quien importó publica el sobrante con precios competitivos. El dinero queda retenido hasta que confirmás que recibiste.",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80",
    details: [
      {
        id: "m-1",
        title: "Cómo funciona el escrow",
        content:
          "Pagás a Mercado Nuestro, no al vendedor. Liberamos cuando confirmás recepción o pasados 3 días desde el despacho sin reclamo.",
      },
      {
        id: "m-2",
        title: "Si algo sale mal",
        content:
          "Abrís un reclamo dentro de los 7 días. Lo resolvemos en 5 días hábiles, con derecho a apelación.",
      },
    ],
    included: ["Pago protegido (escrow)", "Reseñas reales", "Chat interno"],
    excluded: ["Pago directo al vendedor", "Trato por fuera"],
    primaryCta: { label: "Ver marketplace", href: "/marketplace" },
    secondaryCta: { label: "Vender", href: "/perfil/revendedor" },
    rightVariant: "blue-light",
  },
  {
    id: "vendedores",
    badge: "Línea 04",
    title: "Vendedores por catálogo",
    requirements: "Sin stock propio · Pago mensual de comisiones",
    description:
      "Compartís tu link personal. Cada persona que compra por tu link te genera comisión. Bonus escalonados según volumen mensual.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    details: [
      {
        id: "v-1",
        title: "Cuánto puedo ganar",
        content:
          "Comisión base + bonus por volumen: +2% sobre USD 500, +3% sobre USD 1500, +5% sobre USD 3000.",
      },
      {
        id: "v-2",
        title: "Cuándo me pagan",
        content:
          "Primeros 5 días hábiles de cada mes, mínimo USD 20 acumulados. Por transferencia.",
      },
    ],
    included: ["Link personal", "Dashboard de ventas", "Pago mensual"],
    excluded: ["Stock propio", "Trámites con cliente final"],
    primaryCta: { label: "Activar mi catálogo", href: "/perfil/vendedor" },
    secondaryCta: { label: "Más info", href: "/perfil/vendedor" },
    rightVariant: "yellow",
  },
];

// Bloques grandes con foto — estilo "PARA CELEBRAR JUNTOS" del FUN Parque.
// Importadores avanzados se separa como bloque chico debajo (es B2B-pro,
// no encaja con la lógica de compra B2B genérica de las primeras dos).
const groupHighlights = [
  {
    title: "Empresas",
    description:
      "Pedidos al por mayor con facturación. RUT, logística dedicada y precios a medida.",
    href: "/contacto",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Instituciones",
    description:
      "Clubes, sindicatos o cooperativas que quieran usar Mercado Nuestro como canal de compras grupales.",
    href: "/contacto",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
  },
];

const testimonials = [
  {
    author: "Carolina, Paysandú",
    role: "Compradora en 3 campañas",
    rating: 5,
    body: "Conseguí una cámara IP a la mitad de precio que la veía en cualquier comercio. La seña fue facilísima y me llegó cuando dijeron. Recomendado al 100%.",
  },
  {
    author: "Diego, Montevideo",
    role: "Revendedor",
    rating: 5,
    body: "Importé 20 unidades y vendí lo que me sobró por el marketplace. El sistema de escrow me dio mucha tranquilidad. Recibí el dinero sin pelearme con nadie.",
  },
  {
    author: "Susana, Salto",
    role: "Vendedora por catálogo",
    rating: 4.5,
    body: "Le comparto el link a mi familia y a vecinos por WhatsApp. En el primer mes ya cobré comisiones para los primeros mates del fin de semana.",
  },
];

const faqTabs = [
  {
    id: "general",
    label: "General",
    items: [
      {
        id: "g1",
        title: "¿Mercado Nuestro es seguro?",
        content:
          "Sí. Operamos desde Uruguay, con local físico en Paysandú. Los pagos pasan por Mercado Pago y el dinero del marketplace queda retenido hasta que confirmás recepción.",
      },
      {
        id: "g2",
        title: "¿Necesito cuenta para mirar?",
        content:
          "No. Podés ver todas las campañas activas, productos disponibles y catálogos de vendedores sin registrarte. Solo necesitás cuenta para reservar o comprar.",
      },
      {
        id: "g3",
        title: "¿Trabajan en todo Uruguay?",
        content:
          "Sí. Despachamos a Montevideo, Paysandú, Salto, Maldonado, Canelones y resto del país. Si vivís cerca de Paysandú, podés retirar gratis en el local.",
      },
    ],
  },
  {
    id: "campanas",
    label: "Campañas",
    items: [
      {
        id: "c1",
        title: "¿Qué pasa si la campaña no llega al MOQ?",
        content:
          "Te devolvemos la seña al método de pago original (hasta 7 días hábiles) o, si preferís, la dejás como crédito en cuenta con un 5% extra de bonificación.",
      },
      {
        id: "c2",
        title: "¿Puedo cancelar mi reserva?",
        content:
          "Sí, hasta 72 horas antes del cierre de la campaña. Después de ese plazo solo se cancela si hay un problema real con el pedido.",
      },
      {
        id: "c3",
        title: "¿Cuánto tarda en llegar el producto?",
        content:
          "Depende de cada campaña pero típicamente entre 45 y 75 días desde el cierre. En el detalle vas a ver la fecha estimada de llegada.",
      },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      {
        id: "m1",
        title: "¿Quién paga el envío?",
        content:
          "El comprador, al momento de pagar. El revendedor coordina la logística con su empresa de envíos o con la nuestra.",
      },
      {
        id: "m2",
        title: "¿Cuándo recibe el dinero el revendedor?",
        content:
          "Cuando vos confirmás que recibiste el producto, o pasados 3 días desde el despacho si no abrís reclamo. Modelo de escrow tradicional.",
      },
      {
        id: "m3",
        title: "¿Puedo reclamar?",
        content:
          "Sí, dentro de los 7 días corridos desde la entrega. Adjuntás fotos del producto y embalaje. Lo resolvemos en 5 días hábiles.",
      },
    ],
  },
  {
    id: "vendedores",
    label: "Vendedores",
    items: [
      {
        id: "v1",
        title: "¿Cómo me hago vendedor por catálogo?",
        content:
          "Te registrás, vas a Mi cuenta → Programa de vendedores, elegís tu URL y subís foto de perfil. En el MVP la aprobación es automática.",
      },
      {
        id: "v2",
        title: "¿Necesito stock propio?",
        content:
          "No. Compartís el link de Mercado Nuestro y ganás comisión por cada venta que se atribuya. Nosotros nos encargamos del despacho.",
      },
      {
        id: "v3",
        title: "¿Cómo cobro?",
        content:
          "Mínimo de USD 20 acumulados. Pagamos por transferencia los primeros 5 días hábiles de cada mes.",
      },
    ],
  },
];

export const revalidate = 60;

export default async function HomePage() {
  const featuredCampaigns = await getFeaturedCampaigns();

  return (
    <>
      {/* ====================== HERO FULL-VIEWPORT ======================
          Estructura FUN Parque adaptada:
          - Imagen aérea full-bleed (sin overlay pesado, leve para legibilidad)
          - Headline centrado, segunda línea casi entera en lime
          - SIN párrafo descriptivo — directo a los CTAs
          - PRECIOS (navy fill) + RESERVAR (cream outline)
          - Franja diagonal tricolor arriba del marquee
          - Marquee naranja contenedor scrolleando abajo
      ============================================================== */}
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-navy text-navy-foreground">
        {/* Imagen de fondo full-bleed */}
        <Image
          src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=2400&q=80"
          alt="Contenedores y cajas de importación llegando al puerto"
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover"
          priority
        />
        {/* Overlay sutil para legibilidad — más liviano que antes (FUN Parque
            casi no usa overlay, deja la foto pura). */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/40 via-navy/25 to-navy/55"
        />

        {/* Contenido del hero — flex centrado vertical y horizontalmente */}
        <div className="flex min-h-[92vh] w-full flex-col items-center justify-center px-6 pt-24 pb-24 sm:px-10 sm:pt-28">
          <Reveal delay={0.15} className="w-full text-center">
            <h1 className="mx-auto max-w-[1500px] font-extrabold uppercase leading-[0.9] tracking-tight text-white text-[clamp(2.5rem,7.5vw,7.5rem)]">
              <span className="block">Importá en grupo</span>
              <span className="block text-yellow">a precio mayorista</span>
            </h1>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/como-funciona"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-white bg-transparent px-8 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-blue"
              >
                Cómo funciona
              </Link>
              <Link
                href="/campanas"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-yellow px-8 text-sm font-bold uppercase tracking-wider text-yellow-foreground transition-transform hover:-translate-y-0.5 shadow-glow"
              >
                Ver campañas
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Faja diagonal tricolor — azul + amarillo + navy. */}
        <div
          aria-hidden
          className="relative z-10 h-3 w-full"
          style={{
            background:
              "linear-gradient(105deg, var(--blue) 0 33.33%, var(--yellow) 33.33% 66.66%, var(--navy) 66.66% 100%)",
          }}
        />

        {/* Marquee azul de marca, transición hacia el resto del home. */}
        <div className="relative z-10 overflow-hidden bg-blue py-3.5 text-blue-foreground">
          <div className="flex whitespace-nowrap animate-marquee">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex shrink-0 items-center gap-12 pr-12">
                {[
                  "Próxima campaña abre el 25 de mayo",
                  "★",
                  "Hasta 60% menos que precio de tienda",
                  "★",
                  "Retiro gratis en Paysandú",
                  "★",
                  "Pago seguro con Mercado Pago",
                  "★",
                  "Envío a todo Uruguay",
                  "★",
                ].map((item, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className="text-sm font-extrabold uppercase tracking-wider"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== QUIÉNES SOMOS — 3 bloques color-block ======
          Paleta oficial Mercado Nuestro:
          - LEFT: bloque BLUE (azul de marca) con pattern topográfico,
            badge yellow, icon, texto descriptivo y stats
          - RIGHT TOP: bloque NAVY (azul oscuro) con headline gigante blanco
            + palabra highlight con underline amarillo
          - RIGHT BOTTOM: foto rectangular con sticker yellow rotado */}
      <section id="sobre" className="relative isolate overflow-hidden bg-background">
        <Container className="py-20 sm:py-28">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* LEFT — bloque azul de marca con pattern topo + texto */}
            <Reveal className="lg:col-span-1">
              <div className="relative flex h-full flex-col gap-8 overflow-hidden rounded-[2rem] bg-blue p-8 text-blue-foreground bg-topo sm:p-12 lg:p-14 lg:min-h-[640px]">
                <span className="inline-flex w-fit items-center rounded-full bg-yellow px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-yellow-foreground">
                  Quiénes somos
                </span>

                <IconMN name="ubicacion" variant="blanco" size={44} alt="" />

                <div className="space-y-5 text-base leading-relaxed sm:text-lg">
                  <p>
                    Nacimos en Paysandú con la idea de que el acceso a precios
                    de importación al por mayor no debería ser un privilegio
                    de las grandes empresas. Funcionamos juntando demanda
                    real: cada vez que abrimos una campaña, los usuarios
                    reservan unidades con seña y, al cruzar el MOQ, todos
                    pagan el mejor precio.
                  </p>
                  <p>
                    Operamos desde Leandro Gómez 1076 con soporte en español,
                    métodos de pago locales y entrega a todo Uruguay. Sumamos
                    un marketplace de reventa entre vecinos y un programa de
                    vendedores por catálogo para multiplicar nuestra red.
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-3 pt-4">
                  {[
                    { value: "Hasta 60%", label: "menos que tienda" },
                    { value: "30%", label: "seña al reservar" },
                    { value: "+200", label: "compradores" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/15 px-3 py-4 backdrop-blur-sm">
                      <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-white/75">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* RIGHT — stacked: bloque navy con headline + foto debajo */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* RIGHT TOP — bloque navy con headline gigante. Sobre fondo
                  azul el highlight va en AMARILLO (text-yellow)
                  porque el azul-sobre-azul no contrasta. Bajamos el clamp
                  max para que la frase entre completa. */}
              <Reveal delay={0.1}>
                <div className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-navy-foreground bg-topo sm:p-12 lg:p-14">
                  <h2 className="font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(1.75rem,3.2vw,2.75rem)]">
                    La primera plataforma uruguaya de{" "}
                    <span className="text-yellow">
                      compra colaborativa
                    </span>
                  </h2>
                </div>
              </Reveal>

              {/* RIGHT BOTTOM — foto rectangular con sticker rotado */}
              <Reveal delay={0.2} className="flex-1">
                <div className="relative h-full min-h-[280px] overflow-hidden rounded-[2rem] sm:min-h-[360px]">
                  <Image
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80"
                    alt="Mercado uruguayo"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute -right-3 -top-3 rotate-12 rounded-full bg-yellow px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-yellow-foreground shadow-glow">
                    Made in Uruguay 🇺🇾
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ====================== LÍNEAS (StackedCards) ======================
          Fondo cream cálido para que los color-blocks de las cards
          (gold/blue/lime rotando) resalten. Las cards anteriores se ven
          asomar al apilarse — como en el FUN Parque.

          IMPORTANTE: overflow-visible en el section para que `sticky`
          funcione (overflow-hidden en cualquier ancestro rompe sticky).
          El blob decoration vive en un wrapper con overflow-hidden interno
          que NO contiene los stacked cards. */}
      <section
        id="lineas"
        className="relative bg-background text-foreground"
      >
        {/* Wrapper de blob decorativo — fuera del flujo de los stacked cards */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] overflow-hidden"
        >
          <BlobDivider
            variant="top-right"
            shape={2}
            className="fill-blue/15"
          />
        </div>

        <div className="relative z-10">
          <Container className="pt-24 pb-16 sm:pt-32 sm:pb-20">
            <Reveal className="mx-auto max-w-6xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                  Líneas
                </span>
              </p>
              <h2 className="mt-6 font-extrabold uppercase leading-[0.92] tracking-tight text-foreground text-[clamp(2rem,7vw,6.5rem)]">
                Sumate a nuestras{" "}
                <span className="text-highlight">cuatro líneas</span> de negocio
              </h2>
            </Reveal>
          </Container>

          {/* Stack de cards full width sobre cream */}
          <div className="px-4 pb-40 sm:px-8 sm:pb-48">
            <StackedCards spacing="40vh">
              {activities.map((activity) => (
                <div
                  id={activity.id}
                  key={activity.id}
                  className="scroll-mt-24"
                >
                  <ActivityCard data={activity} />
                </div>
              ))}
            </StackedCards>
          </div>
        </div>
      </section>

      {/* Marquee transición — azul + franja tricolor. */}
      <div
        aria-hidden
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(105deg, var(--primary) 0 33.33%, var(--blue) 33.33% 66.66%, var(--gold) 66.66% 100%)",
        }}
      />
      <Marquee
        items={[
          "Próxima campaña abre el 25 de mayo",
          "Hasta 60% menos que tienda",
          "Retiro gratis en Paysandú",
          "Pago seguro Mercado Pago",
          "Envío a todo Uruguay",
        ]}
        duration={45}
        background="bg-blue"
        textColor="text-blue-foreground"
      />

      {/* ====================== CAMPAÑAS EN CURSO ======================
          Headline gigante uppercase + grid de cards + flecha gigante de
          "Ver todas" estilo FUN Parque. Fondo cream. */}
      <section className="bg-background py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                Activas ahora
              </span>
            </p>
            <h2 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2rem,5vw,4.5rem)]">
              Campañas <span className="text-highlight">en curso</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Reservá con seña, esperá el cierre y pagá el mejor precio
              alcanzado. Todo con soporte local.
            </p>
          </Reveal>

          {featuredCampaigns.length === 0 ? (
            <Reveal delay={0.1} className="mt-16">
              <div className="rounded-3xl border border-dashed border-border bg-cream p-16 text-center">
                <p className="text-xl font-extrabold uppercase tracking-tight">
                  Estamos preparando las primeras campañas
                </p>
                <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                  Muy pronto vas a poder reservar acá. Mientras tanto, podés
                  leer{" "}
                  <Link
                    href="/como-funciona"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    cómo funciona el sistema
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCampaigns.map((campaign) => (
                  <StaggerItem key={campaign.id}>
                    <CampaignCard campaign={campaign} />
                  </StaggerItem>
                ))}
              </Stagger>

              {/* Big arrow link — "Ver todas" como CTA grande */}
              <Reveal delay={0.2} className="mt-16 flex justify-center">
                <Link
                  href="/campanas"
                  className="group inline-flex items-center gap-3 rounded-full bg-navy px-8 py-4 text-base font-bold uppercase tracking-wider text-navy-foreground transition-transform hover:-translate-y-0.5"
                >
                  Ver todas las campañas
                  <ArrowUpRight
                    className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden
                  />
                </Link>
              </Reveal>
            </>
          )}
        </Container>
      </section>

      {/* ====================== TESTIMONIOS ======================
          Fondo navy oscuro estilo "O FEEDBACK NO TRIPADVISOR".
          Splash lime decorativo alrededor del título + cards con border
          dashed sobre el navy. */}
      <section
        id="testimonios"
        className="relative isolate overflow-hidden bg-navy py-24 text-navy-foreground sm:py-32"
      >
        {/* Splash decorativo lime alrededor del título — efecto orgánico */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-12 -z-10 size-[420px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[20%] top-32 -z-10 size-[180px] rounded-full bg-primary/30 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[18%] top-20 -z-10 size-[220px] rounded-full bg-primary/20 blur-2xl"
        />

        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              <span className="rounded-full bg-gold px-3 py-1 text-gold-foreground">
                Testimonios
              </span>
            </p>
            <h2 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-cream text-[clamp(2rem,5.5vw,5rem)]">
              Lo que dicen <span className="text-yellow">los nuestros</span>
            </h2>
          </Reveal>

          <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <figure className="flex h-full flex-col gap-5 rounded-3xl border border-dashed border-cream/25 bg-navy/40 p-7 backdrop-blur-sm">
                  <StarRating value={t.rating} size="size-4" />
                  <blockquote className="text-base leading-relaxed text-cream">
                    “{t.body}”
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 border-t border-cream/15 pt-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow text-yellow-foreground text-sm font-extrabold">
                      {t.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-cream">
                        {t.author}
                      </p>
                      {t.role ? (
                        <p className="text-xs text-cream/65">{t.role}</p>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ====================== FAQs ======================
          Bloque gold/mostaza full-bleed estilo "PRONTO PARA AS SOAS DÚVIDAS"
          del FUN Parque: foto a la izquierda + acordeón a la derecha. Sin
          tabs — un solo accordion lineal. */}
      <section id="faqs" className="relative isolate overflow-hidden bg-gold text-gold-foreground">
        <Container className="py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {/* LEFT — badge + headline + foto */}
            <Reveal className="flex flex-col gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="rounded-full bg-navy px-3 py-1 text-navy-foreground">
                    Preguntas frecuentes
                  </span>
                </p>
                {/* Sobre fondo amarillo (bg-gold), la palabra clave va en
                    azul navy directo — el subrayado amarillo de
                    .text-highlight se camuflaría con el fondo. */}
                <h2 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2rem,4.5vw,4rem)]">
                  ¿Te queda alguna <span className="text-navy">duda</span>?
                </h2>
              </div>

              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-navy/20 shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=900&q=80"
                  alt="Local Mercado Nuestro Paysandú"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            {/* RIGHT — accordion plano (las preguntas de los 4 grupos en uno) */}
            <Reveal delay={0.15}>
              <Accordion
                items={faqTabs.flatMap((t) =>
                  t.items.map((it) => ({
                    id: `${t.id}-${it.id}`,
                    title: it.title,
                    content: it.content,
                  })),
                )}
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ====================== PARA GRUPOS ======================
          2 cards foto grandes (Empresas + Instituciones) estilo
          "PARA CELEBRAR JUNTOS" + bloque chiquito de Importadores avanzados
          como CTA separado. */}
      <section id="grupos" className="bg-background py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                Compras en grupo
              </span>
            </p>
            <h2 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2rem,5vw,4.5rem)]">
              Para empresas e <span className="text-highlight">instituciones</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Comprás un volumen mayor o representás a un grupo. Tenemos
              modalidades a medida.
            </p>
          </Reveal>

          {/* 2 cards foto lado a lado */}
          <Stagger className="mt-16 grid gap-6 lg:grid-cols-2">
            {groupHighlights.map((g) => (
              <StaggerItem key={g.title}>
                <Link
                  href={g.href}
                  className="group relative block aspect-[5/4] overflow-hidden rounded-[2rem]"
                >
                  <Image
                    src={g.image}
                    alt={g.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  {/* Overlay para legibilidad */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent"
                  />
                  {/* Texto abajo-izquierda */}
                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                    <h3 className="text-3xl font-extrabold uppercase tracking-tight text-cream sm:text-4xl">
                      {g.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/85 sm:text-base">
                      {g.description}
                    </p>
                    <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-cream">
                      Hablemos
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Bloque chico: Importadores avanzados */}
          <Reveal delay={0.25} className="mt-8">
            <Link
              href="/ser-importador"
              className="hover-lift group block overflow-hidden rounded-3xl border border-border bg-cream p-8 transition-colors hover:border-primary/50 sm:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-navy">
                    <IconMN name="vendedor" variant="blanco" size={32} alt="" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Para profesionales
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
                      Importadores avanzados
                    </h3>
                  </div>
                </div>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  ¿Ya importás y querés abrir tus propias campañas en la
                  plataforma? Postulate al programa y liderá tu propia
                  importación.
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-navy-foreground transition-transform group-hover:-translate-y-0.5">
                  Postularme
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* ====================== CTA RESERVAR ======================
          Bloque navy full-bleed con headline gigante a la izquierda +
          form sobre cream a la derecha. Es el cierre del home. */}
      <section
        id="reservar"
        className="relative isolate overflow-hidden bg-navy text-navy-foreground"
      >
        {/* Splash decorativo lime */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 -z-10 size-[420px] rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 -z-10 size-[280px] rounded-full bg-gold/20 blur-3xl"
        />

        <Container className="py-24 sm:py-32">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                <span className="rounded-full bg-yellow px-3 py-1 text-yellow-foreground">
                  Empezar
                </span>
              </p>
              <h2 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-white text-[clamp(2rem,5.5vw,5rem)]">
                Sumate a la <span className="text-yellow">primera campaña</span>
              </h2>
              <p className="mt-5 text-base text-cream/80 sm:text-lg">
                Crear cuenta es gratis, lleva menos de un minuto y no te
                compromete a nada. Mirá todo antes de reservar.
              </p>

              <div className="mt-10 space-y-4 text-sm text-white/90">
                {[
                  { icon: "ubicacion", label: "Leandro Gómez 1076, Paysandú" },
                  { icon: "tienda", label: "Lun-Vie 9:00-18:00 · Sáb 9:00-13:00" },
                  { icon: "soporte", label: "hola@mercadonuestro.uy" },
                  { icon: "seguridad", label: "Pago seguro vía Mercado Pago" },
                ].map((line) => (
                  <div key={line.label} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                      <IconMN
                        name={line.icon as "ubicacion" | "tienda" | "soporte" | "seguridad"}
                        variant="blanco"
                        size={22}
                        alt=""
                      />
                    </div>
                    {line.label}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <QuickStartForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
