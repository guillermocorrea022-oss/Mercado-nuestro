"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activateSellerProfileAction } from "@/app/(user)/perfil/vendedor/actions";

const initialState = { status: "idle" as const };

export function ActivateSellerForm({
  defaultName,
}: {
  defaultName?: string;
}) {
  const [state, formAction] = useActionState(
    activateSellerProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <div>
        <Label htmlFor="display_name">Nombre visible</Label>
        <Input
          id="display_name"
          name="display_name"
          required
          defaultValue={defaultName}
          className="mt-1.5"
          placeholder="Ej: María Pérez"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Es lo que ven tus clientes en el catálogo.
        </p>
        <FieldError errors={state.fieldErrors?.display_name} />
      </div>

      <div>
        <Label htmlFor="slug">Alias para tu link</Label>
        <div className="mt-1.5 flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
          <span className="px-3 text-sm text-muted-foreground">
            mercadonuestro.uy/v/
          </span>
          <input
            id="slug"
            name="slug"
            required
            minLength={3}
            maxLength={40}
            placeholder="maria-perez"
            className="h-9 flex-1 bg-transparent pr-3 text-sm outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Solo minúsculas, números y guiones.
        </p>
        <FieldError errors={state.fieldErrors?.slug} />
      </div>

      <div>
        <Label htmlFor="bio">Bio (opcional)</Label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Contales a tus clientes quién sos..."
        />
      </div>

      <SubmitButton label="Activar mi catálogo" pendingLabel="Activando..." />
    </form>
  );
}
