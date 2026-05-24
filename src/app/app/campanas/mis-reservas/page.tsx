import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageOpen, ShieldCheck } from "lucide-react";

import { fixMojibake } from "@/lib/encoding";
import { CancelReservationButton } from "@/components/campanas/CancelReservationButton";
import { CampaignsTabsNav } from "@/components/campanas/CampaignsTabsNav";
import { PayBalanceButton } from "@/components/campanas/PayBalanceButton";
import { RefundChoiceButtons } from "@/components/campanas/RefundChoiceButtons";
import { AppContainer } from "@/components/layout/AppContainer";
import { buttonVariants } from "@/components/ui/button";
import {
  formatTimeRemaining,
  formatUsdFromCents,
} from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

// ─── /app/campanas/mis-reservas ───────────────────────────────────────────────
// Tab "Mis reservas" del flujo de campañas. Lista las campañas en las que el
// usuario reservó, con su estado, plazo de cancelación y botones contextuales
// (cancelar, pagar saldo, elegir reembolso/crédito si la campaña falló).
//
// Es una versión de /mis-reservas (en grupo user) re-empaquetada bajo
// /app/campanas/ para mantener el patrón de tabs consistente.

export const metadata: Metadata = {
  title: "Mis reservas",
};

const STATUS_LABELS = {
  activa: { label: "Activa", className: "bg-brand-blue/10 text-brand-blue" },
  confirmada: {
    label: "Confirmada",
    className: "bg-brand-blue/10 text-brand-blue",
  },
  pagada_total: {
    label: "Pagada en total",
    className: "bg-emerald-100 text-emerald-800",
  },
  entregada: {
    label: "Entregada",
    className: "bg-neutral-gray-50 text-neutral-gray-700",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800",
  },
} as const;

type CampaignJoin = {
  slug: string;
  title: string;
  hero_image_url: string | null;
  closes_at: string;
  status: Database["public"]["Enums"]["campaign_status"];
};

type ReservationRow = {
  id: string;
  quantity: number;
  unit_price_at_reservation_cents_usd: number;
  expected_deposit_cents_usd: number;
  status: keyof typeof STATUS_LABELS;
  reserved_at: string;
  campaign: CampaignJoin | CampaignJoin[] | null;
};

type PaymentRow = {
  reservation_id: string | null;
  amount_cents: number;
  status: Database["public"]["Enums"]["payment_status"];
};

export default async function MisReservasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/campanas/mis-reservas");

  const { data: reservations } = await supabase
    .from("campaign_reservations")
    .select(
      `
      id, quantity, unit_price_at_reservation_cents_usd, expected_deposit_cents_usd,
      status, reserved_at,
      campaign:campaigns(slug, title, hero_image_url, closes_at, status)
      `,
    )
    .eq("user_id", user.id)
    .order("reserved_at", { ascending: false })
    .returns<ReservationRow[]>();

  const list = reservations ?? [];

  const reservationIds = list.map((r) => r.id);
  const { data: payments } =
    reservationIds.length > 0
      ? await supabase
          .from("payments")
          .select("reservation_id, amount_cents, status")
          .in("reservation_id", reservationIds)
          .eq("status", "aprobado")
          .returns<PaymentRow[]>()
      : { data: [] as PaymentRow[] };

  const paidByReservation = new Map<string, number>();
  for (const p of payments ?? []) {
    if (!p.reservation_id) continue;
    paidByReservation.set(
      p.reservation_id,
      (paidByReservation.get(p.reservation_id) ?? 0) + p.amount_cents,
    );
  }

  return (
    <div className="min-h-screen bg-neutral-gray-50">
      <div className="sticky top-0 z-30">
        <CampaignsTabsNav />
      </div>

      <AppContainer className="py-5 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-extrabold text-neutral-gray-700 sm:text-3xl">
            Mis reservas
          </h1>
          <p className="mt-1 text-sm text-neutral-gray-700/70">
            Tus reservas en campañas de importación, con el estado de cada una.
          </p>
        </header>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center sm:p-16">
            <PackageOpen
              className="mx-auto size-10 text-neutral-gray-300"
              aria-hidden
            />
            <p className="mt-4 text-base font-bold text-neutral-gray-700">
              Todavía no reservaste en ninguna campaña.
            </p>
            <p className="mt-1 text-sm text-neutral-gray-700/70">
              Mirá las campañas activas y sumate a la próxima importación.
            </p>
            <Link
              href="/app/campanas"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-11 rounded-full bg-brand-blue px-6 text-sm font-bold text-white hover:bg-brand-blue-dark",
              )}
            >
              Ver campañas activas
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((r) => {
              const campaign = Array.isArray(r.campaign)
                ? (r.campaign[0] ?? null)
                : r.campaign;
              if (!campaign) return null;
              const statusInfo = STATUS_LABELS[r.status];
              const secondsLeft = campaign.closes_at
                ? Math.floor(
                    (new Date(campaign.closes_at).getTime() - Date.now()) /
                      1000,
                  )
                : null;
              const totalCents =
                r.unit_price_at_reservation_cents_usd * r.quantity;
              const canCancel =
                r.status === "activa" &&
                secondsLeft !== null &&
                secondsLeft > 72 * 3600;

              return (
                <li key={r.id}>
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-brand-blue/30">
                    <Link
                      href={`/app/campanas/${campaign.slug}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
                              statusInfo.className,
                            )}
                          >
                            {statusInfo.label}
                          </span>
                          {r.status === "activa" ? (
                            <span className="text-xs text-neutral-gray-700/70">
                              Cierra en {formatTimeRemaining(secondsLeft)}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 line-clamp-1 text-base font-bold tracking-tight text-neutral-gray-700">
                          {fixMojibake(campaign.title)}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-gray-700/70">
                          {r.quantity} unidad(es) ·{" "}
                          {formatUsdFromCents(totalCents)} total · Seña{" "}
                          {formatUsdFromCents(r.expected_deposit_cents_usd)}
                        </p>
                      </div>
                      <ArrowRight
                        className="size-5 shrink-0 text-neutral-gray-300"
                        aria-hidden
                      />
                    </Link>

                    {canCancel ? (
                      <div className="mt-4 border-t border-border pt-4">
                        <CancelReservationButton
                          reservationId={r.id}
                          canCancel={canCancel}
                        />
                      </div>
                    ) : null}

                    {campaign.status === "cerrada_exitosa" &&
                    r.status !== "pagada_total" &&
                    r.status !== "cancelada" ? (
                      <div className="mt-4 border-t border-border pt-4">
                        <PayBalanceButton
                          reservationId={r.id}
                          balanceCents={Math.max(
                            0,
                            totalCents - (paidByReservation.get(r.id) ?? 0),
                          )}
                        />
                      </div>
                    ) : null}

                    {campaign.status === "cerrada_fallida" &&
                    r.status !== "cancelada" ? (
                      <div className="mt-4 border-t border-border pt-4">
                        <RefundChoiceButtons
                          reservationId={r.id}
                          depositCents={
                            paidByReservation.get(r.id) ??
                            r.expected_deposit_cents_usd
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-xs text-neutral-gray-700/80 sm:text-sm">
          <ShieldCheck className="size-4 shrink-0 text-brand-blue" aria-hidden />
          <span>
            <strong className="font-bold text-brand-blue">Pagos seguros.</strong>{" "}
            Tu seña está protegida hasta que se complete la campaña.
          </span>
        </div>
      </AppContainer>
    </div>
  );
}
