import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function RecuperarPasswordPage() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
        Recuperar acceso
      </p>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-4xl">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-sm text-neutral-gray-700/70 sm:text-base">
        Ingresá tu email y te mandamos un link para crear una nueva.
      </p>

      <div className="mt-8">
        <ResetPasswordForm />
      </div>

      <p className="mt-8 text-sm text-neutral-gray-700/70">
        ¿Te acordaste?{" "}
        <Link
          href="/login"
          className="font-bold text-brand-blue underline-offset-4 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
