"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.lastName} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1.5"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <div>
        <Label htmlFor="passwordConfirm">Repetir contraseña</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1.5"
        />
        <FieldError errors={state.fieldErrors?.passwordConfirm} />
      </div>

      <SubmitButton label="Crear cuenta" pendingLabel="Creando cuenta..." />

      <p className="text-center text-sm text-muted-foreground">
        Al crear una cuenta aceptás los{" "}
        <Link href="/terminos" className="underline hover:text-foreground">
          términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="underline hover:text-foreground">
          política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
