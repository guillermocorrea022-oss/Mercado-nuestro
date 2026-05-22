"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { signInAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

interface SignInFormProps {
  next?: string;
}

// Estilo branded: inputs altos con focus brand-blue, labels en bold uppercase
// chiquitas, espacio cómodo entre campos.
const inputClass =
  "block w-full rounded-xl border border-neutral-gray-300 bg-white px-4 py-3 text-sm text-neutral-gray-700 transition-colors placeholder:text-neutral-gray-300 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70";

export function SignInForm({ next }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.message} />

      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <Link
            href="/recuperar-password"
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            ¿La olvidaste?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={`${inputClass} mt-2`}
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton label="Entrar" pendingLabel="Entrando..." />
    </form>
  );
}
