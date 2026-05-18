"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Label } from "@/components/ui/label";
import { createListingReviewAction } from "@/app/(user)/perfil/mis-compras/actions";
import { cn } from "@/lib/utils";

const initialState = { status: "idle" as const };

export function ListingReviewForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(
    createListingReviewAction,
    initialState,
  );
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted && state.status === "idle" && !state.message) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
        ¡Gracias por calificar!
      </p>
    );
  }

  return (
    <form
      action={async (data) => {
        setSubmitted(true);
        return formAction(data);
      }}
      className="space-y-3"
      noValidate
    >
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      <FormError message={state.message} />

      <div>
        <Label>¿Cómo fue la experiencia?</Label>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer p-0.5"
              aria-label={`${n} estrellas`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  (hovered ?? rating) >= n
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40",
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor={`listing-review-body-${orderId}`}>
          Comentario (opcional)
        </Label>
        <textarea
          id={`listing-review-body-${orderId}`}
          name="body"
          rows={3}
          maxLength={1000}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="¿El producto llegó como esperabas? ¿Llegó rápido?"
        />
        <FieldError errors={state.fieldErrors?.body} />
      </div>

      <SubmitButton label="Enviar reseña" pendingLabel="Enviando..." />
    </form>
  );
}
