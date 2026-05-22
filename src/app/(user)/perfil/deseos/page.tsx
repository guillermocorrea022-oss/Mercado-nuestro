import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mi lista de deseos",
};

type WishlistRow = {
  id: string;
  added_at: string;
  product:
    | { slug: string; name: string; main_image_url: string | null; brand: string | null }
    | { slug: string; name: string; main_image_url: string | null; brand: string | null }[]
    | null;
};

export default async function DeseosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select(
      `
      id, added_at,
      product:products(slug, name, main_image_url, brand)
      `,
    )
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })
    .returns<WishlistRow[]>();

  const list = wishlist ?? [];

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mi lista de deseos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Productos guardados para reservar después o cuando vuelva el stock.
        </p>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <Heart
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 font-medium">Tu lista está vacía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tocá el botón &quot;Guardar&quot; en cualquier producto para
              sumarlo acá.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {list.map((w) => {
              const product = Array.isArray(w.product)
                ? w.product[0]
                : w.product;
              if (!product) return null;
              return (
                <li key={w.id}>
                  <Link
                    href={`/app/producto/${product.slug}`}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product.main_image_url ? (
                        <Image
                          src={product.main_image_url}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      {product.brand ? (
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {product.brand}
                        </p>
                      ) : null}
                      <p className="mt-1 line-clamp-2 text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Agregado{" "}
                        {new Date(w.added_at).toLocaleDateString("es-UY", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
