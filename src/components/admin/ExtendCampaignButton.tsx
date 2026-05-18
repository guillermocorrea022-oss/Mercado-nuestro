"use client";

import { useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";

import { extendCampaignAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  campaignId: string;
  currentClosesAt: string;
  extendedOnce: boolean;
};

export function ExtendCampaignButton({
  campaignId,
  currentClosesAt,
  extendedOnce,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date(currentClosesAt);
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 16);
  });

  if (extendedOnce) {
    return (
      <p className="text-xs text-muted-foreground">
        Ya se extendió una vez (máximo permitido).
      </p>
    );
  }

  function submit() {
    setFeedback(null);
    startTransition(async () => {
      const iso = new Date(newDate).toISOString();
      const result = await extendCampaignAction(campaignId, iso);
      if (result.status === "success") {
        setFeedback({ kind: "success", message: result.message });
        setOpen(false);
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <CalendarClock className="size-3.5" aria-hidden />
        Extender plazo
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
      <p className="text-xs">
        Solo si está ≥85% del MOQ y faltan menos de 7 días. Extensión máxima 7
        días.
      </p>
      <Input
        type="datetime-local"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
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
          {pending ? "Procesando..." : "Confirmar extensión"}
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
