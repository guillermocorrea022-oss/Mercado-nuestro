import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bell, Calendar, Sparkles, Video } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lives — Mercado Nuestro",
  description:
    "Próximamente: transmisiones en vivo con productos en oferta, demostraciones y reservas en tiempo real.",
};

const ROADMAP = [
  {
    icon: Video,
    title: "Demos en vivo",
    description:
      "Probamos productos en cámara, mostramos calidad y respondemos preguntas en tiempo real.",
  },
  {
    icon: Sparkles,
    title: "Ofertas exclusivas",
    description:
      "Precios y campañas que solo aparecen durante el live. Reservas con un solo click.",
  },
  {
    icon: Calendar,
    title: "Calendario semanal",
    description:
      "Vas a poder agendar los lives y recibir un recordatorio antes de que empiecen.",
  },
];

export default function LivesPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio
        </Link>

        <Reveal className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            Próximamente — Fase 3
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Mercado Nuestro en vivo
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Estamos preparando un formato de live shopping donde mostramos
            productos en cámara, contamos las campañas activas y reservás en
            el momento con precios exclusivos.
          </p>
        </Reveal>

        <div className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1600&q=80"
            alt="Equipo grabando una transmisión en vivo"
            width={1600}
            height={900}
            className="aspect-[16/9] w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-destructive/90 px-3 py-1 text-xs font-medium text-white">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-white" />
              EN VIVO próximamente
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              Reservá tu lugar antes que se llene
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {ROADMAP.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="size-4" aria-hidden />
              </div>
              <p className="mt-3 font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <Bell
            className="mx-auto size-7 text-primary"
            aria-hidden
          />
          <h2 className="mt-3 text-lg font-semibold">
            ¿Querés que te avisemos cuando arranquen?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Activá las notificaciones de tu cuenta y te mandamos el primer
            aviso apenas tengamos fecha confirmada.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/perfil/notificaciones"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Configurar notificaciones
            </Link>
            <Link
              href="/campanas"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Ver campañas activas
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
