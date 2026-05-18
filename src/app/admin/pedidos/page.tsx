import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatUsdFromCents } from "@/lib/campaigns";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Pedidos · Admin",
};

type Row = {
  id: string;
  total_cents_usd: number;
  status: Database["public"]["Enums"]["order_status"];
  created_at: string;
  user_id: string;
  user:
    | { first_name: string | null; last_name: string | null; email: string }
    | { first_name: string | null; last_name: string | null; email: string }[]
    | null;
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["order_status"],
  string
> = {
  pendiente_pago: "bg-amber-100 text-amber-900",
  pagada: "bg-primary/10 text-primary",
  en_proceso: "bg-amber-100 text-amber-900",
  enviada: "bg-primary/10 text-primary",
  entregada: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive/10 text-destructive",
  reembolsada: "bg-destructive/10 text-destructive",
};

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, total_cents_usd, status, created_at, user_id,
       user:profiles!orders_user_id_fkey(first_name, last_name, email)`,
    )
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Row[]>();

  const list = orders ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Pedidos
      </h1>
      <p className="mt-2 text-muted-foreground">
        Listado unificado de pedidos (incluye stock disponible y otros).
      </p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay pedidos todavía.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Comprador</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((o) => {
                const user = Array.isArray(o.user) ? o.user[0] : o.user;
                const name = user
                  ? [user.first_name, user.last_name]
                      .filter(Boolean)
                      .join(" ") || user.email
                  : "—";
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/pedidos/${o.id}`}
                        target="_blank"
                        className="font-mono text-xs hover:text-primary"
                      >
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatUsdFromCents(o.total_cents_usd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLES[o.status],
                        )}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("es-UY", {
                        dateStyle: "medium",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
