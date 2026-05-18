import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Crear contraseña nueva</CardTitle>
        <CardDescription>
          Elegí una contraseña fuerte. Vas a usarla la próxima vez que entres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
