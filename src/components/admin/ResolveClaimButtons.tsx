"use client";

import { useState, useTransition } from "react";

import { resolveClaimAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ResolveClaimButtons({ claimId }: { claimId: string }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resolve(
    decision:
      | "resuelto_a_favor_usuario"
      | "resuelto_a_favor_vendedor"
      | "cerrado",
  ) {
    setError(null);
    startTransition(async () => {
      const result = await resolveClaimAction(claimId, decision, notes);
      if (result.status === "error") setError(result.message ?? "Error");
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas de resolución (opcional)..."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => resolve("resuelto_a_favor_usuario")}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          A favor del comprador
        </button>
        <button
          type="button"
          onClick={() => resolve("resuelto_a_favor_vendedor")}
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          A favor del vendedor
        </button>
        <button
          type="button"
          onClick={() => resolve("cerrado")}
          disabled={pending}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Cerrar sin resolución
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
