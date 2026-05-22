import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { CampaignsTabsNav } from "@/components/campanas/CampaignsTabsNav";
import { AppContainer } from "@/components/layout/AppContainer";
import { IconMN } from "@/components/ui/IconMN";

// ─── /app/campanas/como-funciona ──────────────────────────────────────────────
// Tab "Cómo funciona" del flujo de campañas. Explicador paso a paso para que
// el usuario entienda el modelo de importación grupal:
//   1. Reservás con seña 30%
//   2. Si se llega al MOQ → importamos
//   3. Si no se llega → te devolvemos la seña
//   4. El precio mejora con cada escalón alcanzado, retroactivo a todos
//   5. Recibís o retirás en Paysandú
//
// El objetivo es despejar dudas frecuentes ANTES de la primera reserva.

export const metadata: Metadata = {
  title: "Cómo funcionan las campañas",
  description:
    "Te explicamos paso a paso cómo funcionan las importaciones grupales en Mercado Nuestro: reservas, señas, escalones de precio y entrega.",
};

const STEPS: {
  number: number;
  icon: "billetera" | "compra_grupal" | "importar" | "paquete";
  title: string;
  body: string;
}[] = [
  {
    number: 1,
    icon: "billetera",
    title: "Reservás con una seña del 30%",
    body: "Elegís cuántas unidades querés del producto y pagás solo el 30% del total. Esa seña te asegura el lugar en la campaña.",
  },
  {
    number: 2,
    icon: "compra_grupal",
    title: "Se completa el mínimo (MOQ)",
    body: "Cuando entre todos los participantes llegamos al mínimo necesario para importar, la campaña pasa a ejecutarse. Si no se llega, la seña vuelve completa.",
  },
  {
    number: 3,
    icon: "importar",
    title: "Importamos juntos",
    body: "Coordinamos el embarque desde origen. El precio final es el del mejor escalón alcanzado entre todos — y aplica a todos, hasta a los que reservaron primero.",
  },
  {
    number: 4,
    icon: "paquete",
    title: "Recibís o retirás",
    body: "Cuando llega a Uruguay te avisamos. Coordiná retiro gratis en el local de Paysandú o envío al resto del país. Pagás el 70% restante al recibir.",
  },
];

const FAQS = [
  {
    q: "¿Qué pasa si no se llega al mínimo de unidades?",
    a: "La campaña cierra como fallida y te devolvemos el 100% de la seña al método de pago original. También podés dejarla como crédito + 5% extra para usar en cualquier compra futura.",
  },
  {
    q: "¿Cuándo se cobra el 70% restante?",
    a: "Solo si la campaña se cierra exitosa. Tenés hasta 5 días hábiles desde el cierre para pagar el saldo, con el precio del mejor escalón ya aplicado.",
  },
  {
    q: "¿Puedo cancelar mi reserva?",
    a: "Sí, hasta 72 horas antes del cierre de la campaña. La seña se devuelve en hasta 7 días hábiles al método de pago original.",
  },
  {
    q: "¿Qué son los escalones de precio?",
    a: "Cuanto más unidades se reserven entre todos, mejor precio negociamos. Si vos reservaste cuando el precio mostraba USD 25 pero la campaña terminó en el escalón de USD 18, vos pagás USD 18. La diferencia ya pagada se descuenta del saldo o queda como crédito.",
  },
  {
    q: "¿Cómo sé que mi seña está protegida?",
    a: "Todos los pagos pasan por Mercado Pago como custodia. La seña queda retenida y solo se libera cuando la campaña cierra exitosa. Si falla, se reembolsa automáticamente.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-neutral-gray-50">
      <div className="sticky top-0 z-30">
        <CampaignsTabsNav />
      </div>

      <AppContainer className="py-5 sm:py-10">
        {/* Hero explicativo */}
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-extrabold text-neutral-gray-700 sm:text-3xl lg:text-4xl">
            Cómo funcionan las{" "}
            <span className="text-brand-blue">campañas de importación</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-gray-700/70 sm:text-base">
            Compramos en grupo, importamos juntos y pagamos precio mayorista.
            Te lo explicamos en 4 pasos.
          </p>
        </header>

        {/* Grid de 4 pasos */}
        <section className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <article
              key={step.number}
              className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Número grande de fondo */}
              <span
                aria-hidden
                className="absolute -right-4 -top-4 text-7xl font-extrabold text-neutral-gray-50"
              >
                {step.number.toString().padStart(2, "0")}
              </span>

              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue shadow-sm">
                  <IconMN name={step.icon} variant="blanco" size={32} alt="" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-neutral-gray-700">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-gray-700/70">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Bloque destacado: protección de pago */}
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-blue p-6 text-white shadow-md sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow shadow-sm">
              <ShieldCheck
                className="size-8 text-neutral-gray-700"
                aria-hidden
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                Pagos seguros
              </p>
              <h3 className="mt-0.5 text-lg font-extrabold sm:text-xl">
                Tu seña está protegida hasta que se complete la campaña
              </h3>
            </div>
          </div>
          <Link
            href="/app/campanas"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-blue transition-transform hover:-translate-y-0.5"
          >
            Ver campañas activas
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        {/* FAQs */}
        <section className="mt-10 sm:mt-14">
          <h2 className="text-xl font-extrabold text-neutral-gray-700 sm:text-2xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-5 space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-brand-blue/30"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-bold text-neutral-gray-700 sm:text-base">
                  {faq.q}
                  <span
                    aria-hidden
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-gray-700/80">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-10 rounded-2xl border border-dashed border-border bg-white p-8 text-center sm:p-10">
          <p className="text-base font-bold text-neutral-gray-700 sm:text-lg">
            ¿Listo para tu primera importación grupal?
          </p>
          <p className="mt-2 text-sm text-neutral-gray-700/70">
            Mirá las campañas activas y sumate al grupo. Reservás con apenas el
            30%, el resto lo pagás cuando llegue.
          </p>
          <Link
            href="/app/campanas"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-neutral-gray-700 transition-transform hover:-translate-y-0.5"
          >
            Ver campañas activas
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </AppContainer>
    </div>
  );
}
