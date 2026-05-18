import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

import {
  CampaignCard,
  type CampaignCardData,
} from "@/components/campanas/CampaignCard";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { buttonVariants } from "@/components/ui/button";
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
  { value: "São Paulo", label: "región de servidores" },
];

export const revalidate = 60;

export default async function HomePage() {
  const featuredCampaigns = await getFeaturedCampaigns();

  return (
    <>
      {/* ====================== HERO ====================== */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-40 -right-40 -z-10 size-[600px] rounded-full bg-primary/8 blur-3xl"
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
                    href="/como-funciona"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-12 px-7 text-base",
                    )}
                  >
                    Cómo funciona
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
              <div className="absolute -bottom-6 -left-4 hidden max-w-[260px] rounded-2xl border border-border bg-card p-5 shadow-soft sm:block">
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

      {/* ====================== CÓMO FUNCIONA ====================== */}
      <section className="border-y border-border bg-secondary/60 py-24 sm:py-32">
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
      <section className="py-24 sm:py-32">
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
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
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

      {/* ====================== POR QUÉ ====================== */}
      <section className="border-t border-border bg-card/30 py-24 sm:py-32">
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
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30">
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
                    href="/ser-vendedor"
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
