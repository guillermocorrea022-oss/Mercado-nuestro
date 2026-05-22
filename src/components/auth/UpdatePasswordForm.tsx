"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { updatePasswordAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

const inputClass =
  "block w-full rounded-xl border border-neutral-gray-300 bg-white px-4 py-3 text-sm text-neutral-gray-700 transition-colors placeholder:text-neutral-gray-300 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.message} />

      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña nueva
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Mínimo 8 caracteres"
          className={`${inputClass} mt-2`}
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <div>
        <label htmlFor="passwordConfirm" className={labelClass}>
          Repetir contraseña
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className={`${inputClass} mt-2`}
        />
        <FieldError errors={state.fieldErrors?.passwordConfirm} />
      </div>

      <SubmitButton label="Guardar contraseña" pendingLabel="Guardando..." />
    </form>
  );
}
