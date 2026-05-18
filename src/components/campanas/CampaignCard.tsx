import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, TrendingDown, Users } from "lucide-react";

import {
  findCurrentTier,
  findNextTier,
  formatTimeRemaining,
  formatUsdFromCents,
  unitsUntilNextTier,
  type CampaignProgress,
  type PricingTier,
} from "@/lib/campaigns";

export interface CampaignCardData {
  id: string;
  slug: string;
  title: string;
  hero_image_url: string | null;
  product: {
    name: string;
    main_image_url: string | null;
  } | null;
  pricing_tiers: PricingTier[];
  progress: CampaignProgress | null;
}

interface CampaignCardProps {
  campaign: CampaignCardData;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const reserved = campaign.progress?.reserved_quantity ?? 0;
  const currentTier = findCurrentTier(campaign.pricing_tiers, reserved);
  const nextTier = findNextTier(campaign.pricing_tiers, reserved);
  const unitsUntilNext = unitsUntilNextTier(campaign.pricing_tiers, reserved);
  const moqPct = campaign.progress?.moq_progress_pct ?? 0;
  const secondsLeft = campaign.progress?.seconds_until_close ?? null;

  const imageUrl =
    campaign.hero_image_url ?? campaign.product?.main_image_url ?? null;

  return (
    <Link
      href={`/campanas/${campaign.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={campaign.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
            Sin imagen
          </div>
        )}

        {/* Overlay sutil hacia abajo */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent"
        />

        {/* Countdown pill */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
          <Clock className="size-3.5" aria-hidden />
          {formatTimeRemaining(secondsLeft)}
        </div>

        {/* Arrow chip de hover */}
        <div className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
            {campaign.title}
          </h3>
          {campaign.product?.name && campaign.product.name !== campaign.title ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {campaign.product.name}
            </p>
          ) : null}
        </div>

        {currentTier ? (
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">desde</p>
              <p className="mt-0.5 text-3xl font-semibold tracking-tight">
                {formatUsdFromCents(currentTier.unit_price_cents_usd)}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">por unidad</span>
          </div>
        ) : null}

        {nextTier && unitsUntilNext !== null && unitsUntilNext > 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary">
            <TrendingDown className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="leading-relaxed">
              Faltan{" "}
              <strong className="font-semibold">{unitsUntilNext}</strong>{" "}
              {unitsUntilNext === 1 ? "unidad" : "unidades"} para bajar a{" "}
              <strong className="font-semibold">
                {formatUsdFromCents(nextTier.unit_price_cents_usd)}
              </strong>
            </span>
          </div>
        ) : null}

        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-3.5" aria-hidden />
              {reserved} reservadas
            </span>
            <span className="font-medium">{Math.round(moqPct)}% del mínimo</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, moqPct))}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
