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
import { applyImporterAction } from "@/app/(public)/ser-importador/actions";
import { initialImporterState } from "@/app/(public)/ser-importador/state";

export function ImporterApplicationForm() {
  const [state, formAction] = useActionState(
    applyImporterAction,
    initialImporterState,
  );

  if (state.status === "ok") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <FormSuccess message={state.message} />
        <p className="mt-3 text-sm text-muted-foreground">
          Vamos a revisar tu postulación y te contactamos cuando podamos
          coordinar la siguiente etapa.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <FormError message={state.message} />

      <div>
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" name="name" required className="mt-1.5" />
        <FieldError errors={state.fieldErrors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+59899123456"
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="categories">Categorías de interés</Label>
        <Input
          id="categories"
          name="categories"
          placeholder="Tecnología, hogar, indumentaria..."
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="experience">Experiencia importando</Label>
        <textarea
          id="experience"
          name="experience"
          rows={5}
          required
          placeholder="Contanos qué experiencia tenés importando, qué productos, qué volumen, etc."
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <FieldError errors={state.fieldErrors?.experience} />
      </div>

      <SubmitButton label="Enviar postulación" pendingLabel="Enviando..." />
    </form>
  );
}
