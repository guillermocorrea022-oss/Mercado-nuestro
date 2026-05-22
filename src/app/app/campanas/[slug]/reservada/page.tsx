import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Package } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";
import { buttonVariants } from "@/components/ui/button";
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

export const metadata: Metadata = {
  title: "Reserva confirmada",
};

export default async function ReservaConfirmadaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/app/campanas/${slug}`);
  }

  // Traer la campaña por slug y la última reserva del user en esa campaña.
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug, title, closes_at, estimated_arrival_at")
    .eq("slug", slug)
    .maybeSingle()
    .returns<{
      id: string;
      slug: string;
      title: string;
      closes_at: string;
      estimated_arrival_at: string | null;
    } | null>();

  if (!campaign) {
    redirect("/app/campanas");
  }

  const { data: reservation } = await supabase
    .from("campaign_reservations")
    .select("*")
    .eq("campaign_id", campaign.id)
    .eq("user_id", user.id)
    .order("reserved_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<
      import("@/types/database").Database["public"]["Tables"]["campaign_reservations"]["Row"] | null
    >();

  if (!reservation) {
    redirect(`/app/campanas/${slug}`);
  }

  return (
    <AppContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-7" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            ¡Reserva guardada!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Te sumaste a <span className="font-medium text-foreground">{campaign.title}</span>.
            Te avisamos por email en cada cambio de estado.
          </p>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
            <CardDescription>
              Los valores finales se confirman al cerrar la campaña, al mejor
              escalón alcanzado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Cantidad</dt>
                <dd className="font-medium">
                  {reservation.quantity} unidad(es)
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">
                  Precio por unidad (referencia)
                </dt>
                <dd className="font-medium">
                  {formatUsdFromCents(
                    reservation.unit_price_at_reservation_cents_usd,
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <dt className="text-muted-foreground">Seña pendiente de pago</dt>
                <dd className="text-lg font-semibold text-primary">
                  {formatUsdFromCents(reservation.expected_deposit_cents_usd)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {reservation.status === "activa" ? (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <Package
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <p className="font-medium">Próximo paso: pagar la seña</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirmá tu lugar pagando la seña ahora. Es seguro y solo te
                  toma un minuto.
                </p>
              </div>
            </div>
            <Link
              href={`/app/checkout/mercadopago-stub?reservation=${reservation.id}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-5 h-11 w-full text-base shadow-glow",
              )}
            >
              Pagar seña con Mercado Pago
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <Package className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Seña confirmada ✓</p>
              <p className="mt-1 text-muted-foreground">
                Ya recibimos tu pago. Cuando la campaña cierre, te avisamos
                por email con el saldo a pagar (si corresponde).
              </p>
            </div>
          </div>
        )}

        {campaign.estimated_arrival_at ? (
          <div className="mt-3 flex gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm">
            <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-medium">Llegada estimada</p>
              <p className="mt-1 text-muted-foreground">
                {new Date(campaign.estimated_arrival_at).toLocaleDateString(
                  "es-UY",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
                . Te avisamos en cada paso de la importación.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/mis-reservas"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 px-6 text-base",
            )}
          >
            Ver mis reservas
          </Link>
          <Link
            href="/app/campanas"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-base",
            )}
          >
            Ver otras campañas
          </Link>
        </div>
      </div>
    </AppContainer>
  );
}
