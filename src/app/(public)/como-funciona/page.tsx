import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Coins,
  HandCoins,
  PackageOpen,
  ShieldCheck,
  TrendingDown,
  Users,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Aprendé cómo funciona la importación grupal en Mercado Nuestro: precios escalonados, señas, cierres y entregas.",
};

const journey = [
  {
    icon: PackageOpen,
    title: "Abrimos una campaña",
    description:
      "Mostramos un producto con su precio según volumen, la cantidad mínima necesaria (MOQ) y la fecha de cierre.",
  },
  {
    icon: Users,
    title: "Reservás con seña",
    description:
      "Pagás el 30% del precio. Eso asegura tu unidad. Podés cancelar hasta 72 horas antes del cierre y recibís la seña de vuelta.",
  },
  {
    icon: TrendingDown,
    title: "Cuanto más se suma, mejor el precio",
    description:
      "Si llegamos al próximo escalón de volumen, todos pagan el precio nuevo. Vos te beneficiás aunque ya hayas reservado.",
  },
  {
    icon: Calendar,
    title: "Llega el cierre",
    description:
      "Si se alcanzó el MOQ, la campaña se cierra con éxito. Si no, te devolvemos la seña al método original.",
  },
  {
    icon: HandCoins,
    title: "Pagás el saldo",
    description:
      "Tenés 5 días hábiles para abonar el 70% restante. Si pagaste seña con un precio mayor, la diferencia se descuenta o queda como crédito.",
  },
  {
    icon: PackageOpen,
    title: "Recibís tu producto",
    description:
      "Lo retirás gratis en Paysandú o lo enviamos a tu dirección. Te avisamos cada cambio de estado de la importación.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Nunca pagás más que lo que viste",
    description:
      "El precio mostrado al reservar es el techo. Si la campaña mejora con volumen, pagás menos. Nunca más.",
  },
  {
    icon: Coins,
    title: "Si no llegamos al mínimo, te devolvemos",
    description:
      "Reembolsamos la seña al método original en hasta 7 días hábiles. Opcional: dejarla como crédito con 5% extra.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-40 -left-40 -z-10 size-[500px] rounded-full bg-primary/8 blur-3xl"
        />
        <Container className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                El sistema
              </p>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
                Cómo funciona{" "}
                <span className="text-highlight">Mercado Nuestro</span>
              </h1>
              <p className="mt-8 text-lg text-muted-foreground sm:text-xl">
                Nos juntamos entre muchas personas para importar productos al
                precio que paga un mayorista. La plataforma se encarga del
                trámite, la aduana y la logística. Vos solo elegís y reservás.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-muted shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80"
                  alt="Mercadería preparada para envío"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Paso a paso
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              El camino de una campaña
            </h2>
            <p className="mt-5 text-muted-foreground">
              Desde que abrimos la importación hasta que el producto llega a tu
              casa.
            </p>
          </Reveal>

          <Stagger className="mx-auto mt-16 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((step, idx) => (
              <StaggerItem key={step.title} className="bg-background p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-primary">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <step.icon
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">
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

      <section className="border-y border-border bg-card/30 py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Precio escalonado
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Cuanto más se suma, más baja el precio
            </h2>
            <p className="mt-5 text-muted-foreground">
              Cada campaña tiene escalones definidos antes de abrirla. Al
              cerrar, todos pagan el mejor escalón alcanzado. Ejemplo:
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto mt-10 max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Unidades</th>
                    <th className="px-6 py-4 font-medium">Precio por unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 text-foreground/80">1 – 10</td>
                    <td className="px-6 py-4 font-semibold">USD 120</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-foreground/80">11 – 30</td>
                    <td className="px-6 py-4 font-semibold">USD 105</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="px-6 py-4 text-foreground/80">31 – 100</td>
                    <td className="px-6 py-4 text-base font-semibold text-primary">
                      USD 92
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Si reservaste cuando estaba en USD 120 y la campaña llegó a 35
              unidades, terminás pagando USD 92 igual que quien reservó último.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Nuestras garantías
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Pagás con confianza
            </h2>
          </Reveal>

          <Stagger className="mx-auto mt-16 grid max-w-4xl gap-5 sm:grid-cols-2">
            {guarantees.map((g) => (
              <StaggerItem key={g.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-8">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <g.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {g.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center sm:p-20">
              <div
                aria-hidden
                className="absolute inset-x-0 -top-40 mx-auto size-[500px] rounded-full bg-primary/8 blur-3xl"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Listo para empezar
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Mirá las campañas activas y reservá la tuya en menos de cinco
                  minutos.
                </p>
                <Link
                  href="/campanas"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-10 h-12 px-7 text-base shadow-glow",
                  )}
                >
                  Ver campañas activas
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
