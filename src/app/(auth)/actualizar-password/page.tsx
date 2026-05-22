import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Crear contraseña nueva",
};

export default async function ActualizarPasswordPage() {
  // Esta página solo tiene sentido si el usuario está logueado (vino del link
  // del email, /auth/callback ya intercambió el code por sesión).
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
        Casi listo
      </p>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-4xl">
        Crear contraseña nueva
      </h1>
      <p className="mt-2 text-sm text-neutral-gray-700/70 sm:text-base">
        Elegí una contraseña fuerte. Vas a usarla la próxima vez que entres.
      </p>

      <div className="mt-8">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
