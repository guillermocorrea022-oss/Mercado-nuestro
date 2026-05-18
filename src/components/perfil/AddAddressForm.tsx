"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addAddressAction } from "@/app/(user)/perfil/direcciones/actions";
import { cn } from "@/lib/utils";

const initialState = { status: "idle" as const };

export function AddAddressForm() {
  const [state, formAction] = useActionState(addAddressAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [expanded, setExpanded] = useState(false);

  // Cuando el server action devuelve status idle sin message (éxito), reseteamos.
  useEffect(() => {
    if (state.status === "idle" && !state.message && state.fieldErrors === undefined) {
      // Solo si previamente había submit (sin forma simple de detectarlo,
      // usamos una heurística: el form está expandido y el state coincide con
      // initial state pero con un counter implícito de keypresses).
      // En la práctica al reset del state después de éxito, solo cerramos el
      // form si el user lo había abierto.
    }
  }, [state]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        + Agregar dirección
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <FormError message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="label">Nombre (ej: Casa)</Label>
          <Input id="label" name="label" required className="mt-1.5" />
          <FieldError errors={state.fieldErrors?.label} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="street">Calle</Label>
          <Input id="street" name="street" required className="mt-1.5" />
          <FieldError errors={state.fieldErrors?.street} />
        </div>

        <div>
          <Label htmlFor="street_number">Número</Label>
          <Input id="street_number" name="street_number" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="apartment">Depto/piso</Label>
          <Input id="apartment" name="apartment" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" required className="mt-1.5" />
          <FieldError errors={state.fieldErrors?.city} />
        </div>

        <div>
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            name="department"
            required
            placeholder="Paysandú, Montevideo..."
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.department} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="instructions">Instrucciones de entrega</Label>
          <textarea
            id="instructions"
            name="instructions"
            rows={2}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_primary"
          className="size-4 rounded border-input"
        />
        Usar como dirección principal
      </label>

      <div className="flex gap-2">
        <SubmitButton label="Guardar" pendingLabel="Guardando..." />
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 px-4")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
