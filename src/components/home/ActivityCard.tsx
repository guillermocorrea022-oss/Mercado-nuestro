import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActivityCardData = {
  id: string;
  title: string;
  /** Pill arriba a la izquierda — "Línea 01", "Importación grupal", etc. */
  badge: string;
  /** Sub-info bajo el título — equivalente al "(Mín 4 años...)" del FUN Parque. */
  requirements: string;
  description: string;
  image: string;
  /** "Cómo funciona" en preguntas expandibles. */
  details: { id: string; title: string; content: React.ReactNode }[];
  /** Lo que SÍ está incluido — equivalente al "É obrigatório" del FUN Parque. */
  included: string[];
  /** Lo que NO — equivalente al "É proibido". */
  excluded: string[];
  /** Dos CTAs como en el FUN Parque (Preçário / Reservar). */
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

// Card de "actividad" estilo FUN Parque: image-top, título + requisitos,
// descripción, "Cómo funciona" expandible, "Qué incluye / Qué no" en dos
// columnas, dual CTA al pie.
export function ActivityCard({ data }: { data: ActivityCardData }) {
  return (
    <article className="hover-lift overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={data.image}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
          {data.badge}
        </span>
      </div>

      <div className="space-y-5 p-7">
        <header>
          <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {data.title}
          </h3>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {data.requirements}
          </p>
        </header>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-secondary/60 p-4 text-xs">
          <div>
            <p className="font-semibold text-foreground">Qué incluye</p>
            <ul className="mt-2 space-y-1.5">
              {data.included.map((it) => (
                <li key={it} className="flex items-start gap-1.5">
                  <Check
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">No incluye</p>
            <ul className="mt-2 space-y-1.5">
              {data.excluded.map((it) => (
                <li key={it} className="flex items-start gap-1.5">
                  <X
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cómo funciona
          </p>
          <Accordion items={data.details} className="mt-2 border-t-0" />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href={data.primaryCta.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-10 px-5 text-sm shadow-glow",
            )}
          >
            {data.primaryCta.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link
            href={data.secondaryCta.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-10 px-5 text-sm",
            )}
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
