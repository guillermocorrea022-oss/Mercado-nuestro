"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, ShoppingCart, Star } from "lucide-react";

import { IconMN } from "@/components/ui/IconMN";
import { formatUsdFromCents } from "@/lib/campaigns";

import { AddToCartDialog } from "./AddToCartDialog";

// ─── ListingCard ──────────────────────────────────────────────────────────────
// Card de producto del marketplace. Imagen + brand + nombre + precio + seller
// rating + botón "Agregar al carrito" que abre modal de cantidad.
//
// Client Component porque tiene state (modal). Reusable en cualquier lista de
// listings del marketplace.

export type ListingCardData = {
  id: string;
  productName: string;
  productImage: string | null;
  brand: string | null;
  priceCentsUsd: number;
  quantityAvailable: number;
  seller?: {
    displayName: string;
    ratingAvg: number;
  } | null;
};

interface ListingCardProps {
  listing: ListingCardData;
  /** "compact" usa aspect-square en la imagen (para grids densos como
   *  "más vendidos"); default "default" usa aspect-[4/3]. */
  compact?: boolean;
}

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-md">
        {/* Imagen — Link al detalle */}
        <Link
          href={`/app/marketplace/${listing.id}`}
          className={`relative block w-full overflow-hidden bg-neutral-gray-50 ${
            compact ? "aspect-square" : "aspect-[4/3]"
          }`}
        >
          {listing.productImage ? (
            <Image
              src={listing.productImage}
              alt={listing.productName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <IconMN
                name="paquete"
                variant="color"
                size={40}
                alt=""
                className="opacity-30"
              />
            </div>
          )}
          {/* Badge escrow */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand-blue/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <ShieldCheck className="size-2.5" aria-hidden />
            Escrow
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {listing.brand ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
              {listing.brand}
            </p>
          ) : null}
          <Link
            href={`/app/marketplace/${listing.id}`}
            className="transition-colors hover:text-brand-blue"
          >
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-gray-700">
              {listing.productName}
            </h3>
          </Link>
          <p className="mt-auto text-lg font-extrabold tracking-tight text-brand-blue-dark">
            {formatUsdFromCents(listing.priceCentsUsd)}
          </p>
          <p className="text-xs text-neutral-gray-700/70">
            {listing.quantityAvailable}{" "}
            {listing.quantityAvailable === 1
              ? "unidad disponible"
              : "unidades disponibles"}
          </p>

          {listing.seller ? (
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-neutral-gray-700/70">
              <span className="max-w-[55%] truncate">
                {listing.seller.displayName}
              </span>
              {listing.seller.ratingAvg > 0 ? (
                <span className="flex shrink-0 items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        "size-3 " +
                        (i < Math.round(listing.seller!.ratingAvg)
                          ? "fill-brand-yellow text-brand-yellow"
                          : "text-neutral-gray-300")
                      }
                      aria-hidden
                    />
                  ))}
                  <span className="ml-0.5 font-semibold">
                    {listing.seller.ratingAvg.toFixed(1)}
                  </span>
                </span>
              ) : (
                <span className="italic text-neutral-gray-300">Sin reseñas</span>
              )}
            </div>
          ) : null}

          {/* Botón agregar al carrito — abre modal */}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={listing.quantityAvailable <= 0}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="size-3.5" aria-hidden />
            {listing.quantityAvailable > 0
              ? "Agregar al carrito"
              : "Sin stock"}
          </button>
        </div>
      </article>

      {/* Modal de cantidad */}
      <AddToCartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={{
          id: listing.id,
          name: listing.productName,
          image: listing.productImage,
          priceCents: listing.priceCentsUsd,
          maxQuantity: listing.quantityAvailable,
        }}
      />
    </>
  );
}
