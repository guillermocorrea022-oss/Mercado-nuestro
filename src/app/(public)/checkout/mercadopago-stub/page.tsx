import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { simulateMpPaymentSuccessAction } from "./actions";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatUsdFromCents } from "@/lib/campaigns";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pagar seña · Stub",
};

export default async function MpStubPage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const { reservation: reservationId } = await searchParams;
  if (!reservationId) redirect("/mis-reservas");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/checkout/mercadopago-stub?reservation=${reservationId}`);

  const { data: reservation } = await supabase
    .from("campaign_reservations")
    .select(
      "id, quantity, expected_deposit_cents_usd, status, campaign:campaigns(title, slug)",
    )
    .eq("id", reservationId)
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<{
      id: string;
      quantity: number;
      expected_deposit_cents_usd: number;
      status: string;
      campaign: { title: string; slug: string } | { title: string; slug: string }[] | null;
    } | null>();

  if (!reservation) redirect("/mis-reservas");
  const campaign = Array.isArray(reservation.campaign)
    ? reservation.campaign[0]
    : reservation.campaign;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          <AlertCircle className="size-3.5" aria-hidden />
          Modo demo — todavía no hay credenciales reales de Mercado Pago.
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Confirmar seña</CardTitle>
            <CardDescription>
              Esto simula el checkout real de Mercado Pago. Al confirmar, tu
              reserva pasa a estado <strong>confirmada</strong> y se registra un
              pago de prueba.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Campaña</dt>
                <dd className="font-medium">{campaign?.title ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cantidad</dt>
                <dd className="font-medium">{reservation.quantity}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted-foreground">Seña a pagar</dt>
                <dd className="text-xl font-semibold text-primary">
                  {formatUsdFromCents(reservation.expected_deposit_cents_usd)}
                </dd>
              </div>
            </dl>

            <form
              action={async () => {
                "use server";
                await simulateMpPaymentSuccessAction(reservationId);
              }}
              className="mt-6"
            >
              <button
                type="submit"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full text-base shadow-glow gap-2",
                )}
                disabled={reservation.status !== "activa"}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                {reservation.status === "activa"
                  ? "Simular pago exitoso"
                  : "Esta reserva ya no está activa"}
              </button>
            </form>

            <Link
              href="/mis-reservas"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar y volver
            </Link>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
