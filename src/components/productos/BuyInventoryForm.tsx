"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { buyInventoryItemAction } from "@/app/(public)/producto/[slug]/buy-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Address = { id: string; label: string; city: string; department: string };

type Props = {
  itemId: string;
  unitPriceCents: number;
  maxQuantity: number;
  addresses: Address[];
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function BuyInventoryForm({
  itemId,
  unitPriceCents,
  maxQuantity,
  addresses,
}: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function bump(delta: number) {
    setQuantity((q) => Math.min(maxQuantity, Math.max(1, q + delta)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!addressId) {
      setError("Elegí una dirección de envío.");
      return;
    }
    startTransition(async () => {
      const result = await buyInventoryItemAction(itemId, quantity, addressId);
      if (result.status === "error") {
        setError(result.message);
      } else {
        router.push(`/pedidos/${result.orderId}?nuevo=1`);
      }
    });
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">Te falta una dirección de envío.</p>
        <p className="mt-1">
          Agregá una desde{" "}
          <a
            href="/perfil/direcciones"
            className="underline-offset-2 hover:underline"
          >
            tu cuenta
          </a>{" "}
          y volvé.
        </p>
      </div>
    );
  }

  const totalCents = unitPriceCents * quantity;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Cantidad</p>
        <div className="inline-flex items-center gap-1 rounded-full border border-border">
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={quantity <= 1 || pending}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
            aria-label="Restar"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => bump(1)}
            disabled={quantity >= maxQuantity || pending}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
            aria-label="Sumar"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="text-sm font-medium text-muted-foreground"
        >
          Dirección de envío
        </label>
        <select
          id="address"
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label} — {a.city}, {a.department}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">Total a pagar</p>
        <p className="text-xl font-semibold">{formatUsd(totalCents)}</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        {pending ? "Procesando..." : "Comprar ahora"}
      </button>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
