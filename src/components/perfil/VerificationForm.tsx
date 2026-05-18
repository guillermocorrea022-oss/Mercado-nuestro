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
import { submitVerificationAction } from "@/app/(user)/perfil/verificacion-identidad/actions";
import { initialVerificationState } from "@/app/(user)/perfil/verificacion-identidad/state";

export function VerificationForm() {
  const [state, formAction] = useActionState(
    submitVerificationAction,
    initialVerificationState,
  );

  if (state.status === "ok") {
    return <FormSuccess message={state.message} />;
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <FormError message={state.message} />

      <div>
        <Label htmlFor="type">Tipo de documento</Label>
        <select
          id="type"
          name="type"
          required
          defaultValue="cedula"
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="cedula">Cédula uruguaya</option>
          <option value="rut">RUT</option>
          <option value="comprobante_domicilio">Comprobante de domicilio</option>
        </select>
        <FieldError errors={state.fieldErrors?.type} />
      </div>

      <div>
        <Label htmlFor="fileUrl">Link al documento</Label>
        <Input
          id="fileUrl"
          name="fileUrl"
          type="url"
          required
          placeholder="https://..."
          className="mt-1.5"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Subí tu foto a Google Drive, Imgur o similar (debe ser pública o con
          link visible) y pegá la URL acá. En Fase 3 vas a poder subirla
          directamente.
        </p>
        <FieldError errors={state.fieldErrors?.fileUrl} />
      </div>

      <SubmitButton label="Enviar para revisión" pendingLabel="Enviando..." />
    </form>
  );
}
