"use client";

import { useActionState, useRef } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaignStatusUpdateAction } from "@/app/admin/actions";

const initialState = { status: "idle" as const };

const UPDATE_TYPES = [
  { value: "pedido_confirmado_proveedor", label: "Pedido confirmado con proveedor" },
  { value: "producto_despachado_origen", label: "Producto despachado desde origen" },
  { value: "en_transito", label: "En tránsito" },
  { value: "llego_aduana", label: "Llegó a aduana" },
  { value: "despacho_aduanero", label: "En despacho aduanero" },
  { value: "llego_deposito", label: "Llegó al depósito" },
  { value: "listo_entrega", label: "Listo para entrega" },
  { value: "mensaje_general", label: "Mensaje general" },
];

export function CreateStatusUpdateForm({ campaignId }: { campaignId: string }) {
  const [state, formAction] = useActionState(
    createCampaignStatusUpdateAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <input type="hidden" name="campaign_id" value={campaignId} />
      <FormError message={state.message} />

      <div>
        <Label htmlFor="type">Tipo de actualización</Label>
        <select
          id="type"
          name="type"
          defaultValue="mensaje_general"
          className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {UPDATE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          minLength={5}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div>
        <Label htmlFor="photo_url">Foto (URL, opcional)</Label>
        <Input
          id="photo_url"
          name="photo_url"
          type="url"
          className="mt-1.5"
          placeholder="https://..."
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="visible_to_users"
          defaultChecked
          className="size-4 rounded border-input bg-background"
        />
        Visible para los participantes
      </label>

      <SubmitButton label="Publicar actualización" pendingLabel="Publicando..." />
    </form>
  );
}
