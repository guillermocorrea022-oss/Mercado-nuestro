import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  /** Items de "Cómo funciona". */
  details: { id: string; title: string; content: React.ReactNode }[];
  /** Lo que SÍ está incluido. */
  included: string[];
  /** Lo que NO. */
  excluded: string[];
  /** Dos CTAs (Precios / Reservar). */
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

// Layout horizontal full-width estilo FUN Parque: 3 columnas
// - LEFT (cream bg): badge + título grande + requisitos + descripción + CTAs
// - CENTER: imagen alta de la actividad
// - RIGHT (accent bg): "Cómo funciona" con bullets
export function ActivityCard({ data }: { data: ActivityCardData }) {
  return (
    <article
      className={cn(
        "grid gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-soft",
        "lg:grid-cols-[1.1fr_1fr_0.95fr]",
      )}
    >
      {/* LEFT — cream bg con titulo y descripcion */}
      <div className="flex flex-col gap-5 bg-secondary/70 p-8 sm:p-10">
        <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-glow">
          {data.badge}
        </span>

        <h3 className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-[2.75rem]">
          {data.title}
        </h3>

        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          ({data.requirements})
        </p>

        <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
          {data.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link
            href={data.primaryCta.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-11 rounded-full bg-foreground px-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-foreground/90",
            )}
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full border-2 border-foreground bg-transparent px-6 text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-white",
            )}
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* CENTER — imagen */}
      <div className="relative h-64 w-full overflow-hidden lg:h-auto lg:min-h-[450px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
        />
      </div>

      {/* RIGHT — Como funciona con bullets, bg accent */}
      <div className="flex flex-col gap-5 bg-accent p-8 sm:p-10">
        <h4 className="text-2xl font-extrabold uppercase leading-[0.95] tracking-tight text-accent-foreground sm:text-3xl">
          Cómo funciona
        </h4>

        <ul className="space-y-3 text-sm leading-relaxed text-accent-foreground sm:text-base">
          {data.details.map((d) => (
            <li key={d.id}>
              <p className="font-bold">{d.title}</p>
              <p className="mt-1 text-accent-foreground/80">{d.content}</p>
            </li>
          ))}
        </ul>

        {data.included.length > 0 ? (
          <div className="mt-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
              Incluye
            </p>
            <p className="mt-1 text-sm text-accent-foreground/80">
              {data.included.join(" · ")}
            </p>
          </div>
        ) : null}

        {data.excluded.length > 0 ? (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
              No incluye
            </p>
            <p className="mt-1 text-sm text-accent-foreground/80">
              {data.excluded.join(" · ")}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
