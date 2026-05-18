"use client";

import { useState, useTransition } from "react";

import { appealClaimAction } from "@/app/(user)/perfil/reclamos/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  claimId: string;
  alreadyAppealed: boolean;
};

export function AppealClaimButton({ claimId, alreadyAppealed }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);

  if (alreadyAppealed) {
    return (
      <p className="text-xs text-muted-foreground">
        Ya apelaste este reclamo una vez. Está siendo revisado.
      </p>
    );
  }

  if (feedback?.kind === "success") {
    return (
      <p className="text-xs font-medium text-primary">{feedback.message}</p>
    );
  }

  function submit() {
    setFeedback(null);
    startTransition(async () => {
      const result = await appealClaimAction(claimId, reason);
      setFeedback({ kind: result.status, message: result.message });
      if (result.status === "success") {
        setOpen(false);
        setReason("");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Apelar resolución
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">
        Tenés UNA oportunidad de apelar. Explicá brevemente qué no está bien.
      </p>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo de la apelación..."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {feedback?.kind === "error" ? (
        <p className="text-xs text-destructive">{feedback.message}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          {pending ? "Enviando..." : "Enviar apelación"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setFeedback(null);
          }}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
