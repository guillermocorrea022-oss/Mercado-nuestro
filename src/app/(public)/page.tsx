import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

import {
  CampaignCard,
  type CampaignCardData,
} from "@/components/campanas/CampaignCard";
import { TestimonialCard } from "@/components/home/TestimonialCard";
import { Container } from "@/components/layout/Container";
import { BlobDivider } from "@/components/motion/BlobDivider";
import { Reveal } from "@/components/motion/Reveal";
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
// Contenido estático del home — copy editorial, en rioplatense.
// ─────────────────────────────────────────────────────────────────────────────

const businessLines = [
  {
    id: "campanas",
    eyebrow: "Línea 01",
    title: "Campañas de importación grupal",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    short:
      "Sumate a otros uruguayos para comprar en grupo y pagar precio mayorista.",
    href: "/campanas",
    details: [
      {
        id: "01-1",
        title: "¿Qué es una campaña?",
        content:
          "Abrimos una ventana de tiempo en la que muchas personas reservan unidades de un mismo producto. Cuanta más cantidad sumamos entre todos, mejor es el precio para todos.",
      },
      {
        id: "01-2",
        title: "¿Cómo reservo?",
        content:
          "Elegís cuántas unidades querés, pagás una seña del 30% para asegurar tu lugar y, cuando cerramos la campaña, abonás el saldo al mejor precio escalonado alcanzado.",
      },
      {
        id: "01-3",
        title: "¿Qué pasa si no llegamos al objetivo?",
        content:
          "Te devolvemos toda la seña al método de pago original, o si elegís, la dejás como crédito en cuenta con un 5% extra de bonificación.",
      },
    ],
  },
  {
    id: "marketplace",
    eyebrow: "Línea 02",
    title: "Marketplace de reventa entre vecinos",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80",
    short:
      "Quien importó publica el sobrante. Pago protegido por la plataforma, retiro local.",
    href: "/marketplace",
    details: [
      {
        id: "02-1",
        title: "¿Quién vende en el marketplace?",
        content:
          "Personas comunes que ya recibieron stock de una campaña y quieren revender lo que les sobró. No son grandes empresas: son tus vecinos.",
      },
      {
        id: "02-2",
        title: "¿Cómo se cuida el dinero?",
        content:
          "Pagás a Mercado Nuestro, no al vendedor directamente. Liberamos el pago recién cuando confirmás recepción, o pasados 3 días desde el despacho sin reclamo.",
      },
      {
        id: "02-3",
        title: "¿Y si hay problemas?",
        content:
          "Abrís un reclamo dentro de los 7 días. Lo resolvemos en 5 días hábiles, y si no estás conforme tenés derecho a una apelación.",
      },
    ],
  },
  {
    id: "disponible",
    eyebrow: "Línea 03",
    title: "Stock disponible, entrega rápida",
    image:
      "https://images.unsplash.com/photo-1556909211-d5b0bb0e6f6d?auto=format&fit=crop&w=1200&q=80",
    short:
      "Productos físicamente acá, en el local de Paysandú o en depósito. Llegan en 2 a 5 días.",
    href: "/disponible",
    details: [
      {
        id: "03-1",
        title: "¿Cómo es la entrega?",
        content:
          "Despachamos a todo Uruguay en 2 a 5 días hábiles. Si vivís cerca, retiro gratis en nuestro local de Leandro Gómez 1076, Paysandú.",
      },
      {
        id: "03-2",
        title: "¿Qué métodos de pago aceptan?",
        content:
          "Mercado Pago, transferencia, Abitab, Redpagos o crédito en tu cuenta. Sin recargos por elegir uno u otro.",
      },
      {
        id: "03-3",
        title: "¿Tiene garantía?",
        content:
          "Sí. Si algo llega mal, lo resolvemos acá, en español, sin esperar respuestas de China.",
      },
    ],
  },
  {
    id: "vendedores",
    eyebrow: "Línea 04",
    title: "Red de vendedores por catálogo",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    short:
      "Compartís tu link personal, alguien compra, vos ganás comisión. Sin stock propio.",
    href: "/perfil/vendedor",
    details: [
      {
        id: "04-1",
        title: "¿Cómo gano comisión?",
        content:
          "Cada vez que alguien entra por tu link y reserva o compra, queda atribuido a vos por 30 días. La comisión se consolida cuando confirma recepción.",
      },
      {
        id: "04-2",
        title: "¿Cuánto puedo ganar?",
        content:
          "Comisión base + bonus escalonados por volumen mensual: +2% sobre USD 500, +3% sobre USD 1500, +5% sobre USD 3000. Sin techo.",
      },
      {
        id: "04-3",
        title: "¿Cuándo me pagan?",
        content:
          "Una vez al mes, los primeros 5 días hábiles, con un mínimo de USD 20 acumulados. Por transferencia bancaria.",
      },
    ],
  },
];

const howItWorksSteps = [
  {
    n: "01",
    title: "Elegí una campaña",
    description:
      "Mirá los productos que estamos importando ahora. Cada uno tiene su precio escalonado según cuántas unidades reservamos entre todos.",
  },
  {
    n: "02",
    title: "Reservá con una seña",
    description:
      "Pagás solo el 30% para asegurar tu lugar. Cuando se completa la campaña, abonás el saldo al mejor precio alcanzado.",
  },
  {
    n: "03",
    title: "Recibí tu pedido",
    description:
      "Retirás gratis en nuestro local de Paysandú o lo enviamos a tu domicilio. Te avisamos en cada paso del camino.",
  },
];

const valueProps = [
  {
    icon: Users,
    title: "Comprás en grupo",
    description:
      "Sumamos pedidos de muchas personas para conseguir precios de importador, no de tienda.",
  },
  {
    icon: ShieldCheck,
    title: "Pagás con confianza",
    description:
      "Mercado Pago, Abitab, Redpagos o transferencia. La plataforma cuida tu dinero hasta que llega lo que reservaste.",
  },
  {
    icon: Truck,
    title: "Llega a todo Uruguay",
    description:
      "Despacho a Montevideo, Paysandú, Salto y resto del país. También podés retirar gratis en nuestro local.",
  },
  {
    icon: PackageCheck,
    title: "Garantía local",
    description:
      "Si algo no llega como te lo prometimos, lo resolvemos acá. Soporte en español, sin esperar respuestas de China.",
  },
];

const stats = [
  { value: "Hasta 60%", label: "menos que el precio de tienda" },
  { value: "30%", label: "de seña para reservar" },
  { value: "72 hs", label: "para cancelar sin cargo" },
  { value: "Paysandú", label: "local físico para retirar" },
];

const testimonials = [
  {
    author: "Carolina, Paysandú",
    role: "Compradora en 3 campañas",
    rating: 5,
    body:
      "Conseguí una cámara IP a la mitad de precio que la veía en cualquier comercio. La seña fue facilísima y me llegó cuando dijeron. Recomendado al 100%.",
  },
  {
    author: "Diego, Montevideo",
    role: "Revendedor",
    rating: 5,
    body:
      "Importé 20 unidades y vendí lo que me sobró por el marketplace. El sistema de escrow me dio mucha tranquilidad. Recibí el dinero sin pelearme con nadie.",
  },
  {
    author: "Susana, Salto",
    role: "Vendedora por catálogo",
    rating: 4.5,
    body:
      "Le comparto el link a mi familia y a vecinos por WhatsApp. En el primer mes ya cobré comisiones para los primeros mates del fin de semana. Increíble.",
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
          "Sí. Operamos desde Uruguay, con local físico en Paysandú. Los pagos pasan por Mercado Pago y todo dinero del marketplace queda retenido hasta que confirmás recepción.",
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
      {/* ====================== HERO ====================== */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <BlobDivider variant="top-right" shape={1} />
        <BlobDivider
          variant="bottom-left"
          shape={2}
          float
          className="fill-accent/40"
        />

        <Container className="py-16 sm:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                  <Sparkles className="size-3.5 text-primary" aria-hidden />
                  Importación grupal · Uruguay
                </div>
              </Reveal>

              <Reveal delay={0.1} className="mt-8">
                <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
                  <span className="text-gradient">Importá en grupo.</span>
                  <br />
                  Pagá precio mayorista.
                </h1>
              </Reveal>

              <Reveal delay={0.2} className="mt-7">
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  Sumate a campañas de importación con otros uruguayos y
                  conseguí productos al precio que paga un importador grande.
                  Sin trámites, sin viajes, con soporte local.
                </p>
              </Reveal>

              <Reveal delay={0.3} className="mt-10">
                <div className="flex flex-col items-start gap-3 sm:flex-row">
                  <Link
                    href="/campanas"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 px-7 text-base shadow-glow",
                    )}
                  >
                    Ver campañas activas
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href="#lineas"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 px-7 text-base",
                    )}
                  >
                    Cómo trabajamos
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
                  alt="Cajas de importación apiladas listas para entrega"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/40 via-transparent"
                />
              </div>
              {/* Tarjeta flotante con un highlight, da textura editorial */}
              <div className="absolute -bottom-6 -left-4 hidden max-w-[260px] rounded-2xl border border-border bg-card p-5 shadow-soft animate-float-slower sm:block">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Precio escalonado
                </p>
                <p className="mt-2 text-sm leading-snug">
                  Cuanto más se reserva, menos pagamos.{" "}
                  <span className="font-medium">Todos al mismo precio</span>{" "}
                  al cerrar la campaña.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Stats row */}
          <Stagger
            stagger={0.1}
            delay={0.5}
            className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="bg-background px-6 py-8"
              >
                <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ====================== 4 LÍNEAS DE NEGOCIO ====================== */}
      <section
        id="lineas"
        className="relative isolate overflow-hidden border-y border-border bg-secondary/40 py-24 sm:py-32"
      >
        <BlobDivider variant="top-left" shape={3} />
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Nuestras 4 líneas
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Una plataforma, cuatro formas de moverte
            </h2>
            <p className="mt-5 text-base text-muted-foreground">
              Compras, vendés o ganás comisión. Elegís cómo participar según el
              momento.
            </p>
          </Reveal>

          <div className="mt-20 space-y-20 sm:space-y-28">
            {businessLines.map((line, idx) => {
              const reverse = idx % 2 === 1;
              return (
                <article
                  key={line.id}
                  id={line.id}
                  className="grid scroll-mt-24 gap-12 lg:grid-cols-2 lg:items-center lg:gap-20"
                >
                  <Reveal
                    className={cn(
                      "relative",
                      reverse ? "lg:order-2" : "lg:order-1",
                    )}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-soft">
                      <Image
                        src={line.image}
                        alt={line.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                      />
                    </div>
                    <div className="absolute -bottom-5 -right-4 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-soft animate-float-slower sm:block">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        {line.eyebrow}
                      </p>
                    </div>
                  </Reveal>

                  <Reveal
                    delay={0.1}
                    className={cn(reverse ? "lg:order-1" : "lg:order-2")}
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary lg:hidden">
                      {line.eyebrow}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl lg:mt-0">
                      {line.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {line.short}
                    </p>

                    <div className="mt-8">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Cómo funciona
                      </p>
                      <Accordion items={line.details} className="mt-3" />
                    </div>

                    <Link
                      href={line.href}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "mt-8 h-12 px-7 text-base",
                      )}
                    >
                      Explorar {line.title.split(" ")[0].toLowerCase()}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Reveal>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ====================== CÓMO FUNCIONA (campaña) ====================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
            <Reveal className="order-2 lg:order-1">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80"
                  alt="Personas en un mercado uruguayo eligiendo productos"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="order-1 lg:order-2">
              <Reveal>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  El método
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Tres pasos para comprar mayorista
                </h2>
                <p className="mt-5 text-base text-muted-foreground">
                  Lo que antes sólo veían las grandes importadoras, ahora
                  también podés acceder vos.
                </p>
              </Reveal>

              <Stagger className="mt-10 space-y-px overflow-hidden rounded-2xl border border-border bg-border/60">
                {howItWorksSteps.map((step) => (
                  <StaggerItem
                    key={step.n}
                    className="relative bg-background p-6"
                  >
                    <div className="flex items-start gap-5">
                      <p className="font-mono text-2xl font-semibold tracking-tight text-primary">
                        {step.n}
                      </p>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </Container>
      </section>

      {/* ====================== CAMPAÑAS DESTACADAS ====================== */}
      <section className="relative isolate overflow-hidden border-t border-border py-24 sm:py-32">
        <BlobDivider variant="top-right" shape={2} />
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Activas ahora
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Campañas en curso
              </h2>
            </div>
            <Link
              href="/campanas"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
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
                <p className="text-lg font-medium">
                  Estamos preparando las primeras campañas
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Muy pronto vas a poder reservar acá. Mientras tanto, podés
                  leer{" "}
                  <Link
                    href="/como-funciona"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    cómo funciona el sistema
                  </Link>{" "}
                  para llegar listo.
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

      {/* ====================== TESTIMONIOS ====================== */}
      <section
        id="testimonios"
        className="relative isolate overflow-hidden border-y border-border bg-card/40 py-24 sm:py-32"
      >
        <BlobDivider variant="bottom-right" shape={3} className="fill-accent/50" />
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Lo que dicen los nuestros
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Compradores y vendedores reales
            </h2>
            <p className="mt-5 text-base text-muted-foreground">
              Personas comunes de Paysandú, Montevideo, Salto y todo el país
              que ya viven el modelo.
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

      {/* ====================== POR QUÉ ====================== */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <BlobDivider variant="top-left" shape={1} />
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Por qué Mercado Nuestro
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              La primera plataforma uruguaya de compra colaborativa
            </h2>
          </Reveal>

          <Stagger className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
            {valueProps.map((item) => (
              <StaggerItem key={item.title}>
                <div className="hover-lift group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/30">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <item.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ====================== FAQ TABBED ====================== */}
      <section
        id="faqs"
        className="border-t border-border bg-secondary/40 py-24 sm:py-32"
      >
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Preguntas frecuentes
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              ¿Te queda alguna duda?
            </h2>
            <p className="mt-5 text-base text-muted-foreground">
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

      {/* ====================== VISITANOS PAYSANDÚ ====================== */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <BlobDivider variant="bottom-left" shape={2} />
        <Container>
          <div className="grid gap-12 rounded-3xl border border-border bg-card p-10 shadow-soft sm:p-14 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20 lg:p-20">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Local físico
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Visitanos en Paysandú
              </h2>
              <p className="mt-5 text-base text-muted-foreground">
                Mercado Nuestro no es solo una web: tenemos local abierto al
                público para retirar pedidos, probar productos y conocer al
                equipo.
              </p>

              <dl className="mt-10 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-4" aria-hidden />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Dirección
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      Leandro Gómez 1076, Paysandú
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock className="size-4" aria-hidden />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Horarios
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      Lun a vie · 9:00 a 18:00
                    </dd>
                    <dd className="text-sm">Sábados · 9:00 a 13:00</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="size-4" aria-hidden />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Contacto
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      hola@mercadonuestro.uy
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/contacto"
                  className={cn(buttonVariants({ size: "lg" }), "h-12 px-7")}
                >
                  Cómo llegar
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/disponible"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 px-7",
                  )}
                >
                  Ver stock en local
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1604754742629-3e5728249d73?auto=format&fit=crop&w=1200&q=80"
                  alt="Local físico de Mercado Nuestro en Paysandú"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ====================== CTA FINAL ====================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div className="grid lg:grid-cols-[1.1fr_1fr]">
                <div className="relative order-2 aspect-[5/4] lg:order-1 lg:aspect-auto">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
                    alt="Persona vendiendo desde su celular"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="order-1 flex flex-col justify-center p-10 sm:p-14 lg:order-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    Programa de vendedores
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                    ¿Querés generar ingresos vendiendo desde tu celular?
                  </h2>
                  <p className="mt-5 text-base text-muted-foreground">
                    Sumate al programa de vendedores por catálogo. Compartís
                    tu link y ganás comisión por cada venta, sin tener stock
                    propio.
                  </p>
                  <Link
                    href="/perfil/vendedor"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-8 h-12 px-7 text-base self-start shadow-glow",
                    )}
                  >
                    Conocer el programa
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
