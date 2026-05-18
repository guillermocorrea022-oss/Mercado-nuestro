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
import { signInAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

interface SignInFormProps {
  next?: string;
}

export function SignInForm({ next }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      {next ? <input type="hidden" name="next" value={next} /> : null}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/recuperar-password"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            ¿La olvidaste?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton label="Entrar" pendingLabel="Entrando..." />
    </form>
  );
}
