import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

const ROLE_LABELS: Record<Database["public"]["Enums"]["user_role"], string> = {
  comprador: "Comprador",
  vendedor_catalogo: "Vendedor por catálogo",
  revendedor: "Revendedor",
  importador_avanzado: "Importador avanzado",
  admin: "Administrador",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El layout (user)/layout.tsx ya redirige si no hay user, pero TypeScript
  // no lo sabe — chequeo defensivo.
  if (!user) redirect("/login");

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("active", true),
  ]);

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "Sin nombre cargado";

  const activeRoles = (roles ?? []).map((r) => r.role);

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Hola{profile?.first_name ? `, ${profile.first_name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acá vas a ver el estado de tus reservas, pedidos y reclamos.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">{fullName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MailCheck className="size-4" aria-hidden />
                {user.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Roles activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {activeRoles.length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    Sin roles asignados
                  </li>
                ) : (
                  activeRoles.map((role) => (
                    <li
                      key={role}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      <ShieldCheck className="size-3.5" aria-hidden />
                      {ROLE_LABELS[role]}
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/mis-reservas"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
          >
            <div>
              <p className="text-base font-semibold">Mis reservas</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Campañas en las que estás participando.
              </p>
            </div>
            <ArrowRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
        </div>
      </div>
    </Container>
  );
}
