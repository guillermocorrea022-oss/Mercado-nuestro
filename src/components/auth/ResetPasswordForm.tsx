"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  FormSuccess,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { initialState } from "@/app/(auth)/state";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "success" ? (
        <FormSuccess message={state.message} />
      ) : (
        <FormError message={state.message} />
      )}

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

      <SubmitButton
        label="Mandarme el link"
        pendingLabel="Enviando..."
      />
    </form>
  );
}
