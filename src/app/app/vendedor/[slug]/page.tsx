import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Sparkles, Star, Users } from "lucide-react";

import {
  CampaignCard,
  type CampaignCardData,
} from "@/components/campanas/CampaignCard";
import { ShareButton } from "@/components/campanas/ShareButton";
import { AppContainer } from "@/components/layout/AppContainer";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const revalidate = 60;

type SellerRow = Database["public"]["Tables"]["seller_profiles"]["Row"];
type FeaturedCampaignRow = {
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

type SellerReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  user: { first_name: string | null } | { first_name: string | null }[] | null;
  order:
    | { seller_id: string; listing: { product: { name: string } | { name: string }[] | null } | { product: { name: string } | { name: string }[] | null }[] | null }
    | { seller_id: string; listing: { product: { name: string } | { name: string }[] | null } | { product: { name: string } | { name: string }[] | null }[] | null }[]
    | null;
};

async function getSeller(slug: string) {
  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
    .returns<SellerRow | null>();
  if (!seller) return null;

  // Reseñas hechas a este vendedor (a través de marketplace_orders).
  const { data: reviewsRaw } = await supabase
    .from("marketplace_listing_reviews")
    .select(
      `
      id, rating, body, created_at,
      user:profiles!marketplace_listing_reviews_user_id_fkey(first_name),
      order:marketplace_orders!marketplace_listing_reviews_order_id_fkey(
        seller_id,
        listing:marketplace_listings!marketplace_orders_listing_id_fkey(
          product:products(name)
        )
      )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<SellerReviewRow[]>();
  const sellerReviews = (reviewsRaw ?? []).filter((r) => {
    const o = Array.isArray(r.order) ? r.order[0] : r.order;
    return o?.seller_id === seller.user_id;
  });

  // Campañas activas (mismo set que el listado público — el vendedor
  // distribuye TODAS las campañas activas de la plataforma).
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, title, hero_image_url,
      product:products(name, main_image_url),
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("status", "activa")
    .order("closes_at", { ascending: true })
    .limit(6)
    .returns<FeaturedCampaignRow[]>();

  const ids = (campaigns ?? []).map((c) => c.id);
  let progressByCampaign = new Map<
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
      if (p.campaign_id) progressByCampaign.set(p.campaign_id, p);
    }
  }

  const featuredCampaigns: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    hero_image_url: c.hero_image_url,
    product: Array.isArray(c.product) ? c.product[0] ?? null : c.product,
    pricing_tiers: c.pricing_tiers ?? [],
    progress: progressByCampaign.get(c.id) ?? null,
  }));

  return { seller, featuredCampaigns, sellerReviews };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSeller(slug);
  if (!result) return { title: "Vendedor no encontrado" };
  return {
    title: `${result.seller.display_name} · Mercado Nuestro`,
    description:
      result.seller.bio ??
      `Catálogo de ${result.seller.display_name} en Mercado Nuestro.`,
  };
}

export default async function VendedorCatalogoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSeller(slug);
  if (!result) notFound();
  const { seller, featuredCampaigns, sellerReviews } = result;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />

        <AppContainer className="py-20 sm:py-24">
          <Reveal>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
                  {seller.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="size-3.5" aria-hidden />
                    Vendedora/or por catálogo
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                    {seller.display_name}
                  </h1>
                  {seller.bio ? (
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                      {seller.bio}
                    </p>
                  ) : null}
                </div>
              </div>
              <ShareButton
                url={`/v/${seller.slug}`}
                title={`${seller.display_name} en Mercado Nuestro`}
                prefilledMessage={`Mirá el catálogo de ${seller.display_name} en Mercado Nuestro:`}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" aria-hidden />
                {seller.total_sales} ventas
              </span>
              {seller.rating_avg > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Star
                    className="size-4 fill-primary text-primary"
                    aria-hidden
                  />
                  {seller.rating_avg.toFixed(1)} de calificación
                </span>
              ) : null}
              <span>
                Desde{" "}
                {new Date(seller.joined_at).toLocaleDateString("es-UY", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </Reveal>
        </AppContainer>
      </section>

      <section className="py-16 sm:py-20">
        <AppContainer>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Campañas activas
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Lo que está importando ahora
            </h2>
          </Reveal>

          {featuredCampaigns.length === 0 ? (
            <Reveal delay={0.1}>
              <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
                <p className="text-base font-medium">
                  Por ahora no hay campañas activas
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Volvé en unos días, abrimos nuevas importaciones cada
                  semana.
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCampaigns.map((campaign) => (
                <StaggerItem key={campaign.id}>
                  <CampaignCard campaign={campaign} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </AppContainer>
      </section>

      {sellerReviews.length > 0 ? (
        <section className="border-t border-border bg-secondary/40 py-16 sm:py-20">
          <AppContainer>
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Reseñas
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Lo que dicen quienes le compraron
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {sellerReviews.map((r) => {
                const u = Array.isArray(r.user) ? r.user[0] : r.user;
                const order = Array.isArray(r.order) ? r.order[0] : r.order;
                const listing = order
                  ? Array.isArray(order.listing)
                    ? order.listing[0]
                    : order.listing
                  : null;
                const productName = listing
                  ? Array.isArray(listing.product)
                    ? listing.product[0]?.name
                    : listing.product?.name
                  : null;
                return (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={
                            r.rating >= n
                              ? "size-4 fill-primary text-primary"
                              : "size-4 text-muted-foreground/30"
                          }
                          aria-hidden
                        />
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {u?.first_name ?? "Comprador"} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("es-UY", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {productName ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Sobre &ldquo;{productName}&rdquo;
                      </p>
                    ) : null}
                    {r.body ? (
                      <p className="mt-2 text-sm">{r.body}</p>
                    ) : (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageCircle className="size-3.5" aria-hidden />
                        Sin comentario
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </AppContainer>
        </section>
      ) : null}
    </>
  );
}
