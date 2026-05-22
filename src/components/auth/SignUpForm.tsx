"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { signUpAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

// Estilo branded — mismo lenguaje que SignInForm (inputs altos, labels en
// bold uppercase chiquitas, focus ring brand-blue).
const inputClass =
  "block w-full rounded-xl border border-neutral-gray-300 bg-white px-4 py-3 text-sm text-neutral-gray-700 transition-colors placeholder:text-neutral-gray-300 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            placeholder="Juan"
            className={`${inputClass} mt-2`}
          />
          <FieldError errors={state.fieldErrors?.firstName} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            placeholder="Pérez"
            className={`${inputClass} mt-2`}
          />
          <FieldError errors={state.fieldErrors?.lastName} />
        </div>
      </div>

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
        <label htmlFor="password" className={labelClass}>
          Contraseña
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

      <SubmitButton label="Crear cuenta" pendingLabel="Creando cuenta..." />

      <p className="text-center text-xs text-neutral-gray-700/60">
        Al crear una cuenta aceptás los{" "}
        <Link
          href="/terminos"
          className="font-semibold text-neutral-gray-700/80 underline-offset-4 hover:text-brand-blue hover:underline"
        >
          términos
        </Link>{" "}
        y la{" "}
        <Link
          href="/privacidad"
          className="font-semibold text-neutral-gray-700/80 underline-offset-4 hover:text-brand-blue hover:underline"
        >
          política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
