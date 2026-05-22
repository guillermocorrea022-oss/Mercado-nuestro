import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Verificá tu email",
};

export default async function VerificaEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div>
      {/* Icono grande de check email — feel "lo logramos, solo falta un paso" */}
      <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <MailCheck className="size-9" aria-hidden />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
        Casi listo
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-4xl">
        Confirmá tu email
      </h1>

      <p className="mt-3 text-sm text-neutral-gray-700/70 sm:text-base">
        {email ? (
          <>
            Te mandamos un link a{" "}
            <span className="font-bold text-neutral-gray-700">{email}</span>.
          </>
        ) : (
          "Te mandamos un link de confirmación a tu casilla."
        )}{" "}
        Hacé clic en el botón del email para activar tu cuenta.
      </p>

      <div className="mt-8 space-y-3 rounded-xl border border-neutral-gray-50 bg-neutral-gray-50/50 p-5 text-sm text-neutral-gray-700/80">
        <p>
          <strong className="font-bold text-neutral-gray-700">Tip:</strong> si
          no lo ves en la bandeja de entrada, revisá la carpeta de spam o
          promociones.
        </p>
        <p>El link expira en 24 horas.</p>
      </div>

      <p className="mt-8 text-sm text-neutral-gray-700/70">
        ¿Email equivocado?{" "}
        <Link
          href="/registro"
          className="font-bold text-brand-blue underline-offset-4 hover:underline"
        >
          Volvé a registrarte
        </Link>
      </p>
    </div>
  );
}
