"use client";

import { useTransition, useState } from "react";
import { X } from "lucide-react";

import { cancelReservationAction } from "@/app/(public)/campanas/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CancelReservationButtonProps {
  reservationId: string;
  /** Si la cancelación todavía está dentro del plazo de 72hs. Solo se muestra
   *  el botón si esto es true. */
  canCancel: boolean;
}

// Botón con confirmación inline para cancelar una reserva activa.
// La validación real del plazo y del estado ocurre en el server action.
export function CancelReservationButton({
  reservationId,
  canCancel,
}: CancelReservationButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: "success" | "error"; message: string }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  if (!canCancel) return null;

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelReservationAction(reservationId);
      setFeedback({
        kind: result.status === "success" ? "success" : "error",
        message: result.message,
      });
      if (result.status === "success") {
        setConfirming(false);
      }
    });
  }

  if (feedback?.kind === "success") {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
        {feedback.message}
      </p>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">
            ¿Seguro que querés cancelar esta reserva?
          </p>
          {feedback?.kind === "error" ? (
            <p className="text-xs text-destructive">{feedback.message}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className={cn(
                buttonVariants({ variant: "destructive", size: "sm" }),
              )}
            >
              {isPending ? "Cancelando..." : "Sí, cancelar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setFeedback(null);
              }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              No, dejarla
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-muted-foreground hover:text-foreground",
          )}
        >
          <X className="size-3.5" aria-hidden />
          Cancelar reserva
        </button>
      )}
    </div>
  );
}
