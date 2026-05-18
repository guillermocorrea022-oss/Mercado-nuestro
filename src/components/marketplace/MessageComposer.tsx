"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";

import { sendMarketplaceMessageAction } from "@/app/(user)/perfil/mensajes/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessageComposer({ listingId }: { listingId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    setError(null);
    if (!body.trim()) return;
    const text = body;
    startTransition(async () => {
      const result = await sendMarketplaceMessageAction(listingId, text);
      if (result.status === "error") {
        setError(result.message);
      } else {
        setBody("");
        ref.current?.focus();
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={ref}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Escribí tu mensaje..."
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !body.trim()}
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-1.5",
          )}
        >
          <Send className="size-3.5" aria-hidden />
          {isPending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
