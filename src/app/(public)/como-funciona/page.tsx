import type { Metadata } from "next";
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
    title: "Si la campaña no llega al mínimo, te devolvemos",
    description:
      "Reembolsamos la seña al método original en hasta 7 días hábiles. Opcional: dejarla como crédito con 5% extra.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/30 via-background to-background">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Cómo funciona Mercado Nuestro
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Nos juntamos entre muchas personas para importar productos al precio
              que paga un mayorista. La plataforma se encarga del trámite, la
              aduana y la logística. Vos solo elegís y reservás.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              El camino de una campaña
            </h2>
            <p className="mt-3 text-muted-foreground">
              Desde que abrimos la importación hasta que el producto llega a tu
              casa.
            </p>
          </div>

          <ol className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journey.map((step, idx) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <step.icon className="size-5 text-muted-foreground" aria-hidden />
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
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Cómo se construye el precio
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cada campaña tiene escalones de precio definidos antes de abrirla.
              Por ejemplo:
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Unidades reservadas</th>
                    <th className="px-4 py-3">Precio por unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">1 – 10</td>
                    <td className="px-4 py-3 font-medium">USD 120</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">11 – 30</td>
                    <td className="px-4 py-3 font-medium">USD 105</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">31 – 100</td>
                    <td className="px-4 py-3 font-medium text-primary">USD 92</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Al cerrar la campaña, todas las personas pagan el precio del mejor
              escalón alcanzado. Si vos reservaste cuando estaba en USD 120 y la
              campaña llegó a 35 unidades, terminás pagando USD 92 igual que
              quien reservó último.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-tight text-center">
              Nuestras garantías
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {guarantees.map((g) => (
                <div
                  key={g.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <g.icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {g.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {g.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Listo para empezar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mirá las campañas activas y reservá la tuya en menos de cinco minutos.
            </p>
            <Link
              href="/campanas"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 h-11 px-6 text-base",
              )}
            >
              Ver campañas activas
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
