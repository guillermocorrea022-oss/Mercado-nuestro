import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { CloseCampaignButton } from "@/components/admin/CloseCampaignButton";
import { ExtendCampaignButton } from "@/components/admin/ExtendCampaignButton";
import { buttonVariants } from "@/components/ui/button";
import {
  formatTimeRemaining,
  formatUsdFromCents,
  findCurrentTier,
  type PricingTier,
} from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Campañas · Admin",
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["campaign_status"],
  string
> = {
  borrador: "bg-muted text-muted-foreground",
  activa: "bg-primary/10 text-primary",
  cerrada_exitosa: "bg-primary/10 text-primary",
  cerrada_fallida: "bg-destructive/10 text-destructive",
  en_proceso: "bg-accent text-accent-foreground",
  entregada: "bg-primary/10 text-primary",
  finalizada: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive/10 text-destructive",
};

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  moq: number;
  closes_at: string;
  status: Database["public"]["Enums"]["campaign_status"];
  extended_once: boolean;
  product: { name: string } | { name: string }[] | null;
  pricing_tiers: PricingTier[];
};

export default async function AdminCampanasPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, title, moq, closes_at, status, extended_once,
      product:products(name),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .order("created_at", { ascending: false })
    .returns<CampaignRow[]>();

  const list = campaigns ?? [];

  // Para mostrar progreso al MOQ, leemos la vista por separado.
  const ids = list.map((c) => c.id);
  const progressMap = new Map<
    string,
    Database["public"]["Views"]["campaign_progress_view"]["Row"]
  >();
  if (ids.length > 0) {
    const { data: progress } = await supabase
      .from("campaign_progress_view")
      .select("*")
      .in("campaign_id", ids)
      .returns<
        Database["public"]["Views"]["campaign_progress_view"]["Row"][]
      >();
    for (const p of progress ?? []) {
      if (p.campaign_id) progressMap.set(p.campaign_id, p);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Campañas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Vista de todas las campañas (todos los estados).
          </p>
        </div>
        <Link
          href="/admin/campanas/nueva"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Crear campaña
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay campañas todavía.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaña</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Progreso</th>
                <th className="px-4 py-3 font-medium">Cierra en</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((c) => {
                const product = Array.isArray(c.product)
                  ? c.product[0]
                  : c.product;
                const progress = progressMap.get(c.id);
                const reserved = progress?.reserved_quantity ?? 0;
                const moqPct = progress?.moq_progress_pct ?? 0;
                const secondsLeft = progress?.seconds_until_close ?? null;
                const currentTier = findCurrentTier(c.pricing_tiers, reserved);
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {product?.name}
                      </div>
                      {currentTier ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Escalón actual:{" "}
                          {formatUsdFromCents(currentTier.unit_price_cents_usd)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLES[c.status],
                        )}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        {reserved} / {c.moq} · {Math.round(moqPct)}%
                      </div>
                      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, Math.max(0, moqPct))}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.status === "activa"
                        ? formatTimeRemaining(secondsLeft)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/campanas/${c.slug}`}
                          target="_blank"
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "gap-1.5",
                          )}
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                          Ver
                        </Link>
                        {c.status === "activa" ? (
                          <>
                            <ExtendCampaignButton
                              campaignId={c.id}
                              currentClosesAt={c.closes_at}
                              extendedOnce={c.extended_once}
                            />
                            <CloseCampaignButton
                              campaignId={c.id}
                              campaignTitle={c.title}
                            />
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
