import {
  findCurrentTier,
  findNextTier,
  formatUsdFromCents,
  type PricingTier,
} from "@/lib/campaigns";

// ─── CampaignProgressBar ──────────────────────────────────────────────────────
// Barra de progreso "rich" con marcadores de cada escalón de precio.
// Pieza central de la card de campaña: en un vistazo el usuario ve
//   1) cuánto se reservó vs el objetivo (MOQ)
//   2) DÓNDE van a estar los próximos escalones de precio
//   3) cuánto falta para que baje el próximo
//
// Cada marker es un círculo en su `min_quantity` correspondiente, etiquetado
// con el precio que se desbloquea al cruzarla.
//
// IMPORTANTE: "próximo escalón" = el escalón con mejor precio que viene
// después del escalón vigente. NO el primer escalón futuro cualquiera,
// porque cuando reserved=0 y los escalones empiezan en 1, el escalón "actual"
// y el "próximo" serían el mismo (tier 1) — eso confundía al usuario.

interface CampaignProgressBarProps {
  reserved: number;
  moq: number;
  pricingTiers: PricingTier[];
  /** Mostrar etiquetas de precio arriba de cada marcador. Default true. */
  showLabels?: boolean;
}

export function CampaignProgressBar({
  reserved,
  moq,
  pricingTiers,
  showLabels = true,
}: CampaignProgressBarProps) {
  const sortedTiers = [...pricingTiers].sort(
    (a, b) => a.min_quantity - b.min_quantity,
  );

  // El "techo" de la barra es el max entre MOQ y el último tier min_quantity,
  // así si hay escalones más allá del MOQ se ven en la misma barra.
  const lastTierStart = sortedTiers.length
    ? sortedTiers[sortedTiers.length - 1].min_quantity
    : 0;
  const scaleMax = Math.max(moq, lastTierStart, 1);

  const reservedPct = Math.min(100, (reserved / scaleMax) * 100);
  const moqPct = Math.min(100, (moq / scaleMax) * 100);

  // Usar findCurrentTier + findNextTier (orden por tier_number) en vez de
  // buscar "el primer min_quantity > reserved" que tenía bugs cuando el
  // escalón 1 empezaba en 1 y reserved era 0.
  const currentTier = findCurrentTier(sortedTiers, reserved);
  const nextTier = findNextTier(sortedTiers, reserved);

  return (
    <div className="w-full">
      {/* Etiqueta de precio del PRÓXIMO escalón arriba de la barra,
          posicionada en el min_quantity de ese escalón. Solo se muestra
          si hay un próximo escalón real (no si ya estamos en el último). */}
      {showLabels && nextTier && (
        <div className="relative mb-1.5 h-4">
          <div
            className="absolute -translate-x-1/2"
            style={{
              left: `${Math.min(100, (nextTier.min_quantity / scaleMax) * 100)}%`,
            }}
          >
            <span className="inline-block whitespace-nowrap rounded-full bg-brand-yellow px-1.5 py-0.5 text-[9px] font-extrabold text-neutral-gray-700">
              {formatUsdFromCents(nextTier.unit_price_cents_usd)}
            </span>
          </div>
        </div>
      )}

      {/* Barra de fondo */}
      <div className="relative h-2 w-full overflow-visible rounded-full bg-neutral-gray-50">
        {/* Tramo cubierto = verde */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${reservedPct}%` }}
        />

        {/* Línea vertical MOQ — el "objetivo" principal */}
        {moq > 0 && moqPct < 100 && (
          <div
            className="absolute -top-1 h-4 w-px bg-neutral-gray-300"
            style={{ left: `${moqPct}%` }}
          />
        )}

        {/* Markers de cada escalón. El "actual" (donde estamos parados)
            se marca distinto del "próximo" y del resto. */}
        {sortedTiers.map((tier) => {
          const tierPct = Math.min(100, (tier.min_quantity / scaleMax) * 100);
          const isReached = reserved >= tier.min_quantity;
          const isCurrent = currentTier?.id === tier.id;
          const isNext = nextTier?.id === tier.id;
          return (
            <div
              key={tier.id}
              className={`absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${
                isReached
                  ? "bg-emerald-500"
                  : isNext
                    ? "animate-pulse bg-brand-yellow"
                    : isCurrent
                      ? "bg-brand-blue"
                      : "bg-neutral-gray-300"
              }`}
              style={{ left: `${tierPct}%` }}
              aria-label={`Escalón ${tier.tier_number}: a partir de ${tier.min_quantity} unidades, precio ${formatUsdFromCents(tier.unit_price_cents_usd)}`}
              title={`Al llegar a ${tier.min_quantity} ${
                tier.min_quantity === 1 ? "unidad" : "unidades"
              } el precio pasa a ${formatUsdFromCents(tier.unit_price_cents_usd)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
