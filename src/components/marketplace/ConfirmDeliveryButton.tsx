"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { confirmDeliveryAction } from "@/app/(user)/perfil/mis-compras/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handle() {
    setError(null);
    startTransition(async () => {
      const result = await confirmDeliveryAction(orderId);
      if (result.status === "error") {
        setError(result.message);
      } else {
        setDone(true);
      }
    });
  }

  if (done) {
    return (
      <p className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Entrega confirmada. Gracias.
      </p>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">
            Solo confirmá si ya recibiste el producto y está OK. Esto libera
            el dinero al vendedor.
          </p>
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handle}
              disabled={isPending}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {isPending ? "Confirmando..." : "Sí, lo recibí"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <CheckCircle2 className="size-3.5" aria-hidden />
          Confirmar entrega
        </button>
      )}
    </div>
  );
}
