import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  PackageCheck,
  Sparkles,
  Store,
} from "lucide-react";

import { ActivateResellerButton } from "@/components/revendedor/ActivateResellerButton";
import { CreateListingForm } from "@/components/revendedor/CreateListingForm";
import { Container } from "@/components/layout/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Panel de revendedor",
};

type ListingRow = {
  id: string;
  quantity_available: number;
  quantity_total: number;
  price_cents_usd: number;
  status: Database["public"]["Enums"]["listing_status"];
  created_at: string;
  product: { name: string; main_image_url: string | null } | { name: string; main_image_url: string | null }[] | null;
};

type PendingOrderRow = {
  id: string;
  quantity: number;
  total_cents_usd: number;
  status: Database["public"]["Enums"]["marketplace_order_status"];
  created_at: string;
  buyer: { first_name: string | null; last_name: string | null; email: string } | { first_name: string | null; last_name: string | null; email: string }[] | null;
  listing: { product: { name: string } | { name: string }[] | null } | { product: { name: string } | { name: string }[] | null }[] | null;
};

const LISTING_STATUS_STYLES: Record<
  Database["public"]["Enums"]["listing_status"],
  string
> = {
  activa: "bg-primary/10 text-primary",
  pausada: "bg-amber-100 text-amber-900",
  agotada: "bg-muted text-muted-foreground",
  eliminada: "bg-destructive/10 text-destructive",
};

export default async function RevendedorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ¿Tiene el rol revendedor activo?
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .returns<{ role: Database["public"]["Enums"]["user_role"] }[]>();
  const isReseller = (roles ?? []).some((r) => r.role === "revendedor");

  if (!isReseller) {
    return (
      <Container className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Volver a Mi cuenta
          </Link>

          <div className="mt-6 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="size-6" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Vendé tu stock en el marketplace
          </h1>
          <p className="mt-3 text-muted-foreground">
            Si importaste con nosotros (o vas a importar pronto), publicá lo
            que te sobra. Cobrás con seguridad, despachás cuando vendés.
          </p>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle>¿Cómo funciona?</CardTitle>
              <CardDescription>
                Compras pasan por Mercado Nuestro: el comprador paga, vos
                despachás, y cobrás cuando se confirma la entrega.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Sparkles
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    Plazo de despacho: 3 días hábiles desde que se confirma
                    la compra.
                  </span>
                </li>
                <li className="flex gap-3">
                  <PackageCheck
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>
                    Comisión entre 7% y 10% según categoría sobre el monto de
                    la venta.
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <ActivateResellerButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  // Es revendedor: dashboard.
  const [{ data: listings }, { data: pendingOrders }, { data: products }] =
    await Promise.all([
      supabase
        .from("marketplace_listings")
        .select(
          `
          id, quantity_available, quantity_total, price_cents_usd, status, created_at,
          product:products(name, main_image_url)
          `,
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .returns<ListingRow[]>(),
      supabase
        .from("marketplace_orders")
        .select(
          `
          id, quantity, total_cents_usd, status, created_at,
          buyer:profiles!marketplace_orders_buyer_id_fkey(first_name, last_name, email),
          listing:marketplace_listings!marketplace_orders_listing_id_fkey(product:products(name))
          `,
        )
        .eq("seller_id", user.id)
        .in("status", ["pagada", "despachada"])
        .order("created_at", { ascending: false })
        .returns<PendingOrderRow[]>(),
      supabase
        .from("products")
        .select("id, name")
        .eq("active", true)
        .order("name")
        .returns<{ id: string; name: string }[]>(),
    ]);

  const myListings = listings ?? [];
  const orders = pendingOrders ?? [];

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Panel de revendedor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Publicaciones, ventas y stock disponible para revender.
        </p>

        {/* Pedidos pendientes */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Pedidos a despachar
          </h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No hay pedidos pendientes ahora.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {orders.map((o) => {
                const buyer = Array.isArray(o.buyer) ? o.buyer[0] : o.buyer;
                const listing = Array.isArray(o.listing)
                  ? o.listing[0]
                  : o.listing;
                const product = listing
                  ? Array.isArray(listing.product)
                    ? listing.product[0]
                    : listing.product
                  : null;
                const buyerName =
                  [buyer?.first_name, buyer?.last_name]
                    .filter(Boolean)
                    .join(" ") || buyer?.email || "Comprador";
                return (
                  <li
                    key={o.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {product?.name ?? "Producto"} · {o.quantity} ud(s)
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Comprador: {buyerName} ·{" "}
                          {new Date(o.created_at).toLocaleString("es-UY")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold">
                          {formatUsdFromCents(o.total_cents_usd)}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            o.status === "pagada"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {o.status === "pagada"
                            ? "Pagada — falta despachar"
                            : "Despachada"}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Mis listings */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Mis publicaciones
          </h2>
          {myListings.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Todavía no publicaste nada. Creá tu primera publicación abajo.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {myListings.map((l) => {
                const product = Array.isArray(l.product)
                  ? l.product[0]
                  : l.product;
                return (
                  <li
                    key={l.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product?.main_image_url ? (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            LISTING_STATUS_STYLES[l.status],
                          )}
                        >
                          {l.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium line-clamp-1">
                        {product?.name ?? "Producto"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {l.quantity_available} disponibles ·{" "}
                        {formatUsdFromCents(l.price_cents_usd)} c/u
                      </p>
                    </div>
                    <Link
                      href={`/marketplace/${l.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver
                      <ExternalLink className="size-3" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Publicar nuevo */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-base">Nueva publicación</CardTitle>
            <CardDescription>
              Elegí un producto del catálogo y cargá tu stock disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateListingForm products={products ?? []} />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
