import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Productos · Admin",
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  main_image_url: string | null;
  active: boolean;
  category: { name: string } | { name: string }[] | null;
  created_at: string;
};

export default async function AdminProductosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, brand, main_image_url, active, created_at,
      category:categories(name)
      `,
    )
    .order("created_at", { ascending: false })
    .returns<ProductRow[]>();

  const list = products ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Catálogo maestro usado en campañas, stock e historial.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Crear producto
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay productos todavía.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => {
                const cat = Array.isArray(p.category)
                  ? p.category[0]
                  : p.category;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.main_image_url ? (
                            <Image
                              src={p.main_image_url}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.brand ? `${p.brand} · ` : ""}/{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {cat?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          p.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/producto/${p.slug}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
