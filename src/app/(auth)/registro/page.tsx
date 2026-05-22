import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Sumate a Mercado Nuestro y empezá a comprar en grupo.",
};

export default function RegistroPage() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
        Sumate a la comunidad
      </p>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-4xl">
        Crear cuenta
      </h1>
      <p className="mt-2 text-sm text-neutral-gray-700/70 sm:text-base">
        Te toma menos de un minuto. Después podés reservar en cualquier campaña
        activa.
      </p>

      <div className="mt-8">
        <SignUpForm />
      </div>

      <p className="mt-8 text-sm text-neutral-gray-700/70">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-bold text-brand-blue underline-offset-4 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
