"use client";

import { Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  findCurrentTier,
  findNextTier,
  formatUsdFromCents,
  type PricingTier,
} from "@/lib/campaigns";
import { cn } from "@/lib/utils";

interface CampaignReserveFormProps {
  campaignSlug: string;
  pricingTiers: PricingTier[];
  reservedQuantity: number;
  depositPercentage: number;
  maxQuantity: number | null;
  status: string;
}

export function CampaignReserveForm({
  campaignSlug,
  pricingTiers,
  reservedQuantity,
  depositPercentage,
  maxQuantity,
  status,
}: CampaignReserveFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Tier vigente según el total alcanzado SI sumamos las unidades que el
  // usuario está por reservar. Esto es el precio que el sistema mostraría
  // como referencia "actual"; al cerrar, el precio final puede ser mejor
  // si la campaña sigue subiendo.
  const projectedTotal = reservedQuantity + quantity;
  const projectedTier = findCurrentTier(pricingTiers, projectedTotal);
  const nextTier = findNextTier(pricingTiers, projectedTotal);

  if (!projectedTier) {
    return null;
  }

  const unitPriceCents = projectedTier.unit_price_cents_usd;
  const totalCents = unitPriceCents * quantity;
  const depositCents = Math.round((totalCents * depositPercentage) / 100);
  const balanceCents = totalCents - depositCents;

  const upperBound = maxQuantity
    ? Math.max(1, maxQuantity - reservedQuantity)
    : 99;
  const canDecrement = quantity > 1;
  const canIncrement = quantity < upperBound;
  const isClosed = status !== "activa";

  function handleReserve() {
    startTransition(() => {
      // TODO(auth): cuando esté implementado registro/login, esto debería
      // ir a /checkout/campana/[slug]?quantity=... y exigir sesión.
      window.location.href = `/login?next=/campanas/${encodeURIComponent(
        campaignSlug,
      )}/reservar?quantity=${quantity}`;
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-3xl font-semibold tracking-tight">
          {formatUsdFromCents(unitPriceCents)}
        </span>
        <span className="text-sm text-muted-foreground">por unidad</span>
      </div>

      {nextTier ? (
        <p className="mt-2 text-xs text-primary">
          Si se reservan {nextTier.min_quantity - projectedTotal} unidad(es) más,
          baja a {formatUsdFromCents(nextTier.unit_price_cents_usd)} para todos.
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Ya estás en el mejor escalón de precio.
        </p>
      )}

      <div className="mt-6">
        <label
          htmlFor="quantity-input"
          className="text-sm font-medium text-foreground"
        >
          Cantidad a reservar
        </label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => canDecrement && setQuantity((q) => q - 1)}
            disabled={!canDecrement || isClosed}
            className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Restar uno"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <input
            id="quantity-input"
            type="number"
            min={1}
            max={upperBound}
            value={quantity}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              if (Number.isNaN(next)) {
                setQuantity(1);
                return;
              }
              setQuantity(Math.min(upperBound, Math.max(1, next)));
            }}
            disabled={isClosed}
            className="h-10 w-20 rounded-lg border border-border bg-background text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => canIncrement && setQuantity((q) => q + 1)}
            disabled={!canIncrement || isClosed}
            className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Sumar uno"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <dl className="mt-6 space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Precio actual estimado</dt>
          <dd className="font-medium">{formatUsdFromCents(totalCents)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Seña ahora ({depositPercentage}%)
          </dt>
          <dd className="font-semibold text-primary">
            {formatUsdFromCents(depositCents)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Saldo al cierre</dt>
          <dd className="font-medium">{formatUsdFromCents(balanceCents)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={handleReserve}
        disabled={isClosed || isPending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 h-12 w-full text-base",
        )}
      >
        {isClosed
          ? "Campaña cerrada"
          : isPending
            ? "Yendo al checkout..."
            : "Reservar con seña"}
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Podés cancelar hasta 72 hs antes del cierre y recuperás la seña.
      </p>
    </div>
  );
}
