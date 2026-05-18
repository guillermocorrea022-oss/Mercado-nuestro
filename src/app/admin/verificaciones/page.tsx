import type { Metadata } from "next";

import { ReviewVerificationButtons } from "@/components/admin/ReviewVerificationButtons";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Verificaciones · Admin",
};

type Row = {
  id: string;
  user_id: string;
  type: Database["public"]["Enums"]["verification_type"];
  status: Database["public"]["Enums"]["verification_status"];
  file_url: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  profile:
    | { first_name: string | null; last_name: string | null; email: string }
    | { first_name: string | null; last_name: string | null; email: string }[]
    | null;
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["verification_status"],
  string
> = {
  pendiente: "bg-amber-100 text-amber-900",
  aprobado: "bg-primary/10 text-primary",
  rechazado: "bg-destructive/10 text-destructive",
};

export default async function AdminVerificacionesPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("user_verifications")
    .select(
      `id, user_id, type, status, file_url, rejection_reason, created_at, reviewed_at,
       profile:profiles!user_verifications_user_id_fkey(first_name, last_name, email)`,
    )
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Row[]>();

  const rows = list ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Verificaciones
      </h1>
      <p className="mt-2 text-muted-foreground">
        Aprobá o rechazá los documentos enviados por usuarios (regla §10).
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">
            No hay verificaciones para revisar.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((v) => {
            const profile = Array.isArray(v.profile) ? v.profile[0] : v.profile;
            const name = profile
              ? [profile.first_name, profile.last_name]
                  .filter(Boolean)
                  .join(" ") || profile.email
              : "—";
            return (
              <li
                key={v.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tipo: {v.type} · Enviado el{" "}
                      {new Date(v.created_at).toLocaleDateString("es-UY")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[v.status]}`}
                  >
                    {v.status}
                  </span>
                </div>

                <a
                  href={v.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Ver documento →
                </a>

                {v.status === "rechazado" && v.rejection_reason ? (
                  <p className="mt-2 text-xs text-destructive">
                    Motivo: {v.rejection_reason}
                  </p>
                ) : null}

                {v.status === "pendiente" ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <ReviewVerificationButtons verificationId={v.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
