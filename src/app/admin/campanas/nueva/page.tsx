import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateCampaignForm } from "@/components/admin/CreateCampaignForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nueva campaña · Admin",
};

export default async function NuevaCampanaPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("active", true)
    .order("name")
    .returns<{ id: string; name: string }[]>();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
      <Link
        href="/admin/campanas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a campañas
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
        Nueva campaña
      </h1>
      <p className="mt-2 text-muted-foreground">
        Definí el producto, MOQ, escalones de precio y fecha de cierre. La
        campaña se crea como borrador hasta que la publiques.
      </p>

      <div className="mt-10">
        {(products ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <p className="text-base font-medium">
              Primero creá al menos un producto.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Andá a{" "}
              <Link
                href="/admin/productos"
                className="font-medium text-primary hover:underline"
              >
                /admin/productos
              </Link>{" "}
              y agregá uno antes de abrir una campaña.
            </p>
          </div>
        ) : (
          <CreateCampaignForm products={products ?? []} />
        )}
      </div>
    </div>
  );
}
