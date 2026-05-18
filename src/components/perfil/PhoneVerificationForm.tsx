"use client";

import { useActionState } from "react";

import {
  FormError,
  FormSuccess,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sendPhoneCodeAction,
  verifyPhoneCodeAction,
} from "@/app/(user)/perfil/verificacion-telefono/actions";
import { initialPhoneFormState } from "@/app/(user)/perfil/verificacion-telefono/state";

type Props = {
  currentPhone: string | null;
};

export function PhoneVerificationForm({ currentPhone }: Props) {
  const [sendState, sendAction] = useActionState(
    sendPhoneCodeAction,
    initialPhoneFormState,
  );
  const [verifyState, verifyAction] = useActionState(
    verifyPhoneCodeAction,
    initialPhoneFormState,
  );

  const codeWasSent =
    sendState.status === "code_sent" && verifyState.status !== "verified";

  if (verifyState.status === "verified") {
    return (
      <FormSuccess message={verifyState.message ?? "Teléfono verificado."} />
    );
  }

  return (
    <div className="space-y-6">
      <form
        action={sendAction}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
        noValidate
      >
        <div>
          <h2 className="text-base font-semibold">Paso 1 — Tu número</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Te vamos a enviar un código de 6 dígitos por SMS.
          </p>
        </div>

        {sendState.status === "error" ? (
          <FormError message={sendState.message} />
        ) : null}

        <div>
          <Label htmlFor="phone">Número de celular</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+59899123456"
            defaultValue={currentPhone ?? ""}
            className="mt-1.5"
          />
        </div>

        <SubmitButton
          label={codeWasSent ? "Reenviar código" : "Enviar código"}
          pendingLabel="Enviando..."
        />

        {codeWasSent ? (
          <FormSuccess message={sendState.message} />
        ) : null}

        {sendState.stubCode ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
            <p className="font-medium text-amber-900">
              Modo demo — código generado:
            </p>
            <p className="mt-1 font-mono text-lg tracking-widest text-amber-900">
              {sendState.stubCode}
            </p>
            <p className="mt-1 text-xs text-amber-900/80">
              En producción el código llega por SMS y nunca se muestra acá.
            </p>
          </div>
        ) : null}
      </form>

      {codeWasSent ? (
        <form
          action={verifyAction}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
          noValidate
        >
          <div>
            <h2 className="text-base font-semibold">
              Paso 2 — Ingresá el código
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Expira a los 10 minutos.
            </p>
          </div>

          {verifyState.status === "error" ? (
            <FormError message={verifyState.message} />
          ) : null}

          <div>
            <Label htmlFor="code">Código de 6 dígitos</Label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              className="mt-1.5 font-mono tracking-widest"
            />
          </div>

          <SubmitButton label="Verificar" pendingLabel="Verificando..." />
        </form>
      ) : null}
    </div>
  );
}
