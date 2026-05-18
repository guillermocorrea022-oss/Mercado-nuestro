import type { Metadata } from "next";

import { ProcessPayoutsButton } from "@/components/admin/ProcessPayoutsButton";
import { MarkPayoutPaidButton } from "@/components/admin/MarkPayoutPaidButton";
import { createClient } from "@/lib/supabase/server";
import { formatUsdFromCents } from "@/lib/campaigns";

export const metadata: Metadata = {
  title: "Comisiones · Admin",
};

type PayoutRow = {
  id: string;
  seller_id: string;
  period_month: string;
  total_cents_usd: number;
  status: "solicitado" | "pagado" | "rechazado";
  requested_at: string;
  paid_at: string | null;
  proof_url: string | null;
  seller:
    | { first_name: string | null; last_name: string | null; email: string }
    | { first_name: string | null; last_name: string | null; email: string }[]
    | null;
};

type CatalogSaleRow = {
  seller_id: string;
  commission_cents_usd: number;
  status: "pendiente" | "consolidada" | "pagada" | "descartada";
};

export default async function AdminComisionesPage() {
  const supabase = await createClient();

  const [{ data: payouts }, { data: sales }] = await Promise.all([
    supabase
      .from("commission_payouts")
      .select(
        `id, seller_id, period_month, total_cents_usd, status, requested_at, paid_at, proof_url,
         seller:profiles!commission_payouts_seller_id_fkey(first_name, last_name, email)`,
      )
      .order("requested_at", { ascending: false })
      .limit(100)
      .returns<PayoutRow[]>(),
    supabase
      .from("catalog_sales")
      .select("seller_id, commission_cents_usd, status")
      .returns<CatalogSaleRow[]>(),
  ]);

  const list = payouts ?? [];
  const totals = new Map<string, { pending: number; consolidated: number }>();
  for (const s of sales ?? []) {
    const cur = totals.get(s.seller_id) ?? { pending: 0, consolidated: 0 };
    if (s.status === "pendiente") cur.pending += s.commission_cents_usd;
    if (s.status === "consolidada") cur.consolidated += s.commission_cents_usd;
    totals.set(s.seller_id, cur);
  }

  const totalPending = Array.from(totals.values()).reduce(
    (acc, t) => acc + t.consolidated,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Comisiones
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestión de payouts mensuales a vendedores por catálogo (regla §5.7).
          </p>
        </div>
        <ProcessPayoutsButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Consolidado pendiente de payout
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatUsdFromCents(totalPending)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Payouts solicitados
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {list.filter((p) => p.status === "solicitado").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pagados este mes
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {
              list.filter(
                (p) =>
                  p.status === "pagado" &&
                  p.paid_at &&
                  new Date(p.paid_at).getMonth() === new Date().getMonth(),
              ).length
            }
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Periodo</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No hay payouts todavía. Tocá &quot;Procesar mes&quot; arriba para crearlos.
                </td>
              </tr>
            ) : (
              list.map((p) => {
                const seller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
                const name = seller
                  ? [seller.first_name, seller.last_name]
                      .filter(Boolean)
                      .join(" ") || seller.email
                  : "—";
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        {seller?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(p.period_month).toLocaleDateString("es-UY", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatUsdFromCents(p.total_cents_usd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.status === "pagado"
                            ? "inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            : p.status === "rechazado"
                              ? "inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                              : "inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "solicitado" ? (
                        <MarkPayoutPaidButton payoutId={p.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
