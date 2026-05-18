import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Star, Store } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ListingDetail = {
  id: string;
  price_cents_usd: number;
  quantity_available: number;
  description: string | null;
  status: Database["public"]["Enums"]["listing_status"];
  additional_image_urls: string[];
  product:
    | {
        slug: string;
        name: string;
        brand: string | null;
        short_description: string | null;
        long_description: string | null;
        main_image_url: string | null;
        attributes:
          Database["public"]["Tables"]["products"]["Row"]["attributes"];
      }
    | {
        slug: string;
        name: string;
        brand: string | null;
        short_description: string | null;
        long_description: string | null;
        main_image_url: string | null;
        attributes:
          Database["public"]["Tables"]["products"]["Row"]["attributes"];
      }[]
    | null;
  seller:
    | {
        display_name: string;
        slug: string;
        bio: string | null;
        rating_avg: number;
        total_sales: number;
        joined_at: string;
      }
    | {
        display_name: string;
        slug: string;
        bio: string | null;
        rating_avg: number;
        total_sales: number;
        joined_at: string;
      }[]
    | null;
};

async function getListing(id: string) {
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(
      `
      id, price_cents_usd, quantity_available, description, status, additional_image_urls,
      product:products(slug, name, brand, short_description, long_description, main_image_url, attributes),
      seller:seller_profiles!marketplace_listings_seller_id_fkey(display_name, slug, bio, rating_avg, total_sales, joined_at)
      `,
    )
    .eq("id", id)
    .maybeSingle()
    .returns<ListingDetail | null>();

  if (!listing) return null;
  return listing;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Publicación no encontrada" };
  const product = Array.isArray(listing.product)
    ? listing.product[0]
    : listing.product;
  return {
    title: product?.name ?? "Publicación",
    description:
      listing.description ?? product?.short_description ?? "",
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const product = Array.isArray(listing.product)
    ? listing.product[0]
    : listing.product;
  const seller = Array.isArray(listing.seller)
    ? listing.seller[0]
    : listing.seller;

  if (!product) notFound();

  return (
    <>
      <Container className="py-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al marketplace
        </Link>
      </Container>

      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
                {product.main_image_url ? (
                  <Image
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              {product.brand ? (
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  {product.brand}
                </p>
              ) : null}
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {product.name}
              </h1>
              {product.short_description ? (
                <p className="mt-4 text-base text-muted-foreground">
                  {product.short_description}
                </p>
              ) : null}
              {listing.description ? (
                <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Notas del vendedor
                  </p>
                  <p className="mt-2 text-sm">{listing.description}</p>
                </div>
              ) : null}
            </Reveal>

            {product.long_description ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">
                  Sobre el producto
                </h2>
                <p className="mt-3 whitespace-pre-line text-base text-muted-foreground">
                  {product.long_description}
                </p>
              </section>
            ) : null}

            <section className="mt-10 flex gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Compra protegida
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pagás a Mercado Nuestro como intermediario. La plata se
                  libera al vendedor cuando confirmás la entrega o pasan 3
                  días sin reclamo.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-3xl font-semibold tracking-tight">
                {formatUsdFromCents(listing.price_cents_usd)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {listing.quantity_available} disponibles
              </p>

              <button
                type="button"
                disabled
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-6 h-12 w-full text-base opacity-60",
                )}
              >
                Próximamente: comprar ahora
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Cuando se conecte el cobro con Mercado Pago, vas a poder
                comprar desde acá.
              </p>
            </div>

            {seller ? (
              <Link
                href={`/vendedor/${seller.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {seller.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {seller.display_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Store className="size-3" aria-hidden />
                        {seller.total_sales} ventas
                      </span>
                      {seller.rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Star
                            className="size-3 fill-primary text-primary"
                            aria-hidden
                          />
                          {seller.rating_avg.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {seller.bio ? (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {seller.bio}
                  </p>
                ) : null}
              </Link>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}
