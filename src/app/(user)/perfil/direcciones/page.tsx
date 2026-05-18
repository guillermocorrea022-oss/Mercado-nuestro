import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Star } from "lucide-react";

import { AddAddressForm } from "@/components/perfil/AddAddressForm";
import { DeleteAddressButton } from "@/components/perfil/DeleteAddressButton";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Mis direcciones",
};

type AddressRow = Database["public"]["Tables"]["user_addresses"]["Row"];

export default async function DireccionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: addresses } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<AddressRow[]>();

  const list = addresses ?? [];

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
          Mis direcciones
        </h1>
        <p className="mt-2 text-muted-foreground">
          Direcciones donde podemos enviarte tus pedidos.
        </p>

        <div className="mt-8 space-y-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
              <MapPin
                className="mx-auto size-8 text-muted-foreground"
                aria-hidden
              />
              <p className="mt-3 font-medium">
                Todavía no cargaste ninguna dirección.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agregá una para acelerar el checkout en tu próxima compra.
              </p>
            </div>
          ) : (
            list.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.label}</p>
                      {a.is_primary ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Star className="size-3" aria-hidden />
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {a.street}
                      {a.street_number ? ` ${a.street_number}` : ""}
                      {a.apartment ? `, ${a.apartment}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {a.city}, {a.department}
                      {a.postal_code ? ` · CP ${a.postal_code}` : ""}
                    </p>
                    {a.instructions ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        🗒 {a.instructions}
                      </p>
                    ) : null}
                  </div>
                  <DeleteAddressButton addressId={a.id} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <AddAddressForm />
        </div>
      </div>
    </Container>
  );
}
