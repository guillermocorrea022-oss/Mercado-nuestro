"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Minus, Plus } from "lucide-react";

import { FormError } from "@/components/auth/AuthFormHelpers";
import { createMarketplaceOrderAction } from "@/app/(public)/marketplace/actions";
import { buttonVariants } from "@/components/ui/button";
import { formatUsdFromCents } from "@/lib/campaigns";
import { cn } from "@/lib/utils";

const initialState = { status: "idle" as const };

interface BuyListingFormProps {
  listingId: string;
  unitPriceCents: number;
  quantityAvailable: number;
  isLoggedIn: boolean;
  isOwnListing: boolean;
}

function SubmitBtn({
  label,
  pendingLabel,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-12 w-full text-base shadow-glow",
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function BuyListingForm({
  listingId,
  unitPriceCents,
  quantityAvailable,
  isLoggedIn,
  isOwnListing,
}: BuyListingFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [state, formAction] = useActionState(
    createMarketplaceOrderAction,
    initialState,
  );

  const totalCents = unitPriceCents * quantity;
  const canDecrement = quantity > 1;
  const canIncrement = quantity < quantityAvailable;

  if (isOwnListing) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Esta es tu propia publicación.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="quantity" value={quantity} />

      <FormError message={state.message} />

      <div>
        <label className="text-sm font-medium">Cantidad</label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => canDecrement && setQuantity((q) => q - 1)}
            disabled={!canDecrement}
            className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Restar"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <input
            type="number"
            min={1}
            max={quantityAvailable}
            value={quantity}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (Number.isNaN(n)) return setQuantity(1);
              setQuantity(Math.min(quantityAvailable, Math.max(1, n)));
            }}
            className="h-10 w-20 rounded-lg border border-border bg-background text-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => canIncrement && setQuantity((q) => q + 1)}
            disabled={!canIncrement}
            className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Sumar"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total a pagar</span>
          <span className="text-lg font-semibold">
            {formatUsdFromCents(totalCents)}
          </span>
        </div>
      </div>

      <SubmitBtn
        label={isLoggedIn ? "Comprar ahora" : "Entrar para comprar"}
        pendingLabel="Procesando..."
      />

      <p className="text-center text-xs text-muted-foreground">
        Pagás a Mercado Nuestro. El vendedor recibe la plata cuando confirmás
        que llegó el producto.
      </p>
    </form>
  );
}
