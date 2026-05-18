import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Wallet } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Crédito en cuenta",
};

const MOVEMENT_LABELS: Record<
  Database["public"]["Enums"]["credit_movement_type"],
  string
> = {
  ajuste_precio_campana: "Ajuste de precio por cierre de campaña",
  devolucion_sena_campana_fallida: "Devolución de seña (campaña fallida)",
  bonus_campana_fallida: "Bonus por dejar como crédito",
  reembolso: "Reembolso",
  uso_en_compra: "Usado en una compra",
  regalo: "Regalo",
  ajuste_manual: "Ajuste manual",
};

type MovementRow =
  Database["public"]["Tables"]["credit_movements"]["Row"];

type CreditRow =
  Database["public"]["Tables"]["user_credits"]["Row"];

export default async function CreditoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: credits }, { data: movements }] = await Promise.all([
    supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .returns<CreditRow | null>(),
    supabase
      .from("credit_movements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<MovementRow[]>(),
  ]);

  const available = credits?.available_cents_usd ?? 0;

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

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Crédito en cuenta
        </h1>
        <p className="mt-2 text-muted-foreground">
          Plata a favor que podés usar en compras futuras o pedir transferida.
        </p>

        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
              <Wallet className="size-4" aria-hidden />
              Saldo disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tracking-tight text-primary">
              {formatUsdFromCents(available)}
            </p>
            {available === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Cuando tengas saldo a favor por ajustes de precio o cancelaciones,
                aparece acá.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">
          Historial de movimientos
        </h2>

        {(movements ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Sin movimientos por ahora.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {(movements ?? []).map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {MOVEMENT_LABELS[m.type]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("es-UY", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {m.description ? ` · ${m.description}` : ""}
                  </p>
                </div>
                <p
                  className={
                    m.amount_cents_usd >= 0
                      ? "text-base font-semibold text-primary"
                      : "text-base font-semibold text-destructive"
                  }
                >
                  {m.amount_cents_usd >= 0 ? "+" : ""}
                  {formatUsdFromCents(m.amount_cents_usd)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
