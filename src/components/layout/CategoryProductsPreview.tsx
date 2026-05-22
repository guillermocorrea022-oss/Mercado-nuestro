"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";

import { AddToCartDialog } from "@/components/marketplace/AddToCartDialog";
import { fixMojibake } from "@/lib/encoding";
import { createClient } from "@/lib/supabase/client";
import type { CategoryNode } from "./UnifiedHeader";

// ─── CategoryProductsPreview ──────────────────────────────────────────────────
// Mini-grid de productos del category root (incluyendo descendientes) que se
// muestra dentro del panel derecho del mega-menu. Hace fetch lazy al ser
// montado / cuando cambia el root.id.
//
// Cada card tiene foto + nombre + precio + botón "Agregar al carrito" que
// abre el modal de cantidad (mismo modal que el resto del marketplace).

type PreviewListing = {
  id: string;
  price_cents_usd: number;
  quantity_available: number;
  product:
    | {
        name: string;
        slug: string;
        main_image_url: string | null;
      }
    | null;
};

interface CategoryProductsPreviewProps {
  root: CategoryNode;
  onSelect: () => void;
}

// Junta el id del root + todos sus descendientes en un set.
function collectCategoryIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectCategoryIds)];
}

export function CategoryProductsPreview({
  root,
  onSelect,
}: CategoryProductsPreviewProps) {
  const [listings, setListings] = useState<PreviewListing[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    const categoryIds = collectCategoryIds(root);

    // Limito a 4 para que el panel quede compacto y la barra inferior con
    // "Ver todos los productos" sea visible sin necesidad de scroll
    // profundo. Si la categoría tiene más, se ven todos al hacer clic en
    // "Ver todos los productos".
    supabase
      .from("marketplace_listings")
      .select(
        "id, price_cents_usd, quantity_available, product:products!inner(name, slug, main_image_url, category_id)",
      )
      .eq("status", "activa")
      .gt("quantity_available", 0)
      .in("product.category_id", categoryIds)
      .limit(4)
      .returns<
        Array<{
          id: string;
          price_cents_usd: number;
          quantity_available: number;
          product:
            | {
                name: string;
                slug: string;
                main_image_url: string | null;
                category_id: string;
              }
            | {
                name: string;
                slug: string;
                main_image_url: string | null;
                category_id: string;
              }[]
            | null;
        }>
      >()
      .then(({ data }) => {
        if (cancelled) return;
        const items = (data ?? []).map((l) => {
          const product = Array.isArray(l.product) ? l.product[0] : l.product;
          return {
            id: l.id,
            price_cents_usd: l.price_cents_usd,
            quantity_available: l.quantity_available,
            product: product
              ? {
                  name: fixMojibake(product.name),
                  slug: product.slug,
                  main_image_url: product.main_image_url,
                }
              : null,
          };
        });
        setListings(items);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [root.id]);

  if (loading && !listings) {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Todavía no hay productos en{" "}
          <span className="font-semibold text-foreground">{root.name}</span>.
        </p>
        <Link
          href={`/app/marketplace?cat=${root.slug}`}
          onClick={onSelect}
          className="text-xs font-bold text-brand-blue hover:underline"
        >
          Ver categoría completa →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => (
        <PreviewCard key={l.id} listing={l} onLinkClick={onSelect} />
      ))}
    </div>
  );
}

// ─── PreviewCard ──────────────────────────────────────────────────────────────
// Card individual del preview: imagen + título (Link al detalle) + precio +
// botón cart (abre modal). Tiene state propio para el dialog porque cada
// card es independiente.

function PreviewCard({
  listing,
  onLinkClick,
}: {
  listing: PreviewListing;
  onLinkClick: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm">
        <Link
          href={`/app/marketplace/${listing.id}`}
          onClick={onLinkClick}
          className="relative block aspect-square overflow-hidden bg-neutral-gray-50"
        >
          {listing.product?.main_image_url ? (
            <Image
              src={listing.product.main_image_url}
              alt={listing.product.name}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase text-neutral-gray-300">
              Sin imagen
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-1 p-2">
          <Link
            href={`/app/marketplace/${listing.id}`}
            onClick={onLinkClick}
            className="transition-colors hover:text-brand-blue"
          >
            <p className="line-clamp-2 min-h-[2rem] text-[11px] font-medium leading-snug text-neutral-gray-700">
              {listing.product?.name ?? "Producto"}
            </p>
          </Link>
          <p className="text-sm font-extrabold text-brand-blue-dark">
            USD {(listing.price_cents_usd / 100).toFixed(0)}
          </p>

          {/* Botón cart anclado al fondo de la card con mt-auto */}
          <button
            type="button"
            onClick={(e) => {
              // Prevenir que el click se propague al Link de la imagen
              e.preventDefault();
              e.stopPropagation();
              setDialogOpen(true);
            }}
            className="mt-auto inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand-blue px-2 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-brand-blue-dark"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="size-3" aria-hidden />
            Carrito
          </button>
        </div>
      </article>

      <AddToCartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={{
          id: listing.id,
          name: listing.product?.name ?? "Producto",
          image: listing.product?.main_image_url ?? null,
          priceCents: listing.price_cents_usd,
          maxQuantity: listing.quantity_available,
        }}
      />
    </>
  );
}
