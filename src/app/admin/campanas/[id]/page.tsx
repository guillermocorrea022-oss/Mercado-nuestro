import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EyeOff, MessageSquare } from "lucide-react";

import { CreateStatusUpdateForm } from "@/components/admin/CreateStatusUpdateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatUsdFromCents } from "@/lib/campaigns";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Detalle campaña · Admin",
};

type CampaignAdminRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: Database["public"]["Enums"]["campaign_status"];
  moq: number;
  max_quantity: number | null;
  deposit_percentage: number;
  closes_at: string;
  estimated_arrival_at: string | null;
  product: { name: string } | { name: string }[] | null;
  pricing_tiers:
    | Database["public"]["Tables"]["campaign_pricing_tiers"]["Row"][]
    | null;
};

type StatusUpdateRow =
  Database["public"]["Tables"]["campaign_status_updates"]["Row"];

export default async function AdminCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, title, description, status, moq, max_quantity,
      deposit_percentage, closes_at, estimated_arrival_at,
      product:products(name),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("id", id)
    .maybeSingle()
    .returns<CampaignAdminRow | null>();

  if (!campaign) notFound();

  const { data: updates } = await supabase
    .from("campaign_status_updates")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false })
    .returns<StatusUpdateRow[]>();

  const product = Array.isArray(campaign.product)
    ? campaign.product[0]
    : campaign.product;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <Link
        href="/admin/campanas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            {campaign.status.replace("_", " ")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {campaign.title}
          </h1>
          {product ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Producto: {product.name}
            </p>
          ) : null}
        </div>
        <Link
          href={`/app/campanas/${campaign.slug}`}
          target="_blank"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver página pública →
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">MOQ:</span> {campaign.moq}
              </p>
              <p>
                <span className="text-muted-foreground">Cupo máximo:</span>{" "}
                {campaign.max_quantity ?? "Sin tope"}
              </p>
              <p>
                <span className="text-muted-foreground">% Seña:</span>{" "}
                {campaign.deposit_percentage}%
              </p>
              <p>
                <span className="text-muted-foreground">Cierra:</span>{" "}
                {new Date(campaign.closes_at).toLocaleString("es-UY")}
              </p>
              {campaign.estimated_arrival_at ? (
                <p>
                  <span className="text-muted-foreground">Llegada estimada:</span>{" "}
                  {new Date(campaign.estimated_arrival_at).toLocaleDateString(
                    "es-UY",
                  )}
                </p>
              ) : null}
              {campaign.description ? (
                <p className="mt-3 text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Escalones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(campaign.pricing_tiers ?? [])
                  .sort((a, b) => a.tier_number - b.tier_number)
                  .map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <span>
                        Escalón {t.tier_number}: de {t.min_quantity}
                        {t.max_quantity ? ` a ${t.max_quantity}` : "+"} unidades
                      </span>
                      <span className="font-semibold">
                        {formatUsdFromCents(t.unit_price_cents_usd)}
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Historial de actualizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(updates ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no publicaste ninguna actualización.
                </p>
              ) : (
                <ul className="space-y-4">
                  {(updates ?? []).map((u) => (
                    <li
                      key={u.id}
                      className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <MessageSquare
                        className="mt-1 size-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {u.type.replace(/_/g, " ")} ·{" "}
                          {new Date(u.created_at).toLocaleString("es-UY")}
                        </p>
                        <p className="mt-1 text-sm">{u.description}</p>
                        {!u.visible_to_users ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <EyeOff className="size-3" aria-hidden />
                            Solo visible para admins
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publicar actualización</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateStatusUpdateForm campaignId={campaign.id} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
