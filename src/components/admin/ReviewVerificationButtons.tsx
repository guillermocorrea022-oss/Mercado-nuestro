"use client";

import { useState, useTransition } from "react";

import { reviewVerificationAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewVerificationButtons({
  verificationId,
}: {
  verificationId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await reviewVerificationAction(verificationId, "aprobado");
      if (result.status === "error") setError(result.message ?? "Error");
    });
  }

  function reject() {
    setError(null);
    if (!reason.trim()) {
      setError("Contanos por qué.");
      return;
    }
    startTransition(async () => {
      const result = await reviewVerificationAction(
        verificationId,
        "rechazado",
        reason.trim(),
      );
      if (result.status === "error") setError(result.message ?? "Error");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => setShowReject((v) => !v)}
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Rechazar
        </button>
      </div>
      {showReject ? (
        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo del rechazo (visible para el usuario)..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <button
            type="button"
            onClick={reject}
            disabled={pending}
            className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
          >
            {pending ? "..." : "Confirmar rechazo"}
          </button>
        </div>
      ) : null}
      {error && !showReject ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
