import type { Metadata } from "next";

import { ResolveClaimButtons } from "@/components/admin/ResolveClaimButtons";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Reclamos · Admin",
};

type ClaimRow = {
  id: string;
  user_id: string;
  order_id: string | null;
  type: Database["public"]["Enums"]["claim_type"];
  status: Database["public"]["Enums"]["claim_status"];
  description: string;
  resolution: string | null;
  resolution_notes: string | null;
  appealed_at: string | null;
  appeal_reason: string | null;
  opened_at: string;
  user:
    | { first_name: string | null; last_name: string | null; email: string }
    | { first_name: string | null; last_name: string | null; email: string }[]
    | null;
};

const STATUS_STYLES: Record<
  Database["public"]["Enums"]["claim_status"],
  string
> = {
  abierto: "bg-amber-100 text-amber-900",
  en_revision: "bg-primary/10 text-primary",
  resuelto_a_favor_usuario: "bg-primary/10 text-primary",
  resuelto_a_favor_vendedor: "bg-muted text-muted-foreground",
  apelado: "bg-amber-100 text-amber-900",
  cerrado: "bg-muted text-muted-foreground",
};

export default async function AdminReclamosPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase
    .from("claims")
    .select(
      `id, user_id, order_id, type, status, description, resolution, resolution_notes,
       appealed_at, appeal_reason, opened_at,
       user:profiles!claims_user_id_fkey(first_name, last_name, email)`,
    )
    .order("opened_at", { ascending: false })
    .limit(200)
    .returns<ClaimRow[]>();

  const list = claims ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Reclamos
      </h1>
      <p className="mt-2 text-muted-foreground">
        Reclamos abiertos por los compradores (regla §5.8).
      </p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay reclamos.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((c) => {
            const user = Array.isArray(c.user) ? c.user[0] : c.user;
            const name = user
              ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
                user.email
              : "—";
            const isOpen =
              c.status === "abierto" ||
              c.status === "en_revision" ||
              c.status === "apelado";
            return (
              <li
                key={c.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tipo: {c.type.replace(/_/g, " ")} · Abierto el{" "}
                      {new Date(c.opened_at).toLocaleDateString("es-UY")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="mt-3 text-sm">{c.description}</p>

                {c.resolution_notes ? (
                  <p className="mt-2 rounded-lg bg-muted/40 p-3 text-xs">
                    Resolución: {c.resolution_notes}
                  </p>
                ) : null}

                {c.appealed_at && c.appeal_reason ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <strong>Apelado el {new Date(c.appealed_at).toLocaleDateString("es-UY")}:</strong>{" "}
                    {c.appeal_reason}
                  </p>
                ) : null}

                {isOpen ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <ResolveClaimButtons claimId={c.id} />
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
