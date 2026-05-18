"use client";

import { useTransition, useState } from "react";
import { Lock } from "lucide-react";

import { closeCampaignAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CloseCampaignButtonProps {
  campaignId: string;
  campaignTitle: string;
}

export function CloseCampaignButton({
  campaignId,
  campaignTitle,
}: CloseCampaignButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: "success" | "error"; message: string; data?: unknown }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    startTransition(async () => {
      const result = await closeCampaignAction(campaignId);
      if (result.status === "success") {
        const r = result.summary as Record<string, unknown>;
        const kind = r.result === "exitosa" ? "success" : "error";
        const msg =
          r.result === "exitosa"
            ? `Campaña cerrada con éxito. ${r.adjusted_reservations ?? 0} reservas ajustadas, créditos por USD ${
                Number(r.total_credit_issued_cents_usd ?? 0) / 100
              }.`
            : `Campaña cerrada como fallida (${r.reserved_quantity} / ${r.moq} unidades).`;
        setFeedback({ kind, message: msg, data: r });
        setConfirming(false);
      } else {
        setFeedback({ kind: "error", message: result.message });
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
    <div>
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
          <p className="text-xs">
            Cerrar <strong>{campaignTitle}</strong>. Esto aplica precio
            retroactivo si corresponde y cancela reservas si no llegó al MOQ.
          </p>
          {feedback?.kind === "error" ? (
            <p className="text-xs text-destructive">{feedback.message}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className={cn(
                buttonVariants({ variant: "destructive", size: "sm" }),
              )}
            >
              {isPending ? "Cerrando..." : "Sí, cerrar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setFeedback(null);
              }}
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
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Lock className="size-3.5" aria-hidden />
          Cerrar campaña
        </button>
      )}
    </div>
  );
}
