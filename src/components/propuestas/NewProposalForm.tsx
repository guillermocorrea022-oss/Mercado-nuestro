"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProposalAction } from "@/app/(public)/propuestas/actions";

const initialState = { status: "idle" as const };

export function NewProposalForm() {
  const [state, formAction] = useActionState(createProposalAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <div>
        <Label htmlFor="title">¿Qué te gustaría que importemos?</Label>
        <Input
          id="title"
          name="title"
          required
          className="mt-1.5"
          placeholder="Ej: Auriculares bluetooth Anker Soundcore..."
        />
        <FieldError errors={state.fieldErrors?.title} />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <Label htmlFor="reference_url">Link de referencia (opcional)</Label>
        <Input
          id="reference_url"
          name="reference_url"
          type="url"
          className="mt-1.5"
          placeholder="https://aliexpress.com/..."
        />
        <FieldError errors={state.fieldErrors?.reference_url} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="my_quantity">Yo compraría</Label>
          <Input
            id="my_quantity"
            name="my_quantity"
            type="number"
            min="1"
            required
            className="mt-1.5"
            placeholder="2"
          />
          <FieldError errors={state.fieldErrors?.my_quantity} />
        </div>

        <div>
          <Label htmlFor="max_price_cents_usd">
            Precio máximo aceptable (USD ¢)
          </Label>
          <Input
            id="max_price_cents_usd"
            name="max_price_cents_usd"
            type="number"
            min="1"
            className="mt-1.5"
            placeholder="3500 = USD 35"
          />
        </div>
      </div>

      <SubmitButton label="Publicar propuesta" pendingLabel="Publicando..." />
    </form>
  );
}
