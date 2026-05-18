import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Package, ShoppingBag } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis compras del marketplace",
};

type OrderRow = {
  id: string;
  quantity: number;
  total_cents_usd: number;
  status: Database["public"]["Enums"]["marketplace_order_status"];
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_code: string | null;
  listing:
    | {
        product: { name: string; slug: string; main_image_url: string | null } | { name: string; slug: string; main_image_url: string | null }[] | null;
      }
    | {
        product: { name: string; slug: string; main_image_url: string | null } | { name: string; slug: string; main_image_url: string | null }[] | null;
      }[]
    | null;
  seller:
    | { display_name: string; slug: string }
    | { display_name: string; slug: string }[]
    | null;
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["marketplace_order_status"],
  { label: string; className: string }
> = {
  pagada: {
    label: "Pagada · esperando envío",
    className: "bg-amber-100 text-amber-900",
  },
  despachada: {
    label: "Despachada",
    className: "bg-primary/10 text-primary",
  },
  entregada: { label: "Entregada", className: "bg-primary/10 text-primary" },
  cancelada: {
    label: "Cancelada",
    className: "bg-destructive/10 text-destructive",
  },
  reembolsada: {
    label: "Reembolsada",
    className: "bg-muted text-muted-foreground",
  },
};

export default async function MisComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: newOrderId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("marketplace_orders")
    .select(
      `
      id, quantity, total_cents_usd, status, paid_at, shipped_at,
      delivered_at, tracking_code,
      listing:marketplace_listings!marketplace_orders_listing_id_fkey(
        product:products(name, slug, main_image_url)
      ),
      seller:seller_profiles!marketplace_orders_seller_id_fkey(display_name, slug)
      `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  const list = orders ?? [];

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        {newOrderId ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="font-medium">¡Compra confirmada!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                El vendedor recibió la notificación y tiene 3 días hábiles
                para despachar. Te avisamos por email cuando salga.
              </p>
            </div>
          </div>
        ) : null}

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mis compras
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pedidos que hiciste en el marketplace.
        </p>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <ShoppingBag
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 font-medium">
              Todavía no hiciste compras en marketplace
            </p>
            <Link
              href="/marketplace"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver publicaciones →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {list.map((o) => {
              const listing = Array.isArray(o.listing) ? o.listing[0] : o.listing;
              const product = listing
                ? Array.isArray(listing.product)
                  ? listing.product[0]
                  : listing.product
                : null;
              const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
              const status = STATUS_STYLES[o.status];
              return (
                <li
                  key={o.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatUsdFromCents(o.total_cents_usd)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-1 text-base font-semibold">
                    {product?.name ?? "Producto"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.quantity} unidad(es)
                    {seller ? ` · vendido por ${seller.display_name}` : ""}
                  </p>
                  {o.tracking_code ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Package className="size-3.5" aria-hidden />
                      Tracking: {o.tracking_code}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
