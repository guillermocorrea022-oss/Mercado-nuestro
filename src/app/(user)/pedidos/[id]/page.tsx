import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Detalle de pedido",
};

type OrderRow = {
  id: string;
  user_id: string;
  total_cents_usd: number;
  status: Database["public"]["Enums"]["order_status"];
  shipping_method: string | null;
  customer_notes: string | null;
  created_at: string;
  shipping_address:
    | {
        label: string;
        street: string;
        street_number: string | null;
        apartment: string | null;
        city: string;
        department: string;
      }
    | { label: string; street: string; street_number: string | null; apartment: string | null; city: string; department: string }[]
    | null;
};

type OrderItem = {
  id: string;
  item_type: Database["public"]["Enums"]["order_item_type"];
  reference_id: string;
  quantity: number;
  unit_price_cents_usd: number;
  subtotal_cents_usd: number;
};

type PaymentRow = {
  amount_cents: number;
  status: Database["public"]["Enums"]["payment_status"];
  method: Database["public"]["Enums"]["payment_method"];
  processed_at: string | null;
};

const STATUS_TIMELINE: Database["public"]["Enums"]["order_status"][] = [
  "pendiente_pago",
  "pagada",
  "en_proceso",
  "enviada",
  "entregada",
];

const STATUS_LABEL: Record<
  Database["public"]["Enums"]["order_status"],
  string
> = {
  pendiente_pago: "Pendiente de pago",
  pagada: "Pagada",
  en_proceso: "En preparación",
  enviada: "Enviada",
  entregada: "Entregada",
  cancelada: "Cancelada",
  reembolsada: "Reembolsada",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, user_id, total_cents_usd, status, shipping_method, customer_notes, created_at,
      shipping_address:user_addresses(label, street, street_number, apartment, city, department)
      `,
    )
    .eq("id", id)
    .maybeSingle()
    .returns<OrderRow | null>();

  if (!order || order.user_id !== user.id) notFound();

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, item_type, reference_id, quantity, unit_price_cents_usd, subtotal_cents_usd",
      )
      .eq("order_id", order.id)
      .returns<OrderItem[]>(),
    supabase
      .from("payments")
      .select("amount_cents, status, method, processed_at")
      .eq("order_id", order.id)
      .returns<PaymentRow[]>(),
  ]);

  const shippingAddress = Array.isArray(order.shipping_address)
    ? order.shipping_address[0]
    : order.shipping_address;

  const itemList = items ?? [];
  const paymentList = payments ?? [];

  const currentIdx = STATUS_TIMELINE.indexOf(order.status);

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a mis pedidos
        </Link>

        {nuevo ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="font-medium">¡Compra confirmada!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu pedido está en preparación. Te avisamos cuando salga.
              </p>
            </div>
          </div>
        ) : null}

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Creado el{" "}
          {new Date(order.created_at).toLocaleString("es-UY", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "America/Montevideo",
          })}
        </p>

        {/* Timeline de estado */}
        <ol className="mt-8 grid grid-cols-5 gap-1">
          {STATUS_TIMELINE.map((s, i) => {
            const active = i <= currentIdx;
            const cancelled =
              order.status === "cancelada" || order.status === "reembolsada";
            return (
              <li key={s} className="text-center">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    cancelled
                      ? "bg-destructive/30"
                      : active
                        ? "bg-primary"
                        : "bg-muted",
                  )}
                />
                <p
                  className={cn(
                    "mt-2 text-xs",
                    active && !cancelled
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {STATUS_LABEL[s]}
                </p>
              </li>
            );
          })}
        </ol>

        {order.status === "cancelada" || order.status === "reembolsada" ? (
          <p className="mt-4 text-sm font-medium text-destructive">
            Este pedido está {STATUS_LABEL[order.status].toLowerCase()}.
          </p>
        ) : null}

        {/* Items */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Productos</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {itemList.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.item_type === "inventory_item"
                      ? "Producto disponible"
                      : item.item_type === "campaign_reservation"
                        ? "Reserva en campaña"
                        : "Marketplace"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.quantity} × {formatUsdFromCents(item.unit_price_cents_usd)}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatUsdFromCents(item.subtotal_cents_usd)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">
              {formatUsdFromCents(order.total_cents_usd)}
            </p>
          </div>
        </div>

        {/* Direccion */}
        {shippingAddress ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="size-4 text-primary" aria-hidden />
              Dirección de envío
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {shippingAddress.label} — {shippingAddress.street}
              {shippingAddress.street_number ? ` ${shippingAddress.street_number}` : ""}
              {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {shippingAddress.city}, {shippingAddress.department}
            </p>
          </div>
        ) : null}

        {/* Pagos */}
        {paymentList.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Pagos</h2>
            <ul className="mt-3 space-y-2">
              {paymentList.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.method}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.processed_at
                        ? new Date(p.processed_at).toLocaleDateString("es-UY")
                        : "Pendiente"}{" "}
                      · {p.status}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatUsdFromCents(p.amount_cents)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          <Link
            href="/perfil/reclamos"
            className="text-sm font-medium text-primary hover:underline"
          >
            Abrir un reclamo
          </Link>
        </div>
      </div>
    </Container>
  );
}
