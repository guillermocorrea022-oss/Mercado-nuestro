// Helpers de campañas: formato de precios, cálculo de escalones y tiempos.
// Toda la lógica de negocio sensible (cierre, ajustes retroactivos) vive en
// server actions o triggers SQL; estos helpers son solo de presentación.

import type { Database } from "@/types/database";

export type PricingTier =
  Database["public"]["Tables"]["campaign_pricing_tiers"]["Row"];

export type CampaignProgress =
  Database["public"]["Views"]["campaign_progress_view"]["Row"];

// Convierte centavos USD a string con formato es-UY (USD 92, USD 1.250).
export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// Tiempo restante hasta el cierre en formato compacto para mostrar en tarjetas.
// Ej: "3 días", "5 hs", "23 min", "Cerrada".
export function formatTimeRemaining(secondsUntilClose: number | null): string {
  if (secondsUntilClose === null || secondsUntilClose <= 0) return "Cerrada";
  const days = Math.floor(secondsUntilClose / 86400);
  if (days >= 1) return `${days} ${days === 1 ? "día" : "días"}`;
  const hours = Math.floor(secondsUntilClose / 3600);
  if (hours >= 1) return `${hours} hs`;
  const minutes = Math.floor(secondsUntilClose / 60);
  return `${minutes} min`;
}

// Dada la cantidad reservada actual, encuentra el escalón vigente.
// Si todavía no se alcanzó el primer escalón, devuelve el primero.
export function findCurrentTier(
  tiers: PricingTier[],
  reservedQuantity: number,
): PricingTier | null {
  if (tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.tier_number - b.tier_number);

  for (const tier of sorted) {
    const inRange =
      reservedQuantity >= tier.min_quantity &&
      (tier.max_quantity === null || reservedQuantity <= tier.max_quantity);
    if (inRange) return tier;
  }

  // Si la cantidad reservada todavía no alcanzó el primer escalón, devolvemos
  // el escalón 1 (lo que paga la gente si cierra con baja cantidad).
  return sorted[0];
}

// Devuelve el próximo escalón con mejor precio, o null si ya estamos en el último.
export function findNextTier(
  tiers: PricingTier[],
  reservedQuantity: number,
): PricingTier | null {
  const sorted = [...tiers].sort((a, b) => a.tier_number - b.tier_number);
  const current = findCurrentTier(sorted, reservedQuantity);
  if (!current) return null;
  const idx = sorted.findIndex((t) => t.id === current.id);
  return sorted[idx + 1] ?? null;
}

// Unidades que faltan para llegar al próximo escalón. null si no hay próximo.
export function unitsUntilNextTier(
  tiers: PricingTier[],
  reservedQuantity: number,
): number | null {
  const next = findNextTier(tiers, reservedQuantity);
  if (!next) return null;
  return Math.max(0, next.min_quantity - reservedQuantity);
}
