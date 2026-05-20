import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActivityRightVariant = "blue" | "navy" | "blue-light" | "yellow";

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
  /** Color del bloque "Cómo funciona". Rotar entre cards en el home. */
  rightVariant?: ActivityRightVariant;
};

const rightVariantClass: Record<
  ActivityRightVariant,
  { bg: string; text: string; subtle: string }
> = {
  blue: {
    bg: "bg-blue",
    text: "text-blue-foreground",
    subtle: "text-blue-foreground/85",
  },
  navy: {
    bg: "bg-navy",
    text: "text-navy-foreground",
    subtle: "text-navy-foreground/85",
  },
  "blue-light": {
    bg: "bg-blue-light",
    text: "text-blue-light-foreground",
    subtle: "text-blue-light-foreground/85",
  },
  yellow: {
    bg: "bg-yellow",
    text: "text-yellow-foreground",
    subtle: "text-yellow-foreground/75",
  },
};

// Layout horizontal full-width estilo FUN Parque: 3 columnas
// - LEFT (cream bg): badge + título grande + requisitos + descripción + CTAs
// - CENTER: imagen alta de la actividad
// - RIGHT (color block rotativo): "Cómo funciona" con bullets
export function ActivityCard({ data }: { data: ActivityCardData }) {
  const variant = rightVariantClass[data.rightVariant ?? "blue"];

  return (
    <article
      className={cn(
        "relative grid gap-0 overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-soft",
        "lg:grid-cols-[1.1fr_1fr_0.95fr]",
      )}
    >
      {/* LEFT — fondo gris muy claro con título y descripción */}
      <div className="flex flex-col gap-6 bg-secondary p-8 text-foreground sm:p-12 lg:p-14 lg:min-h-[640px]">
        <span className="inline-flex w-fit items-center rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-foreground">
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
              "h-11 rounded-full bg-navy px-6 text-sm font-bold uppercase tracking-wider text-navy-foreground hover:bg-navy/90",
            )}
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full border-2 border-navy bg-transparent px-6 text-sm font-bold uppercase tracking-wider text-navy transition-colors hover:bg-navy hover:text-navy-foreground",
            )}
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* CENTER — imagen */}
      <div className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-auto lg:min-h-[640px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
        />
      </div>

      {/* RIGHT — Como funciona con bullets, color rotativo + pattern wavy */}
      <div
        className={cn(
          "relative flex flex-col gap-5 p-8 sm:p-12 lg:p-14 lg:min-h-[640px] bg-topo",
          variant.bg,
          variant.text,
        )}
      >
        <h4
          className={cn(
            "text-2xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-3xl",
            variant.text,
          )}
        >
          Cómo funciona
        </h4>

        <ul className={cn("space-y-3 text-sm leading-relaxed sm:text-base", variant.text)}>
          {data.details.map((d) => (
            <li key={d.id}>
              <p className="font-bold">{d.title}</p>
              <p className={cn("mt-1", variant.subtle)}>{d.content}</p>
            </li>
          ))}
        </ul>

        {data.included.length > 0 ? (
          <div className="mt-2">
            <p className={cn("text-xs font-extrabold uppercase tracking-wider", variant.text)}>
              Incluye
            </p>
            <p className={cn("mt-1 text-sm", variant.subtle)}>
              {data.included.join(" · ")}
            </p>
          </div>
        ) : null}

        {data.excluded.length > 0 ? (
          <div>
            <p className={cn("text-xs font-extrabold uppercase tracking-wider", variant.text)}>
              No incluye
            </p>
            <p className={cn("mt-1 text-sm", variant.subtle)}>
              {data.excluded.join(" · ")}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
