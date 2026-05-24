import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";
import {
  CampaignRowCard,
  type CampaignRowCardData,
} from "@/components/campanas/CampaignRowCard";
import { CampaignsHero } from "@/components/campanas/CampaignsHero";
import { CampaignsTabsNav } from "@/components/campanas/CampaignsTabsNav";
import { fixMojibake } from "@/lib/encoding";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// ─── Page: /app/campanas ──────────────────────────────────────────────────────
// Listado de campañas activas de importación grupal. Estilo mockup mobile:
//   1. Tabs (Activas / Mis reservas / Cómo funciona)
//   2. Hero banner azul con 4 pasos
//   3. Grid 1 col mobile / 2 col desktop con CampaignRowCard
//   4. Footer trust con candado

// Forma del select con joins. Lo declaramos a mano porque nuestros tipos no
// incluyen Relationships todavía.
type CampaignSelectRow = {
  id: string;
  slug: string;
  title: string;
  hero_image_url: string | null;
  moq: number;
  deposit_percentage: number;
  estimated_arrival_at: string | null;
  product:
    | {
        name: string;
        main_image_url: string | null;
        category:
          | { name: string }
          | { name: string }[]
          | null;
      }
    | {
        name: string;
        main_image_url: string | null;
        category:
          | { name: string }
          | { name: string }[]
          | null;
      }[]
    | null;
  pricing_tiers:
    | Database["public"]["Tables"]["campaign_pricing_tiers"]["Row"][]
    | null;
};

export const metadata: Metadata = {
  title: "Campañas activas",
  description:
    "Sumate a las importaciones grupales abiertas. Reservá tu unidad antes del cierre y conseguí precios mayoristas.",
};

export const revalidate = 60;

async function getActiveCampaigns(): Promise<CampaignRowCardData[]> {
  const supabase = await createClient();

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      slug,
      title,
      hero_image_url,
      moq,
      deposit_percentage,
      estimated_arrival_at,
      product:products(
        name,
        main_image_url,
        category:categories(name)
      ),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("status", "activa")
    .order("closes_at", { ascending: true })
    .returns<CampaignSelectRow[]>();

  if (error) {
    console.error("Error cargando campañas activas:", error);
    return [];
  }

  if (!campaigns || campaigns.length === 0) return [];

  const ids = campaigns.map((c) => c.id);
  const { data: progress } = await supabase
    .from("campaign_progress_view")
    .select("*")
    .in("campaign_id", ids)
    .returns<Database["public"]["Views"]["campaign_progress_view"]["Row"][]>();

  const progressByCampaign = new Map(
    progress?.map((p) => [p.campaign_id, p]) ?? [],
  );

  return campaigns.map((c) => {
    const product = Array.isArray(c.product) ? c.product[0] : c.product;
    const category = product
      ? Array.isArray(product.category)
        ? product.category[0]
        : product.category
      : null;

    const prog = progressByCampaign.get(c.id);

    return {
      id: c.id,
      slug: c.slug,
      // Aplicar fixMojibake a TODOS los strings que vienen de DB con acentos,
      // no solo a category. El título "Cámara IP WiFi" venía como "CÃ¡mara IP".
      title: fixMojibake(c.title),
      category: category?.name ? fixMojibake(category.name) : null,
      imageUrl: c.hero_image_url ?? product?.main_image_url ?? null,
      pricingTiers: c.pricing_tiers ?? [],
      moq: c.moq,
      reservedQuantity: prog?.reserved_quantity ?? 0,
      moqProgressPct: prog?.moq_progress_pct ?? 0,
      secondsUntilClose: prog?.seconds_until_close ?? null,
      estimatedArrivalDate: c.estimated_arrival_at,
      depositPercentage: c.deposit_percentage,
    };
  });
}

export default async function CampanasPage() {
  const campaigns = await getActiveCampaigns();

  return (
    <div className="min-h-screen bg-neutral-gray-50">
      {/* Tabs sticky arriba */}
      <div className="sticky top-0 z-30">
        <CampaignsTabsNav />
      </div>

      <AppContainer className="py-5 sm:py-8">
        {/* Hero banner */}
        <CampaignsHero />

        {/* Listado */}
        <section className="mt-6 sm:mt-8">
          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center sm:p-16">
              <p className="text-lg font-extrabold text-neutral-gray-700">
                Estamos preparando las primeras campañas
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-neutral-gray-700/70">
                Mientras tanto, leé{" "}
                <Link
                  href="/app/campanas/como-funciona"
                  className="font-semibold text-brand-blue underline-offset-4 hover:underline"
                >
                  cómo funciona el sistema
                </Link>{" "}
                para llegar listo.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {campaigns.map((campaign) => (
                <CampaignRowCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </section>

        {/* Footer trust */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-xs text-neutral-gray-700/80 sm:text-sm">
          <ShieldCheck className="size-4 shrink-0 text-brand-blue" aria-hidden />
          <span>
            <strong className="font-bold text-brand-blue">Pagos seguros.</strong>{" "}
            Tu seña está protegida hasta que se complete la campaña.
          </span>
        </div>
      </AppContainer>
    </div>
  );
}
