import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";

import { PhoneVerificationForm } from "@/components/perfil/PhoneVerificationForm";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verificar teléfono",
};

export default async function VerificacionTelefonoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, phone_verified_at")
    .eq("id", user.id)
    .maybeSingle()
    .returns<{ phone: string | null; phone_verified_at: string | null } | null>();

  const verified = Boolean(profile?.phone_verified_at);

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Phone className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Verificar teléfono
            </h1>
            <p className="mt-2 text-muted-foreground">
              Necesitamos verificar tu número antes de tu primer pago. Lo
              usamos para coordinar entregas y avisarte del estado de tus
              pedidos.
            </p>
          </div>
        </div>

        {verified ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="font-medium">Tu teléfono está verificado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile?.phone ? `Número: ${profile.phone}` : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verificado el{" "}
                {new Date(profile!.phone_verified_at!).toLocaleString("es-UY", {
                  dateStyle: "long",
                  timeStyle: "short",
                  timeZone: "America/Montevideo",
                })}
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <PhoneVerificationForm currentPhone={profile?.phone ?? null} />
          </div>
        )}
      </div>
    </Container>
  );
}
