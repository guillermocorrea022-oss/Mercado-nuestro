"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { AppContainer } from "@/components/layout/AppContainer";

import { AddToCartDialog } from "./AddToCartDialog";

// ─── CampaignsAndFeaturedSplit ────────────────────────────────────────────────
// Sección dividida 50/50 que combina las DOS líneas de negocio principales de
// Mercado Nuestro en un solo bloque visual:
//
//   IZQUIERDA → 3 campañas de importación activas (mundo Campañas)
//   DERECHA   → 3 productos destacados disponibles (mundo Mercado Nuestro)
//
// Es la sección "elevator pitch" de la home: en un solo vistazo el usuario
// entiende los dos modelos. Va ARRIBA de "Imperdibles" / FlashDeals.
//
// Cada lado tiene:
//   - Title + subtítulo
//   - Link "Ver todas/todos" arriba a la derecha
//   - 3 cards horizontales con foto + datos + CTA
//
// Por ahora recibe mock data. Cuando se conecten queries reales, intercambiar.

export type SplitCampaignCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Precio actual en USD con decimales (ej: 79.99) */
  priceUsd: number;
  /** Cuántas unidades se necesitan para que la campaña arranque */
  goalUnits: number;
  /** Porcentaje 0-100 al MOQ */
  progressPct: number;
  /** Días que quedan hasta el cierre */
  daysLeft: number;
};

export type SplitFeaturedCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Precio en UYU con miles separados (ej: 15990) — se formatea al mostrar */
  priceUyu: number;
  inStock: boolean;
};

interface CampaignsAndFeaturedSplitProps {
  campaigns: SplitCampaignCard[];
  featured: SplitFeaturedCard[];
}

export function CampaignsAndFeaturedSplit({
  campaigns,
  featured,
}: CampaignsAndFeaturedSplitProps) {
  if (campaigns.length === 0 && featured.length === 0) return null;

  return (
    <section className="bg-neutral-gray-50 py-8 sm:py-12">
      <AppContainer>
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* ════════ IZQUIERDA — Campañas de importación ════════ */}
          {campaigns.length > 0 && (
            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <header className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-neutral-gray-700 sm:text-xl">
                    Campañas de importación
                  </h2>
                  <p className="mt-1 text-xs text-neutral-gray-700/70 sm:text-sm">
                    Sumate al grupo y pagá precio mayorista.
                  </p>
                </div>
                <Link
                  href="/app/campanas"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-blue hover:underline sm:text-sm"
                >
                  Ver todas
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </header>

              {/* Mobile: flex carousel con scroll horizontal + snap CONTENIDO
                  dentro del container blanco (no desborda la página).
                  Desktop (sm+): grid 3 columnas. */}
              <div className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {campaigns.slice(0, 3).map((c) => (
                  <CampaignMiniCard key={c.id} campaign={c} />
                ))}
              </div>
            </div>
          )}

          {/* ════════ DERECHA — Destacados Mercado Nuestro ════════ */}
          {featured.length > 0 && (
            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <header className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-neutral-gray-700 sm:text-xl">
                    Destacados de Mercado Nuestro
                  </h2>
                  <p className="mt-1 text-xs text-neutral-gray-700/70 sm:text-sm">
                    Stock disponible en Uruguay. Lo recibís rápido.
                  </p>
                </div>
                <Link
                  href="/app/marketplace?q=."
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-blue hover:underline sm:text-sm"
                >
                  Ver todos
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </header>

              {/* Mobile: flex carousel con scroll horizontal + snap CONTENIDO
                  dentro del container blanco (no desborda la página).
                  Desktop (sm+): grid 3 columnas. */}
              <div className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {featured.slice(0, 3).map((f) => (
                  <FeaturedMiniCard key={f.id} item={f} />
                ))}
              </div>
            </div>
          )}
        </div>
      </AppContainer>
    </section>
  );
}

// ─── CampaignMiniCard ─────────────────────────────────────────────────────────
// Card chica para una campaña: foto + nombre + precio + progreso + botón Reservar.

function CampaignMiniCard({ campaign }: { campaign: SplitCampaignCard }) {
  return (
    // Mobile: ancho fijo + snap-start para carousel; sm+: w-auto en el grid.
    <article className="group flex h-full w-[calc(50%-6px)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-md sm:w-auto sm:shrink">
      <Link
        href={`/app/campanas/${campaign.slug}`}
        className="relative block aspect-square overflow-hidden bg-neutral-gray-50"
      >
        <Image
          src={campaign.image}
          alt={campaign.name}
          fill
          sizes="(max-width: 640px) 100vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Título — alto fijo de 2 líneas para que todas las cards arranquen
            igual aunque el nombre sea de 1 o 2 líneas. */}
        <Link
          href={`/app/campanas/${campaign.slug}`}
          className="transition-colors hover:text-brand-blue"
        >
          <h3 className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-neutral-gray-700">
            {campaign.name}
          </h3>
        </Link>
        <p className="text-base font-extrabold tracking-tight text-brand-blue-dark">
          USD {campaign.priceUsd.toFixed(2)}
        </p>
        <p className="text-[10px] text-neutral-gray-700/70">
          Objetivo: {campaign.goalUnits} unidades
        </p>

        {/* Barra de progreso */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-gray-50">
            <div
              className={`h-full rounded-full transition-all ${
                campaign.progressPct >= 70
                  ? "bg-emerald-500"
                  : campaign.progressPct >= 40
                    ? "bg-brand-yellow"
                    : "bg-brand-blue"
              }`}
              style={{ width: `${Math.min(campaign.progressPct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-neutral-gray-700">
            {campaign.progressPct}%
          </span>
        </div>

        <p className="text-[10px] text-neutral-gray-700/70">
          Quedan {campaign.daysLeft}{" "}
          {campaign.daysLeft === 1 ? "día" : "días"}
        </p>

        {/* Botón anclado al fondo con mt-auto — todos los botones alineados
            en la misma línea, independientemente del contenido de arriba. */}
        <Link
          href={`/app/campanas/${campaign.slug}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-3 py-1.5 text-[11px] font-bold text-neutral-gray-700 transition-colors hover:bg-brand-yellow/90"
        >
          Reservar
        </Link>
      </div>
    </article>
  );
}

// ─── FeaturedMiniCard ─────────────────────────────────────────────────────────
// Card chica para un producto destacado (stock disponible): foto + nombre +
// precio UYU + badge "En stock" + botón "Agregar al carrito" (abre modal).

function FeaturedMiniCard({ item }: { item: SplitFeaturedCard }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {/* Mobile: ancho fijo + snap-start para carousel; sm+: w-auto en el grid. */}
      <article className="group flex h-full w-[calc(50%-6px)] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-md sm:w-auto sm:shrink">
        <Link
          href={`/app/marketplace/${item.slug}`}
          className="relative block aspect-square overflow-hidden bg-neutral-gray-50"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-3">
          {/* Título — alto fijo de 2 líneas, igual que CampaignMiniCard. */}
          <Link
            href={`/app/marketplace/${item.slug}`}
            className="transition-colors hover:text-brand-blue"
          >
            <h3 className="line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-neutral-gray-700">
              {item.name}
            </h3>
          </Link>

          <div className="flex items-baseline justify-between gap-2">
            <p className="text-base font-extrabold tracking-tight text-brand-blue-dark">
              UYU {formatUyu(item.priceUyu)}
            </p>
            {item.inStock ? (
              <span className="text-[10px] font-bold text-emerald-600">
                En stock
              </span>
            ) : null}
          </div>

          {/* Botón anclado al fondo con mt-auto — alineado con el botón
              Reservar de las cards de campañas a la izquierda. */}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={!item.inStock}
            className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-blue px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="size-3" aria-hidden />
            Agregar al carrito
          </button>
        </div>
      </article>

      <AddToCartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={{
          id: item.id,
          name: item.name,
          image: item.image,
          // Convertimos UYU a "centavos" para que el modal pueda multiplicar.
          // El modal usa formatPrice en USD; acá lo dejamos en UYU para el visual.
          priceCents: item.priceUyu * 100,
        }}
      />
    </>
  );
}

// Formato 15990 → "15.990" (es-UY usa "." como separador de miles)
function formatUyu(value: number) {
  return new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
