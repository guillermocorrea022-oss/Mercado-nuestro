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

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function HomePage() {
  return (
    <>
      {/* ====================== HERO ====================== */}
      <section className="relative isolate overflow-hidden">
        {/* Gradiente decorativo */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grain"
        />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />

        <Container className="py-24 sm:py-32 lg:py-40">
          <Reveal>
            <div className="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Importación grupal · Uruguay
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <h1 className="mx-auto max-w-4xl text-center text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gradient">Importá en grupo.</span>
              <br />
              Pagá precio mayorista.
            </h1>
          </Reveal>

          <Reveal delay={0.2} className="mt-8">
            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Sumate a campañas de importación con otros uruguayos y conseguí
              productos al precio que paga un importador grande. Sin trámites,
              sin viajes, con soporte local.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
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

          {/* Stats row */}
          <Stagger
            stagger={0.1}
            delay={0.5}
            className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 lg:grid-cols-4"
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
      <section className="border-y border-border bg-card/30 py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              El método
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Tres pasos para comprar mayorista
            </h2>
            <p className="mt-5 text-base text-muted-foreground">
              Lo que antes sólo veían las grandes importadoras, ahora también
              podés acceder vos.
            </p>
          </Reveal>

          <Stagger className="mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <StaggerItem
                key={step.n}
                className="relative bg-background p-8"
              >
                <p className="font-mono text-xs font-medium text-primary">
                  {step.n}
                </p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
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

          <Reveal delay={0.1} className="mt-12">
            <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center backdrop-blur">
              <p className="text-lg font-medium">
                Estamos preparando las primeras campañas
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Muy pronto vas a poder reservar acá. Mientras tanto, podés leer{" "}
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
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center sm:p-20">
              <div
                aria-hidden
                className="absolute inset-x-0 -top-40 mx-auto size-[500px] rounded-full bg-primary/8 blur-3xl"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  ¿Querés generar ingresos vendiendo desde tu celular?
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Sumate al programa de vendedores por catálogo. Compartís tu
                  link y ganás comisión por cada venta, sin tener stock propio.
                </p>
                <Link
                  href="/ser-vendedor"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-10 h-12 px-7 text-base shadow-glow",
                  )}
                >
                  Conocer el programa
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
