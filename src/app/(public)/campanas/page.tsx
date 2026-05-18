import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { CampaignCard, type CampaignCardData } from "@/components/campanas/CampaignCard";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Forma del select con joins. La declaramos a mano porque nuestros tipos de DB
// no incluyen Relationships (cuando se generen vía CLI con --link, supabase-js
// inferirá esto automáticamente).
type CampaignSelectRow = {
  id: string;
  slug: string;
  title: string;
  hero_image_url: string | null;
  product:
    | { name: string; main_image_url: string | null }
    | { name: string; main_image_url: string | null }[]
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

// Revalidamos cada 60s en lugar de cada request: el listado público no necesita
// datos al segundo, y la barra de progreso se actualiza al entrar al detalle.
export const revalidate = 60;

async function getActiveCampaigns(): Promise<CampaignCardData[]> {
  const supabase = await createClient();

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      slug,
      title,
      hero_image_url,
      product:products(name, main_image_url),
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

  return campaigns.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    hero_image_url: c.hero_image_url,
    product: Array.isArray(c.product) ? c.product[0] ?? null : c.product,
    pricing_tiers: c.pricing_tiers ?? [],
    progress: progressByCampaign.get(c.id) ?? null,
  }));
}

export default async function CampanasPage() {
  const campaigns = await getActiveCampaigns();

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/30 via-background to-background">
        <Container className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Campañas activas
            </h1>
            <p className="mt-4 text-muted-foreground">
              Estos son los productos que estamos importando ahora. Reservá tu
              lugar con seña y pagás el saldo cuando se cierre la campaña al mejor
              precio alcanzado.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container>
          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-base font-medium">
                Todavía no hay campañas abiertas.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Estamos cerrando acuerdos con proveedores. Mientras tanto, leé{" "}
                <Link
                  href="/como-funciona"
                  className="font-medium text-primary hover:underline"
                >
                  cómo funciona el sistema
                </Link>{" "}
                para llegar listo.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
