import Link from "next/link";
import {
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const howItWorksSteps = [
  {
    n: "1",
    title: "Elegí una campaña",
    description:
      "Mirá los productos que se están importando ahora. Cada uno tiene su precio según cuántas unidades reservemos entre todos.",
  },
  {
    n: "2",
    title: "Reservá con una seña",
    description:
      "Pagás solo el 30% para asegurar tu lugar. Cuando se completa la campaña, abonás el saldo al mejor precio alcanzado.",
  },
  {
    n: "3",
    title: "Recibí tu pedido",
    description:
      "Retirás gratis en nuestro local de Paysandú o lo enviamos a tu domicilio. Te avisamos en cada paso.",
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
      "Despacho a Montevideo, Paysandú, Salto y el resto del país. También podés retirar gratis en el local.",
  },
  {
    icon: PackageCheck,
    title: "Garantía local",
    description:
      "Si algo no llega como te lo prometimos, lo resolvemos acá. Soporte en español, sin esperar respuestas de China.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/40 via-background to-background">
        <Container className="py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              Importación grupal · Uruguay
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Importá en grupo, pagá precio mayorista
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Sumate a campañas de importación con otros uruguayos y conseguí
              productos al precio que paga un importador grande. Sin trámites,
              sin viajes, con soporte local.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/campanas"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-6 text-base",
                )}
              >
                Ver campañas activas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/como-funciona"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6 text-base",
                )}
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comprar en Mercado Nuestro es fácil
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tres pasos para acceder a precios que antes sólo veían las grandes
              empresas.
            </p>
          </div>

          <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <li
                key={step.n}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {step.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-border bg-muted/30 py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Campañas activas
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sumate antes del cierre para asegurar tu unidad al mejor precio.
              </p>
            </div>
            <Link
              href="/campanas"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <p className="text-base font-medium">
              Estamos preparando las primeras campañas.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Muy pronto vas a poder reservar acá. Mientras tanto, leé{" "}
              <Link
                href="/como-funciona"
                className="font-medium text-primary hover:underline"
              >
                cómo funciona el sistema
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Por qué Mercado Nuestro
            </h2>
            <p className="mt-4 text-muted-foreground">
              Es la primera plataforma uruguaya pensada para comprar como un
              importador, no como un cliente final.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                ¿Querés generar ingresos vendiendo desde tu celular?
              </h2>
              <p className="mt-4 text-pretty opacity-90">
                Sumate al programa de vendedores por catálogo. Compartís tu link
                y ganás comisión por cada venta, sin tener stock propio.
              </p>
              <Link
                href="/ser-vendedor"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "mt-8 h-11 px-6 text-base",
                )}
              >
                Conocer el programa
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
