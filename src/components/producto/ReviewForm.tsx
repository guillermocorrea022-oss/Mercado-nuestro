"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createReviewAction } from "@/app/app/producto/[slug]/actions";
import { cn } from "@/lib/utils";

const initialState = { status: "idle" as const };

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const [state, formAction] = useActionState(createReviewAction, initialState);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="product_slug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <FormError message={state.message} />

      <div>
        <Label>Tu calificación</Label>
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
                  "size-7 transition-colors",
                  (hovered ?? rating) >= n
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40",
                )}
                aria-hidden
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating} de 5
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Título (opcional)</Label>
        <Input
          id="review-title"
          name="title"
          maxLength={120}
          className="mt-1.5"
          placeholder="Buen producto, llegó rápido..."
        />
      </div>

      <div>
        <Label htmlFor="review-body">Tu opinión</Label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          maxLength={2000}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Contales a otros qué te pareció..."
        />
        <FieldError errors={state.fieldErrors?.body} />
      </div>

      <SubmitButton label="Publicar reseña" pendingLabel="Publicando..." />
    </form>
  );
}
