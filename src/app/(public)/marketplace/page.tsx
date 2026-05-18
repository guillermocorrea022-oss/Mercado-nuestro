import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star, Store } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { buttonVariants } from "@/components/ui/button";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Productos que personas como vos importaron y publican para venta inmediata.",
};

export const revalidate = 60;

type ListingRow = {
  id: string;
  price_cents_usd: number;
  quantity_available: number;
  description: string | null;
  product:
    | {
        name: string;
        main_image_url: string | null;
        brand: string | null;
      }
    | {
        name: string;
        main_image_url: string | null;
        brand: string | null;
      }[]
    | null;
  seller:
    | {
        display_name: string;
        slug: string;
        rating_avg: number;
      }
    | {
        display_name: string;
        slug: string;
        rating_avg: number;
      }[]
    | null;
};

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select(
      `
      id, price_cents_usd, quantity_available, description,
      product:products(name, main_image_url, brand),
      seller:seller_profiles!marketplace_listings_seller_id_fkey(display_name, slug, rating_avg)
      `,
    )
    .eq("status", "activa")
    .gt("quantity_available", 0)
    .order("created_at", { ascending: false })
    .returns<ListingRow[]>();

  const list = listings ?? [];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />
        <Container className="py-20 sm:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Marketplace de reventa
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Productos en stock, vendidos por la comunidad
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Personas que ya importaron y publican sobrante. Compras pasan
              por Mercado Nuestro como intermediario — tu plata queda
              protegida hasta que recibís el producto.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {list.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-16 text-center">
                <Store
                  className="mx-auto size-10 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-4 text-lg font-medium">
                  Todavía no hay publicaciones
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Cuando las primeras campañas se entreguen, las personas que
                  recibieron stock van a poder publicar acá.
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((l) => {
                const product = Array.isArray(l.product)
                  ? l.product[0]
                  : l.product;
                const seller = Array.isArray(l.seller) ? l.seller[0] : l.seller;
                return (
                  <StaggerItem key={l.id}>
                    <Link
                      href={`/marketplace/${l.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-soft"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {product?.main_image_url ? (
                          <Image
                            src={product.main_image_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          <ArrowUpRight className="size-4" aria-hidden />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        {product?.brand ? (
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {product.brand}
                          </p>
                        ) : null}
                        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
                          {product?.name ?? "Producto"}
                        </h3>
                        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
                          <p className="text-2xl font-semibold tracking-tight">
                            {formatUsdFromCents(l.price_cents_usd)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {l.quantity_available} disponibles
                          </p>
                        </div>
                        {seller ? (
                          <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                            <span>Vendido por {seller.display_name}</span>
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
                        ) : null}
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}

          <Reveal delay={0.2} className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Importaste y querés revender lo que te sobró?
            </p>
            <Link
              href="/perfil/revendedor"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-4 h-11 px-6 text-base",
              )}
            >
              Publicar en marketplace
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
