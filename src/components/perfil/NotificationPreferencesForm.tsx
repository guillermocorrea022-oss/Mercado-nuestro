"use client";

import { useActionState } from "react";

import {
  FormError,
  FormSuccess,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { updateNotificationPrefsAction } from "@/app/(user)/perfil/notificaciones/preferencias/actions";
import { initialPreferencesState } from "@/app/(user)/perfil/notificaciones/preferencias/state";

type Channel = "in_app" | "email" | "sms" | "whatsapp";

const TYPES: { key: string; label: string; description: string }[] = [
  {
    key: "campaign_updates",
    label: "Avances de campañas",
    description: "Cambios de estado, despachos, llegada de productos.",
  },
  {
    key: "marketplace_orders",
    label: "Marketplace",
    description: "Tus compras y ventas en el marketplace.",
  },
  {
    key: "claims",
    label: "Reclamos",
    description: "Actualizaciones de los reclamos abiertos.",
  },
  {
    key: "marketing",
    label: "Novedades y ofertas",
    description: "Anuncios de campañas nuevas y promociones (opt-in).",
  },
];

const CHANNELS: { key: Channel; label: string }[] = [
  { key: "in_app", label: "En la app" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "whatsapp", label: "WhatsApp" },
];

type PrefMap = Record<string, Channel[]>;

export function NotificationPreferencesForm({
  initial,
}: {
  initial: PrefMap;
}) {
  const [state, formAction] = useActionState(
    updateNotificationPrefsAction,
    initialPreferencesState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "ok" ? <FormSuccess message={state.message} /> : null}
      {state.status === "error" ? <FormError message={state.message} /> : null}

      {TYPES.map((t) => {
        const enabled = new Set<Channel>(initial[t.key] ?? ["in_app"]);
        return (
          <div
            key={t.key}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="font-medium">{t.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.description}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHANNELS.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name={`${t.key}_${c.key}`}
                    defaultChecked={enabled.has(c.key)}
                    className="size-4 rounded border-input"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <SubmitButton label="Guardar preferencias" pendingLabel="Guardando..." />
    </form>
  );
}
