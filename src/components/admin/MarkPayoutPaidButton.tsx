"use client";

import { useState, useTransition } from "react";

import { markPayoutPaidAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MarkPayoutPaidButton({ payoutId }: { payoutId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await markPayoutPaidAction(payoutId, proofUrl || undefined);
      if (result.status === "error") {
        setError(result.message ?? "No pudimos guardar.");
      } else {
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Marcar pagado
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-left">
      <Input
        type="url"
        placeholder="Link al comprobante (opcional)"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          {pending ? "..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
