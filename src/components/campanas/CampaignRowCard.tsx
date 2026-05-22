import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

import {
  findCurrentTier,
  formatTimeRemaining,
  formatUsdFromCents,
  type PricingTier,
  type CampaignProgress,
} from "@/lib/campaigns";

import { CampaignProgressBar } from "./CampaignProgressBar";

// ─── CampaignRowCard ──────────────────────────────────────────────────────────
// Card horizontal de campaña, estilo mockup mobile pero responsive:
//   - Mobile: imagen izquierda (square ~140px) + info derecha vertical
//   - Desktop: misma estructura pero más ancha, opcional 2 cols en el grid
//
// Estructura visual (de arriba a abajo, columna derecha):
//   1. Badge categoría (amarillo pill) — solo si hay categoría
//   2. Título producto (h3)
//   3. "Precio mejora al completar campaña" (eyebrow tiny)
//   4. Precio actual USD (grande) + "Desde USD X.XX" (best tier)
//   5. Stats: X/MOQ reservados + %
//   6. Barra de progreso con marker del próximo escalón
//   7. Footer: días restantes + fecha de llegada estimada
//   8. CTA: pill "Seña X%" + botón amarillo "Reservar"

export interface CampaignRowCardData {
  id: string;
  slug: string;
  title: string;
  /** Nombre de la categoría para el badge. Opcional. */
  category?: string | null;
  imageUrl: string | null;
  pricingTiers: PricingTier[];
  moq: number;
  reservedQuantity: number;
  /** % de avance al MOQ (0-100). Se calcula afuera o se pasa desde la view. */
  moqProgressPct: number;
  secondsUntilClose: number | null;
  estimatedArrivalDate: string | null;
  depositPercentage: number;
}

interface CampaignRowCardProps {
  campaign: CampaignRowCardData;
}

export function CampaignRowCard({ campaign }: CampaignRowCardProps) {
  const currentTier = findCurrentTier(
    campaign.pricingTiers,
    campaign.reservedQuantity,
  );

  // Mejor precio posible = el tier con el precio más bajo
  const bestTier = [...campaign.pricingTiers].sort(
    (a, b) => a.unit_price_cents_usd - b.unit_price_cents_usd,
  )[0];

  const arrivalLabel = campaign.estimatedArrivalDate
    ? new Intl.DateTimeFormat("es-UY", {
        day: "numeric",
        month: "long",
      }).format(new Date(campaign.estimatedArrivalDate))
    : null;

  const progressPct = Math.round(
    Math.min(100, (campaign.reservedQuantity / Math.max(1, campaign.moq)) * 100),
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-md">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {/* ════════ IMAGEN izquierda ════════ */}
        <Link
          href={`/app/campanas/${campaign.slug}`}
          className="relative block aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-gray-50 sm:w-36 lg:w-40"
        >
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              sizes="(max-width: 640px) 112px, 160px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-neutral-gray-300">
              Sin imagen
            </div>
          )}
        </Link>

        {/* ════════ INFO derecha ════════ */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Badge categoría */}
          {campaign.category && (
            <span className="inline-block w-fit rounded-md bg-brand-yellow px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-gray-700">
              {campaign.category}
            </span>
          )}

          {/* Título */}
          <Link
            href={`/app/campanas/${campaign.slug}`}
            className="transition-colors hover:text-brand-blue"
          >
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-gray-700 sm:text-base">
              {campaign.title}
            </h3>
          </Link>

          {/* Eyebrow + precio actual */}
          <div>
            <p className="text-[10px] text-neutral-gray-700/60 sm:text-xs">
              Precio actual · mejora si se llena
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-xl font-extrabold tracking-tight text-brand-blue-dark sm:text-2xl">
                {currentTier
                  ? formatUsdFromCents(currentTier.unit_price_cents_usd)
                  : "—"}
              </p>
              {bestTier &&
                currentTier &&
                bestTier.id !== currentTier.id && (
                  <span className="text-[10px] text-neutral-gray-700/60 sm:text-xs">
                    puede bajar a{" "}
                    <span className="font-bold text-emerald-600">
                      {formatUsdFromCents(bestTier.unit_price_cents_usd)}
                    </span>
                  </span>
                )}
            </div>
          </div>

          {/* Stats + barra de progreso */}
          <div className="mt-1">
            <div className="mb-1.5 flex items-baseline justify-between text-[11px] sm:text-xs">
              <span className="font-medium text-neutral-gray-700">
                <span className="font-bold">{campaign.reservedQuantity}</span>
                <span className="text-neutral-gray-700/60">/{campaign.moq}</span>{" "}
                reservados
              </span>
              <span className="font-extrabold text-emerald-600">
                {progressPct}%
              </span>
            </div>
            <CampaignProgressBar
              reserved={campaign.reservedQuantity}
              moq={campaign.moq}
              pricingTiers={campaign.pricingTiers}
            />
          </div>

          {/* Footer: clock + calendar + CTA */}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-neutral-gray-700/70 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden />
              {formatTimeRemaining(campaign.secondsUntilClose)} restantes
            </span>
            {arrivalLabel && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" aria-hidden />
                Llegada estimada {arrivalLabel}
              </span>
            )}
          </div>

          {/* CTA: Seña pill + botón Reservar */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-block rounded-full bg-brand-blue/10 px-2.5 py-1 text-[10px] font-bold text-brand-blue sm:text-xs">
              Seña {campaign.depositPercentage}%
            </span>
            <Link
              href={`/app/campanas/${campaign.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-brand-yellow px-5 py-2 text-xs font-extrabold text-neutral-gray-700 transition-colors hover:bg-brand-yellow/90 sm:text-sm"
            >
              Reservar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
