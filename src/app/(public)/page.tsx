import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  ShoppingBasket,
  Users,
} from "lucide-react";

import {
  CampaignCard,
  type CampaignCardData,
} from "@/components/campanas/CampaignCard";
import {
  ActivityCard,
  type ActivityCardData,
} from "@/components/home/ActivityCard";
import { PricingTabs } from "@/components/home/PricingTabs";
import { QuickStartForm } from "@/components/home/QuickStartForm";
import { TestimonialCard } from "@/components/home/TestimonialCard";
import { Container } from "@/components/layout/Container";
import { BlobDivider } from "@/components/motion/BlobDivider";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { StackedCards } from "@/components/motion/StackedCards";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Accordion } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
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
  },
];

const events = [
  {
    icon: Building2,
    title: "Empresas",
    description:
      "Pedidos al por mayor con facturación. RUT, logística dedicada y precios a medida.",
    href: "/contacto",
  },
  {
    icon: GraduationCap,
    title: "Instituciones",
    description:
      "Clubes, sindicatos o cooperativas que quieran usar Mercado Nuestro como canal de compras grupales.",
    href: "/contacto",
  },
  {
    icon: Users,
    title: "Importadores avanzados",
    description:
      "¿Ya importás y querés abrir tus propias campañas en la plataforma? Postulate al programa.",
    href: "/ser-importador",
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
          Imitando funparquesaojoao.pt:
          - Imagen oscura full-screen como fondo
          - Headline gigante blanco encima, ultimas palabras en lime green
          - Dos CTAs centrados (Precios dark / Reservar outline blanco)
          - Marquee de notice corriendo abajo
          - Card flotante "Operación 2026" abajo-derecha
      ============================================================== */}
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-foreground text-white">
        {/* Imagen de fondo full-bleed */}
        <Image
          src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=2400&q=80"
          alt="Contenedores y cajas de importación llegando al puerto"
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover"
          priority
        />
        {/* Overlay para legibilidad */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-foreground/55 via-foreground/40 to-foreground/65"
        />

        <Container className="flex min-h-[92vh] flex-col justify-between pt-10 pb-12 sm:pt-14 sm:pb-16">
          {/* Headline central gigante */}
          <Reveal
            delay={0.15}
            className="mx-auto mt-24 max-w-6xl text-center sm:mt-32"
          >
            <h1 className="font-extrabold uppercase leading-[0.92] tracking-tight text-white text-[2.75rem] sm:text-[5rem] lg:text-[7rem]">
              Importá en grupo,
              <br />
              pagá{" "}
              <span className="text-primary">precio mayorista</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Sumate a campañas de importación con otros uruguayos y conseguí
              productos al precio que paga un importador grande.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="#precios"
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5",
                )}
              >
                Precios
              </Link>
              <Link
                href="#reservar"
                className={cn(
                  "inline-flex h-12 items-center gap-2 rounded-full border-2 border-white bg-transparent px-7 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-foreground",
                )}
              >
                Reservar
              </Link>
            </div>
          </Reveal>

          {/* Card flotante "Operación 2026" — esquina inferior derecha,
              estilo "Horario 2026" del FUN Parque */}
          <Reveal delay={0.3} className="ml-auto max-w-md">
            <div className="grid gap-4 rounded-3xl bg-white/95 p-5 text-foreground shadow-soft backdrop-blur sm:grid-cols-[auto_1fr_1fr] sm:gap-6 sm:p-7">
              <div className="flex items-center justify-center sm:justify-start">
                <p className="font-extrabold uppercase leading-none tracking-tight text-foreground sm:text-2xl">
                  Operación
                  <br />
                  <span className="text-3xl sm:text-4xl">2026</span>
                </p>
              </div>
              <div className="border-l-0 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
                  <span className="rounded-full bg-primary px-2.5 py-1">
                    Campañas
                  </span>
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-bold">Todos los días</span>
                  <br />
                  <span className="text-muted-foreground">
                    Reservás online 24/7
                  </span>
                </p>
              </div>
              <div className="border-l-0 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <p className="text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
                  <span className="rounded-full bg-accent px-2.5 py-1">
                    Local
                  </span>
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-bold">Lun-Vie 9-18 · Sáb 9-13</span>
                  <br />
                  <span className="text-muted-foreground">
                    Paysandú, Uruguay
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </Container>

        {/* Marquee scrolling abajo del hero — estilo "Encerrado" del FUN Parque */}
        <div className="relative z-10 overflow-hidden border-y-2 border-primary bg-primary py-3 text-foreground">
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

      {/* ====================== HORARIO / OPERACIÓN ====================== */}
      <section className="hidden border-y border-border bg-secondary/40">
        <Container className="py-6">
          <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
              <Calendar className="size-4 text-primary" aria-hidden />
              Operación 2026
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">Verano</span> (oct-mar) ·
                Campañas abiertas todos los días
              </p>
              <p>
                <span className="font-semibold">Local físico</span> ·
                Lun-Vie 9:00-18:00 · Sáb 9:00-13:00
              </p>
            </div>
            <Link
              href="/contacto"
              className="text-sm font-semibold text-primary-foreground/90 underline-offset-4 hover:underline"
            >
              Cómo llegar →
            </Link>
          </div>
        </Container>
      </section>

      {/* ====================== SOBRE — layout sticky asimétrico ======
          Imagen del lado izquierdo se queda fija mientras el texto del
          derecho scrollea. Cada bloque de texto entra con Reveal. */}
      <section id="sobre" className="relative isolate overflow-hidden">
        <BlobDivider
          variant="bottom-right"
          shape={3}
          className="fill-primary/12"
        />
        <Container className="py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-border shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80"
                  alt="Mercado uruguayo"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Sticker rotado tipo FUN Parque */}
                <div className="absolute -right-4 -top-4 rotate-12 rounded-full bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-glow">
                  Made in Uruguay 🇺🇾
                </div>
              </div>
            </div>

            <div className="space-y-16">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
                  <span className="rounded-full bg-primary px-3 py-1">
                    Quiénes somos
                  </span>
                </p>
                <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  La primera plataforma uruguaya de{" "}
                  <span className="text-highlight">compra colaborativa</span>
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Nacimos en Paysandú con la idea de que el acceso a precios
                  de importación al por mayor no debería ser un privilegio de
                  las grandes empresas. Funcionamos juntando demanda real:
                  cada vez que abrimos una campaña, los usuarios reservan
                  unidades con seña y, al cruzar el MOQ, todos pagan el mejor
                  precio.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Operamos desde un local físico en Leandro Gómez 1076, con
                  soporte en español, métodos de pago locales y entrega a
                  todo Uruguay. Sumamos un marketplace de reventa entre
                  vecinos y un programa de vendedores por catálogo para
                  multiplicar nuestra red.
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { value: "Hasta 60%", label: "menos que tienda" },
                    { value: "30%", label: "seña al reservar" },
                    { value: "+200", label: "compradores activos" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-secondary px-4 py-5"
                    >
                      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ====================== ATIVIDADES / LÍNEAS ======================
          Stacked cards: cada card queda sticky en su lugar mientras la
          siguiente sube desde abajo y la cubre. Las cards mas viejas se
          van apagando suavemente. Es la señal visual del FUN Parque. */}
      <section
        id="lineas"
        className="relative isolate overflow-hidden border-t border-border bg-dots"
      >
        <BlobDivider
          variant="top-left"
          shape={2}
          className="fill-primary/15"
        />
        <Container className="pt-24 pb-12 sm:pt-32 sm:pb-16">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
              <span className="rounded-full bg-primary px-3 py-1">
                Nuestras 4 líneas
              </span>
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Una plataforma,{" "}
              <span className="text-highlight">cuatro formas</span> de moverte
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Comprás, vendés o ganás comisión. Cada card se queda mientras
              scrolleás — mirá las 4 antes de elegir.
            </p>
          </Reveal>
        </Container>

        <Container className="pb-32 sm:pb-40">
          <StackedCards>
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
        </Container>
      </section>

      {/* Marquee entre secciones */}
      <Marquee
        items={[
          "Próxima campaña abre el 25 de mayo",
          "Hasta 60% menos que tienda",
          "Retiro gratis en Paysandú",
          "Pago seguro Mercado Pago",
          "Envío a todo Uruguay",
        ]}
        duration={45}
        background="bg-accent"
        textColor="text-accent-foreground"
      />

      {/* ====================== CAMPAÑAS DESTACADAS ====================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
                <span className="rounded-full bg-primary px-3 py-1">
                  Activas ahora
                </span>
              </p>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Campañas en curso
              </h2>
            </div>
            <Link
              href="/campanas"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40"
            >
              Ver todas
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </Reveal>

          {featuredCampaigns.length === 0 ? (
            <Reveal delay={0.1} className="mt-12">
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-lg font-bold">
                  Estamos preparando las primeras campañas
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Muy pronto vas a poder reservar acá. Mientras tanto, podés
                  leer{" "}
                  <Link
                    href="/como-funciona"
                    className="font-semibold text-primary-foreground/90 underline underline-offset-4"
                  >
                    cómo funciona el sistema
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((campaign) => (
                <StaggerItem key={campaign.id}>
                  <CampaignCard campaign={campaign} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </section>

      {/* ====================== EVENTOS DE GRUPO ====================== */}
      <section
        id="grupos"
        className="relative isolate overflow-hidden border-t border-border bg-secondary/40"
      >
        <BlobDivider
          variant="top-right"
          shape={1}
          className="fill-primary/15"
        />
        <Container className="py-24 sm:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
              <span className="rounded-full bg-primary px-3 py-1">
                Compras en grupo
              </span>
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Empresas, instituciones e importadores
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              ¿Necesitás un volumen mayor o tenés tu propia red de compradores?
              Acá tenés opciones a medida.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-3">
            {events.map((event) => (
              <StaggerItem key={event.title}>
                <Link
                  href={event.href}
                  className="hover-lift group block h-full rounded-3xl border border-border bg-card p-8 shadow-soft transition-colors hover:border-primary/40"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <event.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold tracking-tight">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-foreground/90 transition-transform group-hover:translate-x-0.5">
                    Saber más
                    <ArrowRight className="size-3.5" aria-hidden />
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ====================== FAQs ====================== */}
      <section
        id="faqs"
        className="relative isolate overflow-hidden border-t border-border"
      >
        <BlobDivider
          variant="bottom-left"
          shape={3}
          className="fill-primary/15"
        />
        <Container className="py-24 sm:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
              <span className="rounded-full bg-primary px-3 py-1">
                Preguntas frecuentes
              </span>
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              ¿Te queda alguna duda?
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Las respuestas a lo que más nos preguntan, agrupadas por tema.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mx-auto mt-12 max-w-3xl">
            <Tabs
              tabs={faqTabs.map((t) => ({
                id: t.id,
                label: t.label,
                content: <Accordion items={t.items} />,
              }))}
            />
          </Reveal>
        </Container>
      </section>

      {/* ====================== TESTIMONIOS ====================== */}
      <section
        id="testimonios"
        className="relative isolate overflow-hidden border-t border-border bg-secondary/30"
      >
        <BlobDivider
          variant="top-right"
          shape={2}
          className="fill-primary/15"
        />
        <Container className="py-24 sm:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
              <span className="rounded-full bg-primary px-3 py-1">
                Testimonios
              </span>
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Lo que dicen los nuestros
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Compradores y vendedores reales de todo Uruguay.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <TestimonialCard
                  author={t.author}
                  role={t.role}
                  rating={t.rating}
                  body={t.body}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ====================== PRECIOS (Preçário) ====================== */}
      <section
        id="precios"
        className="relative isolate overflow-hidden border-t border-border"
      >
        <BlobDivider
          variant="bottom-right"
          shape={1}
          className="fill-primary/15"
        />
        <Container className="py-24 sm:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
              <span className="rounded-full bg-primary px-3 py-1">
                Precios
              </span>
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Cuanto más reservamos,{" "}
              <span className="text-highlight">menos pagamos</span>
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Ejemplos reales de escalones de precio según categoría. Los
              precios finales dependen del proveedor y del volumen efectivo.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mx-auto mt-14 max-w-5xl">
            <PricingTabs />
          </Reveal>
        </Container>
      </section>

      {/* ====================== RESERVAR (form inline) ====================== */}
      <section
        id="reservar"
        className="relative isolate overflow-hidden border-y border-border bg-primary/8"
      >
        <BlobDivider
          variant="top-left"
          shape={2}
          className="fill-primary/30"
        />
        <BlobDivider
          variant="bottom-right"
          shape={3}
          className="fill-primary/20"
        />
        <Container className="py-24 sm:py-32">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/90">
                <span className="rounded-full bg-primary px-3 py-1">
                  Empezar
                </span>
              </p>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Sumate a la primera campaña
              </h2>
              <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                Crear cuenta es gratis, lleva menos de un minuto y no te
                compromete a nada. Mirá todo antes de reservar.
              </p>

              <div className="mt-10 space-y-4 text-sm">
                {[
                  { icon: MapPin, label: "Leandro Gómez 1076, Paysandú" },
                  { icon: Clock, label: "Lun-Vie 9:00-18:00 · Sáb 9:00-13:00" },
                  { icon: Phone, label: "hola@mercadonuestro.uy" },
                  {
                    icon: ShoppingBasket,
                    label: "Pago seguro vía Mercado Pago",
                  },
                ].map((line) => (
                  <div key={line.label} className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <line.icon className="size-4" aria-hidden />
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
