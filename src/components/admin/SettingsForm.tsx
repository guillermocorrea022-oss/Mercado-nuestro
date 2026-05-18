"use client";

import { useActionState } from "react";

import {
  FormError,
  FormSuccess,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettingsAction } from "@/app/admin/actions";

const initialState = { status: "idle" as const };

export interface SettingRow {
  key: string;
  value: unknown;
  description: string | null;
  value_type: string | null;
}

export function SettingsForm({ settings }: { settings: SettingRow[] }) {
  const [state, formAction] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormError message={state.message} />
      {state.status === "idle" && state.message === undefined ? null : null}

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {settings.map((s, idx) => {
          const valueStr =
            typeof s.value === "object"
              ? JSON.stringify(s.value)
              : String(s.value);
          const type = s.value_type ?? "string";

          return (
            <div key={s.key} className="p-5 sm:flex sm:items-center sm:gap-6">
              <input type="hidden" name={`key-${idx}`} value={s.key} />
              <input type="hidden" name={`type-${idx}`} value={type} />

              <div className="sm:flex-1">
                <Label htmlFor={`value-${idx}`} className="text-sm font-medium">
                  {s.key}
                </Label>
                {s.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-2 sm:mt-0 sm:w-64">
                {type === "boolean" ? (
                  <select
                    id={`value-${idx}`}
                    name={`value-${idx}`}
                    defaultValue={valueStr}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <Input
                    id={`value-${idx}`}
                    name={`value-${idx}`}
                    type={type === "number" ? "number" : "text"}
                    step={type === "number" ? "any" : undefined}
                    defaultValue={valueStr.replace(/^"|"$/g, "")}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        {state.status === "idle" && state.message ? (
          <FormSuccess message="Cambios guardados." />
        ) : (
          <span />
        )}
        <SubmitButton
          label="Guardar cambios"
          pendingLabel="Guardando..."
          className="sm:w-auto"
        />
      </div>
    </form>
  );
}
