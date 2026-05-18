import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, Users } from "lucide-react";

import { CampaignReserveForm } from "@/components/campanas/CampaignReserveForm";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import {
  formatTimeRemaining,
  formatUsdFromCents,
  type PricingTier,
} from "@/lib/campaigns";
import type { Database } from "@/types/database";

type Json = Database["public"]["Tables"]["products"]["Row"]["attributes"];

type CampaignDetailRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image_url: string | null;
  moq: number;
  max_quantity: number | null;
  deposit_percentage: number;
  closes_at: string;
  estimated_arrival_at: string | null;
  status: Database["public"]["Enums"]["campaign_status"];
  return_policy: string | null;
  product:
    | {
        id: string;
        name: string;
        slug: string;
        short_description: string | null;
        long_description: string | null;
        main_image_url: string | null;
        additional_image_urls: string[];
        attributes: Json;
        brand: string | null;
      }
    | {
        id: string;
        name: string;
        slug: string;
        short_description: string | null;
        long_description: string | null;
        main_image_url: string | null;
        additional_image_urls: string[];
        attributes: Json;
        brand: string | null;
      }[]
    | null;
  pricing_tiers: PricingTier[];
};

async function getCampaignBySlug(slug: string) {
  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, title, description, hero_image_url,
      moq, max_quantity, deposit_percentage, closes_at, estimated_arrival_at,
      status, return_policy,
      product:products(
        id, name, slug, short_description, long_description,
        main_image_url, additional_image_urls, attributes, brand
      ),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("slug", slug)
    .maybeSingle()
    .returns<CampaignDetailRow | null>();

  if (error) {
    console.error("Error cargando campaña:", error);
    return null;
  }
  if (!campaign) return null;

  const { data: progress } = await supabase
    .from("campaign_progress_view")
    .select("*")
    .eq("campaign_id", campaign.id)
    .maybeSingle()
    .returns<
      Database["public"]["Views"]["campaign_progress_view"]["Row"] | null
    >();

  return {
    ...campaign,
    product: Array.isArray(campaign.product)
      ? campaign.product[0] ?? null
      : campaign.product,
    pricing_tiers: campaign.pricing_tiers ?? [],
    progress,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) {
    return { title: "Campaña no encontrada" };
  }
  return {
    title: campaign.title,
    description:
      campaign.description ??
      campaign.product?.short_description ??
      "Campaña de importación grupal en Mercado Nuestro.",
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const product = campaign.product;
  const reserved = campaign.progress?.reserved_quantity ?? 0;
  const moqPct = campaign.progress?.moq_progress_pct ?? 0;
  const secondsLeft = campaign.progress?.seconds_until_close ?? null;
  const sortedTiers = [...campaign.pricing_tiers].sort(
    (a, b) => a.tier_number - b.tier_number,
  );

  const heroImage =
    campaign.hero_image_url ?? product?.main_image_url ?? null;

  const productAttributes =
    product?.attributes && typeof product.attributes === "object"
      ? (product.attributes as Record<string, unknown>)
      : {};

  const attributeEntries = Object.entries(productAttributes).filter(
    ([, v]) => typeof v === "string" && v.length > 0,
  ) as [string, string][];

  return (
    <>
      <Container className="py-6">
        <Link
          href="/campanas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Todas las campañas
        </Link>
      </Container>

      <Container className="pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {campaign.title}
              </h1>
              {product?.name && product.name !== campaign.title ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.brand ? `${product.brand} · ` : ""}
                  {product.name}
                </p>
              ) : null}
              {campaign.description ? (
                <p className="mt-4 text-base text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}
            </div>

            <section className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight">
                Escalones de precio
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cuanto más se reserva, más baja el precio para todos. Al cerrar
                la campaña, todos pagan el mejor escalón alcanzado.
              </p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {sortedTiers.map((tier) => {
                  const isUnlocked = reserved >= tier.min_quantity;
                  return (
                    <li
                      key={tier.id}
                      className={[
                        "rounded-2xl border p-4 transition-colors",
                        isUnlocked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-card",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Escalón {tier.tier_number}
                        </span>
                        {isUnlocked ? (
                          <CheckCircle2
                            className="size-4 text-primary"
                            aria-label="Escalón alcanzado"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {formatUsdFromCents(tier.unit_price_cents_usd)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Desde {tier.min_quantity}
                        {tier.max_quantity
                          ? ` hasta ${tier.max_quantity} unidades`
                          : " unidades"}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>

            {product?.long_description ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">
                  Sobre el producto
                </h2>
                <p className="mt-3 whitespace-pre-line text-base text-muted-foreground">
                  {product.long_description}
                </p>
              </section>
            ) : null}

            {attributeEntries.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">
                  Características
                </h2>
                <dl className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
                  {attributeEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 sm:border-b sm:border-border/60 sm:pb-2 sm:last-of-type:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                    >
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {campaign.return_policy ? (
              <section className="mt-10 flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Política de devolución
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.return_policy}
                  </p>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" aria-hidden />
                  {reserved} reservadas / {campaign.moq} mín.
                </span>
                <span className="font-medium">{Math.round(moqPct)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, moqPct))}%`,
                  }}
                />
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" aria-hidden />
                Cierra en {formatTimeRemaining(secondsLeft)}
              </div>
              {campaign.estimated_arrival_at ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Llegada estimada:{" "}
                  {new Date(campaign.estimated_arrival_at).toLocaleDateString(
                    "es-UY",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </p>
              ) : null}
            </div>

            <CampaignReserveForm
              campaignSlug={campaign.slug}
              pricingTiers={sortedTiers}
              reservedQuantity={reserved}
              depositPercentage={campaign.deposit_percentage}
              maxQuantity={campaign.max_quantity}
              status={campaign.status}
            />
          </aside>
        </div>
      </Container>
    </>
  );
}
