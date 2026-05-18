import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/components/auth/SignInForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Entrá con tu email y contraseña para reservar y ver tus pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm next={safeNext} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Todavía no tenés cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-primary hover:underline"
          >
            Creá una en un minuto
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
