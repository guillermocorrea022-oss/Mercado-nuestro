import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateProductForm } from "@/components/admin/CreateProductForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nuevo producto · Admin",
};

export default async function NuevoProductoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("display_order")
    .returns<{ id: string; name: string }[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-16">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a productos
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
        Nuevo producto
      </h1>
      <p className="mt-2 text-muted-foreground">
        Agregá un producto al catálogo maestro. Después podés crear una campaña
        de importación o cargarlo como stock disponible.
      </p>

      <div className="mt-10">
        <CreateProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
