import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Users } from "lucide-react";

import { ShareButton } from "@/components/campanas/ShareButton";
import { Container } from "@/components/layout/Container";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Programa de referidos",
};

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

type ReferralRow = {
  id: string;
  status: string;
  reward_cents_usd: number;
  consolidated_at: string | null;
  created_at: string;
  referred:
    | { first_name: string | null; last_name: string | null }
    | { first_name: string | null; last_name: string | null }[]
    | null;
};

export default async function ReferidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .maybeSingle();

  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      `
      id, status, reward_cents_usd, consolidated_at, created_at,
      referred:referred_user_id(first_name, last_name)
      `,
    )
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ReferralRow[]>();

  const list = referrals ?? [];
  const code = profile?.referral_code ?? "";
  const referralUrl = `${getAppUrl()}/registro?ref=${code}`;

  const consolidated = list.filter((r) => r.status === "consolidada");
  const pending = list.filter((r) => r.status === "pendiente");
  const totalConsolidated = consolidated.reduce(
    (acc, r) => acc + r.reward_cents_usd,
    0,
  );
  const totalPending = pending.reduce(
    (acc, r) => acc + r.reward_cents_usd,
    0,
  );

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

        <div className="mt-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Programa de referidos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Invitá amigos a Mercado Nuestro. Cuando se sumen y hagan su
              primera compra, vos ganás crédito en cuenta.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Tu código de referido
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-widest text-primary">
            {code || "—"}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Tu link para compartir:
          </p>
          <p className="mt-1 break-all rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            {referralUrl}
          </p>
          <div className="mt-4">
            <ShareButton
              url={referralUrl}
              title="Mercado Nuestro"
              prefilledMessage={`Sumate a Mercado Nuestro con mi código y ganamos los dos en tu primera compra: ${referralUrl}`}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Consolidado
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatUsdFromCents(totalConsolidated)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Acreditado como crédito en cuenta.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pendiente
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatUsdFromCents(totalPending)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Se libera cuando tu referido completa su primera compra.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Tus referidos</h2>
          {list.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
              <Users
                className="mx-auto size-8 text-muted-foreground"
                aria-hidden
              />
              <p className="mt-3 font-medium">
                Todavía no tenés referidos
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Compartí tu link y empezá a sumar crédito.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {list.map((r) => {
                const referred = Array.isArray(r.referred)
                  ? r.referred[0]
                  : r.referred;
                const name = referred
                  ? [referred.first_name, referred.last_name]
                      .filter(Boolean)
                      .join(" ") || "Sin nombre"
                  : "Sin nombre";
                const isConsolidated = r.status === "consolidada";
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Se registró el{" "}
                        {new Date(r.created_at).toLocaleDateString("es-UY", {
                          dateStyle: "medium",
                          timeZone: "America/Montevideo",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          isConsolidated
                            ? "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                        }
                      >
                        {isConsolidated ? (
                          <CheckCircle2 className="size-3" aria-hidden />
                        ) : (
                          <Clock className="size-3" aria-hidden />
                        )}
                        {isConsolidated ? "Consolidado" : "Pendiente"}
                      </span>
                      <p className="mt-1 text-sm font-semibold">
                        {formatUsdFromCents(r.reward_cents_usd)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5">
          <h3 className="text-sm font-semibold">Cómo funciona</h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Compartí tu link con un amigo.</li>
            <li>
              2. Se registra en Mercado Nuestro con tu código (queda asociado
              automáticamente).
            </li>
            <li>
              3. Cuando completa su primera compra, los dos reciben crédito en
              cuenta.
            </li>
          </ol>
        </div>
      </div>
    </Container>
  );
}
