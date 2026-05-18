"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Label } from "@/components/ui/label";
import { createClaimAction } from "@/app/(user)/perfil/reclamos/actions";

const initialState = { status: "idle" as const };

const CLAIM_TYPES = [
  { value: "defectuoso", label: "El producto llegó defectuoso" },
  { value: "no_llego", label: "Nunca llegó" },
  { value: "llego_equivocado", label: "Llegó otro producto" },
  { value: "faltante", label: "Faltaron unidades" },
  {
    value: "no_corresponde_descripcion",
    label: "No corresponde a la descripción",
  },
  { value: "otro", label: "Otro motivo" },
];

export function NewClaimForm() {
  const [state, formAction] = useActionState(createClaimAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <div>
        <Label htmlFor="type">Motivo del reclamo</Label>
        <select
          id="type"
          name="type"
          required
          defaultValue="defectuoso"
          className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CLAIM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Contanos qué pasó</Label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          minLength={20}
          placeholder="Detallá lo que pasó, fecha de entrega, número de pedido si lo tenés..."
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <SubmitButton label="Abrir reclamo" pendingLabel="Enviando..." />
    </form>
  );
}
