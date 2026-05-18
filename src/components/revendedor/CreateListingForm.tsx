"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createListingAction } from "@/app/(user)/perfil/revendedor/actions";

const initialState = { status: "idle" as const };

interface CreateListingFormProps {
  products: { id: string; name: string }[];
}

export function CreateListingForm({ products }: CreateListingFormProps) {
  const [state, formAction] = useActionState(createListingAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <div>
        <Label htmlFor="product_id">Producto</Label>
        <select
          id="product_id"
          name="product_id"
          required
          defaultValue=""
          className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>
            Elegí un producto…
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <FieldError errors={state.fieldErrors?.product_id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="listing-quantity">Cantidad disponible</Label>
          <Input
            id="listing-quantity"
            name="quantity"
            type="number"
            min="1"
            required
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.quantity} />
        </div>
        <div>
          <Label htmlFor="listing-price">Precio por unidad (centavos USD)</Label>
          <Input
            id="listing-price"
            name="price_cents_usd"
            type="number"
            min="1"
            required
            className="mt-1.5"
            placeholder="3000 = USD 30"
          />
          <FieldError errors={state.fieldErrors?.price_cents_usd} />
        </div>
      </div>

      <div>
        <Label htmlFor="listing-description">Notas (opcional)</Label>
        <textarea
          id="listing-description"
          name="description"
          rows={3}
          maxLength={1000}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Estado del producto, garantía, condiciones..."
        />
      </div>

      <SubmitButton label="Publicar en marketplace" pendingLabel="Publicando..." />
    </form>
  );
}
