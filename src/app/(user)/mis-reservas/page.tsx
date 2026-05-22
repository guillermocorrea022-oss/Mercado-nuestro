import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageOpen } from "lucide-react";

import { CancelReservationButton } from "@/components/campanas/CancelReservationButton";
import { PayBalanceButton } from "@/components/campanas/PayBalanceButton";
import { RefundChoiceButtons } from "@/components/campanas/RefundChoiceButtons";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import {
  formatTimeRemaining,
  formatUsdFromCents,
} from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis reservas",
};

const STATUS_LABELS = {
  activa: { label: "Activa", className: "bg-primary/10 text-primary" },
  confirmada: { label: "Confirmada", className: "bg-primary/10 text-primary" },
  pagada_total: {
    label: "Pagada en total",
    className: "bg-primary/10 text-primary",
  },
  entregada: {
    label: "Entregada",
    className: "bg-muted text-muted-foreground",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-destructive/10 text-destructive",
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
  if (!user) redirect("/login");

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
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Mis reservas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acá ves todas las campañas en las que reservaste y el estado de cada
          una.
        </p>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <PackageOpen
              className="mx-auto size-10 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-4 text-base font-medium">
              Todavía no reservaste en ninguna campaña.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mirá las campañas activas y sumate a la próxima importación.
            </p>
            <Link
              href="/app/campanas"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-11 px-6 text-base",
              )}
            >
              Ver campañas activas
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
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

              // Permite cancelar si la reserva está activa Y faltan más de 72hs
              // al cierre (la validación real la hace el server action de nuevo).
              const canCancel =
                r.status === "activa" &&
                secondsLeft !== null &&
                secondsLeft > 72 * 3600;

              return (
                <li key={r.id}>
                  <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/10">
                    <Link
                      href={`/app/campanas/${campaign.slug}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                              statusInfo.className,
                            )}
                          >
                            {statusInfo.label}
                          </span>
                          {r.status === "activa" ? (
                            <span className="text-xs text-muted-foreground">
                              Cierra en {formatTimeRemaining(secondsLeft)}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 line-clamp-1 text-base font-semibold tracking-tight">
                          {campaign.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {r.quantity} unidad(es) ·{" "}
                          {formatUsdFromCents(totalCents)} total ·{" "}
                          Seña {formatUsdFromCents(r.expected_deposit_cents_usd)}
                        </p>
                      </div>
                      <ArrowRight
                        className="size-5 shrink-0 text-muted-foreground"
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
                            totalCents -
                              (paidByReservation.get(r.id) ?? 0),
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
      </div>
    </Container>
  );
}
