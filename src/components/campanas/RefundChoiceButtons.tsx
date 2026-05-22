"use client";

import { useState, useTransition } from "react";

import { refundFailedCampaignAction } from "@/app/app/campanas/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  reservationId: string;
  depositCents: number;
};

function formatUsd(cents: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function RefundChoiceButtons({ reservationId, depositCents }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { status: "success" | "error"; message: string } | null
  >(null);

  function choose(mode: "cash" | "credit") {
    setFeedback(null);
    startTransition(async () => {
      const result = await refundFailedCampaignAction(reservationId, mode);
      setFeedback(result);
    });
  }

  if (feedback?.status === "success") {
    return (
      <p className="text-sm font-medium text-primary">{feedback.message}</p>
    );
  }

  const bonusCents = Math.floor(depositCents * 0.05);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">La campaña no llegó al MOQ</p>
        <p className="text-xs text-muted-foreground">
          Elegí cómo querés recibir tu seña ({formatUsd(depositCents)}):
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("cash")}
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Reembolso al método original
        </button>
        <button
          type="button"
          onClick={() => choose("credit")}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Crédito + 5% bonus ({formatUsd(depositCents + bonusCents)})
        </button>
      </div>
      {feedback?.status === "error" ? (
        <p className="text-xs text-destructive">{feedback.message}</p>
      ) : null}
    </div>
  );
}
