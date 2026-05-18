"use client";

import { useState, useTransition } from "react";
import { Wallet } from "lucide-react";

import { processSellerPayoutsAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProcessPayoutsButton() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { status: "success" | "error"; message: string } | null
  >(null);

  function run() {
    setFeedback(null);
    startTransition(async () => {
      const result = await processSellerPayoutsAction();
      setFeedback(result);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
      >
        <Wallet className="size-3.5" aria-hidden />
        {pending ? "Procesando..." : "Procesar mes"}
      </button>
      {feedback ? (
        <p
          className={
            feedback.status === "success"
              ? "text-xs text-primary"
              : "text-xs text-destructive"
          }
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
