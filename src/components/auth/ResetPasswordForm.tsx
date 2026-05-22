"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  FormSuccess,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

const inputClass =
  "block w-full rounded-xl border border-neutral-gray-300 bg-white px-4 py-3 text-sm text-neutral-gray-700 transition-colors placeholder:text-neutral-gray-300 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "success" ? (
        <FormSuccess message={state.message} />
      ) : (
        <FormError message={state.message} />
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vos@email.com"
          className={`${inputClass} mt-2`}
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <SubmitButton label="Mandarme el link" pendingLabel="Enviando..." />
    </form>
  );
}
