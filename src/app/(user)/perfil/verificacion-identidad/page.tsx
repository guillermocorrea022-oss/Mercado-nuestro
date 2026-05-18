import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileWarning, ShieldCheck } from "lucide-react";

import { VerificationForm } from "@/components/perfil/VerificationForm";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Verificación de identidad",
};

type VerificationRow = {
  id: string;
  type: Database["public"]["Enums"]["verification_type"];
  status: Database["public"]["Enums"]["verification_status"];
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const TYPE_LABEL: Record<
  Database["public"]["Enums"]["verification_type"],
  string
> = {
  cedula: "Cédula",
  rut: "RUT",
  comprobante_domicilio: "Comprobante de domicilio",
};

export default async function VerificacionIdentidadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: verifications } = await supabase
    .from("user_verifications")
    .select("id, type, status, rejection_reason, created_at, reviewed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<VerificationRow[]>();

  const list = verifications ?? [];
  const hasApprovedCedula = list.some(
    (v) => v.type === "cedula" && v.status === "aprobado",
  );

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
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Verificación de identidad
            </h1>
            <p className="mt-2 text-muted-foreground">
              Pedimos cédula para vendedores por catálogo y revendedores antes
              del primer cobro o despacho (regla §10 de CLAUDE.md).
            </p>
          </div>
        </div>

        {hasApprovedCedula ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="font-medium">Tu cédula está aprobada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Podés cobrar comisiones y publicar en marketplace.
              </p>
            </div>
          </div>
        ) : null}

        {list.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Estado de tus envíos</h2>
            <ul className="mt-3 space-y-3">
              {list.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-medium">{TYPE_LABEL[v.type]}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Enviado el{" "}
                      {new Date(v.created_at).toLocaleDateString("es-UY", {
                        dateStyle: "medium",
                      })}
                    </p>
                    {v.status === "rechazado" && v.rejection_reason ? (
                      <p className="mt-1 text-xs text-destructive">
                        Motivo: {v.rejection_reason}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={
                      v.status === "aprobado"
                        ? "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        : v.status === "rechazado"
                          ? "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                          : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                    }
                  >
                    {v.status === "aprobado" ? (
                      <CheckCircle2 className="size-3" aria-hidden />
                    ) : v.status === "rechazado" ? (
                      <FileWarning className="size-3" aria-hidden />
                    ) : (
                      <Clock className="size-3" aria-hidden />
                    )}
                    {v.status === "aprobado"
                      ? "Aprobado"
                      : v.status === "rechazado"
                        ? "Rechazado"
                        : "Pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Enviar un documento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            La foto debe ser clara, mostrar los datos completos y estar
            actualizada.
          </p>
          <div className="mt-4">
            <VerificationForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
