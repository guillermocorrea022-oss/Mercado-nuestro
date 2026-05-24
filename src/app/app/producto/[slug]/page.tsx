import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck } from "lucide-react";

import { Star } from "lucide-react";

import { BuyInventoryForm } from "@/components/productos/BuyInventoryForm";
import { ReviewForm } from "@/components/producto/ReviewForm";
import { WishlistButton } from "@/components/producto/WishlistButton";
import { AppContainer } from "@/components/layout/AppContainer";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { formatUsdFromCents } from "@/lib/campaigns";
import { fixMojibake } from "@/lib/encoding";
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
    // Fix mojibake en strings de DB (Cámara, brand, descripciones)
    name: fixMojibake(product.name),
    brand: product.brand ? fixMojibake(product.brand) : null,
    short_description: product.short_description
      ? fixMojibake(product.short_description)
      : null,
    long_description: product.long_description
      ? fixMojibake(product.long_description)
      : null,
    inventory: inventory?.[0] ?? null,
    activeCampaigns: (campaigns ?? []).map((c) => ({
      ...c,
      title: fixMojibake(c.title),
    })),
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

  // Reseñas + estado wishlist del usuario actual.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const addressesPromise = user
    ? supabase
        .from("user_addresses")
        .select("id, label, city, department")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .returns<
          { id: string; label: string; city: string; department: string }[]
        >()
    : Promise.resolve({ data: [] as { id: string; label: string; city: string; department: string }[] });

  const [{ data: reviews }, wishlistRes] = await Promise.all([
    supabase
      .from("reviews")
      .select(
        "id, rating, title, body, created_at, user:profiles!reviews_user_id_fkey(first_name)",
      )
      .eq("product_id", product.id)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<
        {
          id: string;
          rating: number;
          title: string | null;
          body: string | null;
          created_at: string;
          user:
            | { first_name: string | null }
            | { first_name: string | null }[]
            | null;
        }[]
      >(),
    user
      ? supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle()
          .returns<{ id: string } | null>()
      : Promise.resolve({ data: null }),
  ]);

  const { data: addresses } = await addressesPromise;
  const reviewsList = reviews ?? [];
  const avgRating =
    reviewsList.length === 0
      ? 0
      : reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length;
  const isInWishlist = Boolean(wishlistRes.data);

  return (
    <>
      <AppContainer className="py-8">
        <Link
          href="/app/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ver más productos
        </Link>
      </AppContainer>

      <AppContainer className="pb-20">
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
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {product.name}
                </h1>
                {user ? (
                  <WishlistButton
                    productId={product.id}
                    initialActive={isInWishlist}
                  />
                ) : null}
              </div>
              {avgRating > 0 ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star
                    className="size-4 fill-primary text-primary"
                    aria-hidden
                  />
                  {avgRating.toFixed(1)} ({reviewsList.length} reseña
                  {reviewsList.length === 1 ? "" : "s"})
                </p>
              ) : null}
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

            <section className="mt-12">
              <h2 className="text-xl font-semibold tracking-tight">
                Reseñas
              </h2>
              {reviewsList.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Todavía nadie reseñó este producto. Si lo compraste, sé el
                  primero.
                </p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {reviewsList.map((r) => {
                    const u = Array.isArray(r.user) ? r.user[0] : r.user;
                    return (
                      <li
                        key={r.id}
                        className="rounded-2xl border border-border bg-card p-5"
                      >
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={cn(
                                "size-4",
                                r.rating >= n
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/30",
                              )}
                              aria-hidden
                            />
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {u?.first_name ?? "Usuario"} ·{" "}
                            {new Date(r.created_at).toLocaleDateString("es-UY", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.title ? (
                          <p className="mt-3 text-base font-semibold">
                            {r.title}
                          </p>
                        ) : null}
                        {r.body ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {r.body}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {user ? (
                <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold tracking-tight">
                    Dejá tu reseña
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ayudás a otros compradores a decidir.
                  </p>
                  <div className="mt-5">
                    <ReviewForm
                      productId={product.id}
                      productSlug={product.slug}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Iniciá sesión
                  </Link>{" "}
                  para dejar una reseña.
                </div>
              )}
            </section>
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
                {user ? (
                  <div className="mt-5">
                    <BuyInventoryForm
                      itemId={product.inventory.id}
                      unitPriceCents={product.inventory.unit_price_cents_usd}
                      maxQuantity={product.inventory.quantity_available}
                      addresses={addresses ?? []}
                    />
                  </div>
                ) : (
                  <Link
                    href={`/login?next=/app/producto/${product.slug}`}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-5 h-11 w-full text-base",
                    )}
                  >
                    Iniciá sesión para comprar
                  </Link>
                )}
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
                        href={`/app/campanas/${c.slug}`}
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
      </AppContainer>
    </>
  );
}
