import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PackageCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Stock disponible",
  description:
    "Productos disponibles ya, en nuestro local de Paysandú o para envío inmediato.",
};

export const revalidate = 60;

type InventoryItemRow = {
  id: string;
  quantity_available: number;
  unit_price_cents_usd: number;
  product:
    | {
        slug: string;
        name: string;
        short_description: string | null;
        main_image_url: string | null;
        brand: string | null;
      }
    | null
    | {
        slug: string;
        name: string;
        short_description: string | null;
        main_image_url: string | null;
        brand: string | null;
      }[];
};

async function getAvailableItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      id, quantity_available, unit_price_cents_usd,
      product:products(slug, name, short_description, main_image_url, brand)
      `,
    )
    .eq("active", true)
    .gt("quantity_available", 0)
    .order("created_at", { ascending: false })
    .returns<InventoryItemRow[]>();

  if (error) {
    console.error("Error cargando inventario:", error);
    return [];
  }
  return data ?? [];
}

export default async function DisponiblePage() {
  const items = await getAvailableItems();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <Container className="py-20 sm:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Entrega rápida
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Stock disponible
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Productos que ya están en nuestro local de Paysandú o en depósito.
              Llegan a tu casa en 2 a 5 días hábiles, o los retirás gratis.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {items.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-16 text-center backdrop-blur">
                <PackageCheck
                  className="mx-auto size-10 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-4 text-lg font-medium">
                  Todavía no hay stock disponible
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Cuando las primeras campañas se entreguen, vas a poder
                  comprar el sobrante acá.{" "}
                  <Link
                    href="/campanas"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Mientras tanto, mirá las campañas activas
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const product = Array.isArray(item.product)
                  ? item.product[0]
                  : item.product;
                if (!product) return null;
                return (
                  <StaggerItem key={item.id}>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-glow"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        {product.main_image_url ? (
                          <Image
                            src={product.main_image_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                          Disponible
                        </div>
                        <div className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <ArrowUpRight className="size-4" aria-hidden />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        {product.brand ? (
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {product.brand}
                          </p>
                        ) : null}
                        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">
                          {product.name}
                        </h3>
                        {product.short_description ? (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {product.short_description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
                          <p className="text-2xl font-semibold tracking-tight">
                            {formatUsdFromCents(item.unit_price_cents_usd)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity_available} en stock
                          </p>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </Container>
      </section>
    </>
  );
}
