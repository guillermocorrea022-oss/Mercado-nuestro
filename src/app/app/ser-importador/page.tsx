import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Globe2, Package, ShieldCheck } from "lucide-react";

import { ImporterApplicationForm } from "@/components/importador/ImporterApplicationForm";
import { AppContainer } from "@/components/layout/AppContainer";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Ser importador avanzado",
  description:
    "Postulate al programa de importadores avanzados de Mercado Nuestro: abrí tus propias campañas y compartí infraestructura.",
};

const BENEFITS = [
  {
    icon: Globe2,
    title: "Abrí tus propias campañas",
    description:
      "Decidís qué productos importar, el MOQ, el precio y los escalones. Nosotros operamos la plataforma.",
  },
  {
    icon: Package,
    title: "Infraestructura compartida",
    description:
      "Usás nuestro despachante, logística y soporte. Vos te concentrás en el producto y el origen.",
  },
  {
    icon: BadgeCheck,
    title: "Reputación visible",
    description:
      "Tu nombre aparece como importador responsable de cada campaña que abrís.",
  },
  {
    icon: ShieldCheck,
    title: "Cobro asegurado",
    description:
      "Las señas y saldos los recibimos nosotros y te liquidamos cuando se cierra la campaña.",
  },
];

const REQUISITOS = [
  "Experiencia previa importando (aunque sea informal).",
  "RUT activo o disposición a tramitarlo.",
  "Capacidad de respaldar al menos USD 5.000 en caso de imprevistos.",
  "Compromiso de respetar los plazos y condiciones acordados con compradores.",
];

export default function SerImportadorPage() {
  return (
    <AppContainer className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/como-funciona"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cómo funciona Mercado Nuestro
        </Link>

        <Reveal className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Fase 3 — postulaciones abiertas
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Ser importador avanzado
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Abrí tus propias campañas en Mercado Nuestro. Ideal para quienes
            ya importan o quieren empezar usando nuestra plataforma como
            canal y operación.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <b.icon className="size-4" aria-hidden />
              </div>
              <p className="mt-3 font-semibold">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold">Requisitos</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {REQUISITOS.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Postulate</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Completá el formulario y te contactamos en los próximos días
            hábiles para coordinar entrevista y revisión de documentación.
          </p>
          <div className="mt-6">
            <ImporterApplicationForm />
          </div>
        </div>
      </div>
    </AppContainer>
  );
}
