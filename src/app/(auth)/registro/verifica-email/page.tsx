import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" aria-hidden />
        </div>
        <CardTitle className="text-2xl">Confirmá tu email</CardTitle>
        <CardDescription>
          {email
            ? `Te mandamos un link a ${email}.`
            : "Te mandamos un link de confirmación a tu casilla."}{" "}
          Hacé clic en el botón del email para activar tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Si no lo ves, revisá la carpeta de spam o promociones. El link expira
          en 24 horas.
        </p>
        <p>
          ¿Email equivocado?{" "}
          <Link
            href="/registro"
            className="font-medium text-primary hover:underline"
          >
            Volvé a registrarte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
