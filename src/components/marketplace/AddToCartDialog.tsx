"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// ─── AddToCartDialog ──────────────────────────────────────────────────────────
// Modal de selección de cantidad antes de agregar al carrito. Genérico, lo
// usan tanto FlashDealCard como ListingCard del marketplace.
//
// Por ahora `handleConfirm` solo hace console.log. Cuando esté el sistema de
// carrito real (server action o context), reemplazar la lógica.

export type AddToCartItem = {
  id: string;
  name: string;
  image: string | null;
  priceCents: number;
  maxQuantity?: number;
};

interface AddToCartDialogProps {
  open: boolean;
  onClose: () => void;
  item: AddToCartItem;
}

export function AddToCartDialog({ open, onClose, item }: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset cantidad cuando se reabre el modal
  useEffect(() => {
    if (open) setQuantity(1);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleConfirm() {
    // TODO: conectar con carrito real (server action o context).
    console.log("[CART] add", { itemId: item.id, quantity });
    onClose();
  }

  const totalCents = item.priceCents * quantity;
  const max = item.maxQuantity ?? Infinity;
  const canIncrement = quantity < max;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`add-to-cart-title-${item.id}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[101] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-gray-50 px-6 py-4">
              <h2
                id={`add-to-cart-title-${item.id}`}
                className="text-base font-bold text-neutral-gray-700"
              >
                Agregar al carrito
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex size-8 items-center justify-center rounded-full text-neutral-gray-700 transition-colors hover:bg-neutral-gray-50"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {/* Producto preview */}
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-gray-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-gray-300">
                    <ShoppingCart className="size-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-neutral-gray-700">
                  {item.name}
                </p>
                <p className="mt-1 text-lg font-extrabold text-brand-blue">
                  {formatPrice(item.priceCents)}
                </p>
              </div>
            </div>

            {/* Selector cantidad */}
            <div className="border-t border-neutral-gray-50 px-6 py-5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70">
                Cantidad
              </label>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center rounded-full border border-neutral-gray-300">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Disminuir cantidad"
                    className="inline-flex size-10 items-center justify-center rounded-l-full text-neutral-gray-700 transition-colors hover:bg-neutral-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="min-w-[3rem] text-center text-lg font-bold text-neutral-gray-700">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(max, q + 1))}
                    disabled={!canIncrement}
                    aria-label="Aumentar cantidad"
                    className="inline-flex size-10 items-center justify-center rounded-r-full text-neutral-gray-700 transition-colors hover:bg-neutral-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-gray-700/70">Total</p>
                  <p className="text-xl font-extrabold tracking-tight text-brand-blue">
                    {formatPrice(totalCents)}
                  </p>
                </div>
              </div>
              {item.maxQuantity ? (
                <p className="mt-2 text-[11px] text-neutral-gray-700/60">
                  Disponibles: {item.maxQuantity}{" "}
                  {item.maxQuantity === 1 ? "unidad" : "unidades"}
                </p>
              ) : null}
            </div>

            {/* Botones */}
            <div className="flex gap-2 border-t border-neutral-gray-50 bg-neutral-gray-50/50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-neutral-gray-300 px-4 py-2.5 text-sm font-semibold text-neutral-gray-700 transition-colors hover:bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark"
              >
                <ShoppingCart className="size-4" aria-hidden />
                Agregar {quantity > 1 ? `${quantity} unidades` : "1 unidad"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
