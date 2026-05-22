import type { Metadata } from "next";
import Link from "next/link";

import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Reservas · Admin",
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["reservation_status"],
  string
> = {
  activa: "bg-primary/10 text-primary",
  confirmada: "bg-primary/10 text-primary",
  pagada_total: "bg-primary/10 text-primary",
  entregada: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive/10 text-destructive",
};

type ReservationRow = {
  id: string;
  quantity: number;
  unit_price_at_reservation_cents_usd: number;
  expected_deposit_cents_usd: number;
  status: Database["public"]["Enums"]["reservation_status"];
  reserved_at: string;
  campaign: { slug: string; title: string } | { slug: string; title: string }[] | null;
  user: { email: string; first_name: string | null; last_name: string | null } | { email: string; first_name: string | null; last_name: string | null }[] | null;
};

export default async function AdminReservasPage() {
  const supabase = await createClient();

  const { data: reservations } = await supabase
    .from("campaign_reservations")
    .select(
      `
      id, quantity, unit_price_at_reservation_cents_usd, expected_deposit_cents_usd,
      status, reserved_at,
      campaign:campaigns(slug, title),
      user:profiles!campaign_reservations_user_id_fkey(email, first_name, last_name)
      `,
    )
    .order("reserved_at", { ascending: false })
    .limit(200)
    .returns<ReservationRow[]>();

  const list = reservations ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Reservas
      </h1>
      <p className="mt-2 text-muted-foreground">
        Últimas 200 reservas en todas las campañas.
      </p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay reservas todavía.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Campaña</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Seña</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reservado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const campaign = Array.isArray(r.campaign)
                  ? r.campaign[0]
                  : r.campaign;
                const user = Array.isArray(r.user) ? r.user[0] : r.user;
                const name =
                  [user?.first_name, user?.last_name]
                    .filter(Boolean)
                    .join(" ") || "Sin nombre";
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      {campaign ? (
                        <Link
                          href={`/app/campanas/${campaign.slug}`}
                          target="_blank"
                          className="font-medium hover:text-primary"
                        >
                          {campaign.title}
                        </Link>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{r.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatUsdFromCents(r.expected_deposit_cents_usd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_STYLES[r.status],
                        )}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.reserved_at).toLocaleString("es-UY", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
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
