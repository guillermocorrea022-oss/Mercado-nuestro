import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from "lucide-react";

import { BuyListingForm } from "@/components/marketplace/BuyListingForm";
import { AppContainer } from "@/components/layout/AppContainer";
import { IconMN } from "@/components/ui/IconMN";
import { StarRating } from "@/components/ui/star-rating";
import { formatUsdFromCents } from "@/lib/campaigns";
import { fixMojibake } from "@/lib/encoding";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type RawListingDetail = {
  id: string;
  seller_id: string;
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
        attributes: Database["public"]["Tables"]["products"]["Row"]["attributes"];
      }
    | {
        slug: string;
        name: string;
        brand: string | null;
        short_description: string | null;
        long_description: string | null;
        main_image_url: string | null;
        attributes: Database["public"]["Tables"]["products"]["Row"]["attributes"];
      }[]
    | null;
};

type SellerDetail = {
  user_id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  rating_avg: number;
  total_sales: number;
  joined_at: string;
};

type ListingDetail = RawListingDetail & { seller: SellerDetail | null };

async function getListing(id: string): Promise<ListingDetail | null> {
  const supabase = await createClient();

  // Dos queries separadas porque marketplace_listings.seller_id apunta a
  // profiles.id (no a seller_profiles.user_id), por lo que PostgREST no
  // puede resolver el join con hint de FK.
  const { data: raw } = await supabase
    .from("marketplace_listings")
    .select(
      "id, seller_id, price_cents_usd, quantity_available, description, status, additional_image_urls, product:products(slug, name, brand, short_description, long_description, main_image_url, attributes)",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<RawListingDetail | null>();

  if (!raw) return null;

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("user_id, display_name, slug, bio, rating_avg, total_sales, joined_at")
    .eq("user_id", raw.seller_id)
    .maybeSingle()
    .returns<SellerDetail | null>();

  // Fix mojibake en todos los strings que vienen de DB (mismo issue que en
  // campanas: acentos rotos por encoding al insertar el seed).
  const product = Array.isArray(raw.product) ? raw.product[0] : raw.product;
  return {
    ...raw,
    description: raw.description ? fixMojibake(raw.description) : null,
    product: product
      ? {
          ...product,
          name: fixMojibake(product.name),
          brand: product.brand ? fixMojibake(product.brand) : null,
          short_description: product.short_description
            ? fixMojibake(product.short_description)
            : null,
          long_description: product.long_description
            ? fixMojibake(product.long_description)
            : null,
        }
      : null,
    seller: seller
      ? {
          ...seller,
          display_name: fixMojibake(seller.display_name),
          bio: seller.bio ? fixMojibake(seller.bio) : null,
        }
      : null,
  };
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
    title: `${product?.name ?? "Publicación"} — Mercado Nuestro`,
    description: listing.description ?? product?.short_description ?? "",
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
  const seller = listing.seller;

  if (!product) notFound();

  // Verificar sesión + ownership.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnListing = user?.id === listing.seller_id;

  // Galería: imagen principal + adicionales.
  const allImages = [
    product.main_image_url,
    ...(listing.additional_image_urls ?? []),
  ].filter(Boolean) as string[];

  // Atributos del producto como lista de pares.
  const attrs =
    product.attributes && typeof product.attributes === "object"
      ? Object.entries(product.attributes as Record<string, string>)
      : [];

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-background">
        <AppContainer className="py-2">
          <nav
            aria-label="Ubicación"
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Link href="/" className="hover:text-blue hover:underline">
              Inicio
            </Link>
            <ChevronRight className="size-3 shrink-0" aria-hidden />
            <Link href="/app/marketplace" className="hover:text-blue hover:underline">
              Mercado Nuestro
            </Link>
            <ChevronRight className="size-3 shrink-0" aria-hidden />
            <span className="max-w-[240px] truncate font-medium text-foreground">
              {product.name}
            </span>
          </nav>
        </AppContainer>
      </div>

      {/* ── Contenido principal ── */}
      <div className="bg-muted/30">
        <AppContainer className="py-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-8">

            {/* ──────── Columna izquierda: galería + descripción ──────── */}
            <div className="space-y-5">
              {/* Galería */}
              <div className="overflow-hidden rounded-2xl border border-border bg-background">
                {/* Imagen principal */}
                <div className="relative aspect-square w-full bg-muted">
                  {allImages[0] ? (
                    <Image
                      src={allImages[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain p-4"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <IconMN name="paquete" variant="color" size={64} alt="" className="opacity-20" />
                    </div>
                  )}
                </div>

                {/* Thumbnails (si hay más de una imagen) */}
                {allImages.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto border-t border-border p-3">
                    {allImages.map((src, i) => (
                      <div
                        key={i}
                        className={
                          "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted " +
                          (i === 0 ? "border-blue" : "border-border hover:border-blue/50")
                        }
                      >
                        <Image
                          src={src}
                          alt={`${product.name} vista ${i + 1}`}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Descripción del producto */}
              {(product.short_description || product.long_description || listing.description) ? (
                <div className="rounded-2xl border border-border bg-background p-6">
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Descripción
                  </h2>

                  {listing.description ? (
                    <div className="mt-4 rounded-xl bg-blue/5 border border-blue/15 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue">
                        Nota del vendedor
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {listing.description}
                      </p>
                    </div>
                  ) : null}

                  {product.short_description ? (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {product.short_description}
                    </p>
                  ) : null}

                  {product.long_description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {product.long_description}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* Características / atributos */}
              {attrs.length > 0 ? (
                <div className="rounded-2xl border border-border bg-background p-6">
                  <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
                    Características
                  </h2>
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                    {attrs.map(([key, val]) => (
                      <div key={key}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          {key}
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-foreground">
                          {String(val)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Compra protegida — explicación completa */}
              <div className="rounded-2xl border border-blue/20 bg-blue/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue">
                    <ShieldCheck className="size-5 text-blue-foreground" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Compra 100% protegida
                    </h3>
                    <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue" />
                        Tu pago va a Mercado Nuestro, no al vendedor directamente.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue" />
                        El dinero se libera al vendedor cuando confirmás la recepción
                        o pasan 3 días sin reclamo desde el despacho.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue" />
                        Tenés 7 días para reclamar si algo no está bien.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ──────── Columna derecha: buy box ──────── */}
            <div className="space-y-4 lg:sticky lg:top-24">

              {/* Tarjeta principal de compra */}
              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                {/* Condition badge + brand */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue">
                    Nuevo
                  </span>
                  {product.brand ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {product.brand}
                    </span>
                  ) : null}
                </div>

                {/* Título */}
                <h1 className="mt-3 text-xl font-bold leading-snug text-foreground sm:text-2xl">
                  {product.name}
                </h1>

                {/* Reputación del vendedor inline */}
                {seller && seller.rating_avg > 0 ? (
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={seller.rating_avg} size="size-3.5" />
                    <span className="text-xs text-muted-foreground">
                      {seller.rating_avg.toFixed(1)} · {seller.total_sales} ventas
                    </span>
                  </div>
                ) : null}

                {/* Divisor */}
                <hr className="my-4 border-border" />

                {/* Precio */}
                <div>
                  <p className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                    {formatUsdFromCents(listing.price_cents_usd)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Precio en dólares estadounidenses
                  </p>
                </div>

                {/* Stock */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={
                      "size-2 rounded-full " +
                      (listing.quantity_available > 5
                        ? "bg-green-500"
                        : listing.quantity_available > 0
                        ? "bg-yellow"
                        : "bg-red-500")
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {listing.quantity_available > 0
                      ? `${listing.quantity_available} ${listing.quantity_available === 1 ? "unidad disponible" : "unidades disponibles"}`
                      : "Sin stock"}
                  </p>
                </div>

                {/* Shipping note */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="size-4 shrink-0 text-blue" aria-hidden />
                  <span>Envío coordinado con el vendedor · Todo Uruguay</span>
                </div>

                {/* Divisor */}
                <hr className="my-4 border-border" />

                {/* Formulario de compra */}
                <BuyListingForm
                  listingId={listing.id}
                  unitPriceCents={listing.price_cents_usd}
                  quantityAvailable={listing.quantity_available}
                  isLoggedIn={Boolean(user)}
                  isOwnListing={isOwnListing}
                />

                {/* Consultar al vendedor */}
                {user && !isOwnListing ? (
                  <Link
                    href={`/perfil/mensajes/${listing.id}`}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Consultar al vendedor
                  </Link>
                ) : null}
              </div>

              {/* Tarjeta del vendedor */}
              {seller ? (
                <Link
                  href={`/app/vendedor/${seller.slug}`}
                  className="block rounded-2xl border border-border bg-background p-5 transition-all hover:border-blue/30 hover:shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vendido por
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {/* Avatar con inicial */}
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue text-blue-foreground text-lg font-extrabold">
                      {seller.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {seller.display_name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Store className="size-3" aria-hidden />
                          {seller.total_sales}{" "}
                          {seller.total_sales === 1 ? "venta" : "ventas"}
                        </span>
                        {seller.rating_avg > 0 ? (
                          <span className="flex items-center gap-0.5">
                            <Star
                              className="size-3 fill-[#FFC107] text-[#FFC107]"
                              aria-hidden
                            />
                            {seller.rating_avg.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ChevronRight
                      className="ml-auto size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                  {seller.bio ? (
                    <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                      {seller.bio}
                    </p>
                  ) : null}
                  <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-center text-xs font-medium text-foreground">
                    Ver catálogo completo
                  </div>
                </Link>
              ) : null}

              {/* Mini strip de garantías */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "seguridad" as const, label: "Pago seguro" },
                  { icon: "devoluciones" as const, label: "7 días reclamo" },
                  { icon: "soporte" as const, label: "Soporte local" },
                ].map((g) => (
                  <div
                    key={g.label}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background py-5 px-3 text-center"
                  >
                    <IconMN name={g.icon} variant="color" size={40} alt="" />
                    <span className="text-xs font-semibold leading-tight text-muted-foreground">
                      {g.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppContainer>
      </div>
    </>
  );
}
