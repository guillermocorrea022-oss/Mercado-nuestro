import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileWarning } from "lucide-react";

import { AppealClaimButton } from "@/components/perfil/AppealClaimButton";
import { NewClaimForm } from "@/components/perfil/NewClaimForm";
import { Container } from "@/components/layout/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis reclamos",
};

type ClaimRow = Database["public"]["Tables"]["claims"]["Row"];

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

export default async function ReclamosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: claims } = await supabase
    .from("claims")
    .select("*")
    .eq("user_id", user.id)
    .order("opened_at", { ascending: false })
    .returns<ClaimRow[]>();

  const list = claims ?? [];

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
          Mis reclamos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Si algo salió mal con un pedido, contanos y lo resolvemos.
        </p>

        {list.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">
              Historial
            </h2>
            <ul className="mt-4 space-y-3">
              {list.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_STYLES[c.status],
                      )}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.opened_at).toLocaleString("es-UY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">
                    {c.type.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  {c.resolution_notes ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Resolución: {c.resolution_notes}
                    </p>
                  ) : null}
                  {c.status === "resuelto_a_favor_vendedor" ||
                  c.status === "cerrado" ||
                  c.status === "apelado" ? (
                    <div className="mt-3 border-t border-border pt-3">
                      <AppealClaimButton
                        claimId={c.id}
                        alreadyAppealed={c.appealed_at !== null}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Card className="mt-10">
          <CardHeader>
            <FileWarning className="size-5 text-primary" aria-hidden />
            <CardTitle>Abrir un reclamo nuevo</CardTitle>
            <CardDescription>
              Tenés 7 días desde la entrega para reclamar. Adjuntá foto si
              corresponde (próximamente).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewClaimForm />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
