import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis pedidos",
};

type OrderRow = {
  id: string;
  total_cents_usd: number;
  status: Database["public"]["Enums"]["order_status"];
  created_at: string;
};

const STATUS_LABELS: Record<
  Database["public"]["Enums"]["order_status"],
  { label: string; className: string }
> = {
  pendiente_pago: {
    label: "Pendiente de pago",
    className: "bg-amber-100 text-amber-900",
  },
  pagada: { label: "Pagada", className: "bg-primary/10 text-primary" },
  en_proceso: {
    label: "En preparación",
    className: "bg-amber-100 text-amber-900",
  },
  enviada: { label: "Enviada", className: "bg-primary/10 text-primary" },
  entregada: { label: "Entregada", className: "bg-muted text-muted-foreground" },
  cancelada: {
    label: "Cancelada",
    className: "bg-destructive/10 text-destructive",
  },
  reembolsada: {
    label: "Reembolsada",
    className: "bg-muted text-muted-foreground",
  },
};

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_cents_usd, status, created_at")
    .eq("user_id", user.id)
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
          ← Volver a Mi cuenta
        </Link>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Mis pedidos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Compras de productos disponibles y entregas asociadas a campañas.
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <ShoppingBag
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 font-medium">Todavía no hiciste pedidos.</p>
            <Link
              href="/disponible"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver stock disponible →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {list.map((o) => {
              const status = STATUS_LABELS[o.status];
              return (
                <li key={o.id}>
                  <Link
                    href={`/pedidos/${o.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                  >
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <p className="mt-2 font-medium">
                        Pedido #{o.id.slice(0, 8)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("es-UY", {
                          dateStyle: "medium",
                          timeZone: "America/Montevideo",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold">
                        {formatUsdFromCents(o.total_cents_usd)}
                      </p>
                      <ArrowRight
                        className="ml-auto mt-1 size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
