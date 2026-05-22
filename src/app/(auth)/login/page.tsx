import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Validamos que `next` sea path interno (también lo revalida la action).
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <div>
      {/* Eyebrow */}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
        Bienvenido de nuevo
      </p>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-4xl">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-neutral-gray-700/70 sm:text-base">
        Entrá con tu email y contraseña para reservar y ver tus pedidos.
      </p>

      <div className="mt-8">
        <SignInForm next={safeNext} />
      </div>

      <p className="mt-8 text-sm text-neutral-gray-700/70">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-bold text-brand-blue underline-offset-4 hover:underline"
        >
          Creá una en un minuto
        </Link>
      </p>
    </div>
  );
}
