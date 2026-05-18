import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  long_description: string | null;
  main_image_url: string | null;
  additional_image_urls: string[];
  attributes:
    Database["public"]["Tables"]["products"]["Row"]["attributes"];
};

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, slug, brand, short_description, long_description, main_image_url, additional_image_urls, attributes",
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()
    .returns<ProductRow | null>();
  if (!product) return null;

  const [{ data: inventory }, { data: campaigns }] = await Promise.all([
    supabase
      .from("inventory_items")
      .select("id, quantity_available, unit_price_cents_usd")
      .eq("product_id", product.id)
      .eq("active", true)
      .gt("quantity_available", 0)
      .order("unit_price_cents_usd", { ascending: true })
      .limit(1)
      .returns<
        {
          id: string;
          quantity_available: number;
          unit_price_cents_usd: number;
        }[]
      >(),
    supabase
      .from("campaigns")
      .select("id, slug, title, status, closes_at")
      .eq("product_id", product.id)
      .eq("status", "activa")
      .order("closes_at", { ascending: true })
      .limit(3)
      .returns<
        {
          id: string;
          slug: string;
          title: string;
          status: Database["public"]["Enums"]["campaign_status"];
          closes_at: string;
        }[]
      >(),
  ]);

  return {
    ...product,
    inventory: inventory?.[0] ?? null,
    activeCampaigns: campaigns ?? [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.name ?? "Producto no encontrado",
    description: product?.short_description ?? "",
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const attrs =
    product.attributes && typeof product.attributes === "object"
      ? (product.attributes as Record<string, unknown>)
      : {};
  const attrEntries = Object.entries(attrs).filter(
    ([, v]) => typeof v === "string" && v.length > 0,
  ) as [string, string][];

  return (
    <>
      <Container className="py-8">
        <Link
          href="/disponible"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ver más productos
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
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {product.short_description}
                </p>
              ) : null}
            </Reveal>

            {product.long_description ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">
                  Descripción
                </h2>
                <p className="mt-3 whitespace-pre-line text-base text-muted-foreground">
                  {product.long_description}
                </p>
              </section>
            ) : null}

            {attrEntries.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight">
                  Características
                </h2>
                <dl className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
                  {attrEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
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
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {product.inventory ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-glow">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Stock disponible
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {formatUsdFromCents(product.inventory.unit_price_cents_usd)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.inventory.quantity_available} unidades en stock
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Llega a tu casa en 2 a 5 días hábiles. Retiro gratis en
                  Paysandú.
                </p>
                {/* TODO: server action de compra directa cuando esté MP */}
                <button
                  type="button"
                  disabled
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-5 h-11 w-full text-base opacity-60",
                  )}
                >
                  Próximamente: comprar ahora
                </button>
              </div>
            ) : null}

            {product.activeCampaigns.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  En campaña ahora
                </p>
                <ul className="mt-4 space-y-3">
                  {product.activeCampaigns.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/campanas/${c.slug}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30"
                      >
                        <div>
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Cierra{" "}
                            {new Date(c.closes_at).toLocaleDateString("es-UY", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <PackageCheck
                          className="size-4 text-primary"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!product.inventory && product.activeCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-sm text-muted-foreground">
                Este producto no está disponible ahora. Te avisamos cuando
                abramos una nueva campaña.
              </div>
            ) : null}
          </aside>
        </div>
      </Container>
    </>
  );
}
