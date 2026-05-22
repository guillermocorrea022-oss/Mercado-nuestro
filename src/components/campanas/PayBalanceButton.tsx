"use client";

import { useState, useTransition } from "react";

import { payCampaignBalanceAction } from "@/app/app/campanas/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  reservationId: string;
  balanceCents: number;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function PayBalanceButton({ reservationId, balanceCents }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { status: "success" | "error"; message: string } | null
  >(null);

  function onClick() {
    setFeedback(null);
    startTransition(async () => {
      const result = await payCampaignBalanceAction(reservationId);
      setFeedback(result);
    });
  }

  if (feedback?.status === "success") {
    return (
      <p className="text-sm font-medium text-primary">{feedback.message}</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Saldo a pagar</p>
          <p className="text-xs text-muted-foreground">
            La campaña cerró exitosamente. Tenés 5 días hábiles.
          </p>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          {pending ? "Procesando..." : `Pagar ${formatUsd(balanceCents)}`}
        </button>
      </div>
      {feedback?.status === "error" ? (
        <p className="text-xs text-destructive">{feedback.message}</p>
      ) : null}
    </div>
  );
}
