import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          Contacto
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          ¿Tenés una consulta, una idea de producto o querés sumarte como
          importador avanzado? Escribinos.
        </p>

        <div className="mt-10 space-y-4">
          <a
            href="mailto:hola@mercadonuestro.uy"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-4" aria-hidden />
            </div>
            <div>
              <p className="font-medium">hola@mercadonuestro.uy</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Respondemos en horario comercial (UYT).
              </p>
            </div>
          </a>

          <a
            href="https://wa.me/598"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="size-4" aria-hidden />
            </div>
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Próximamente con respuesta automática las 24 horas.
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-4" aria-hidden />
            </div>
            <div>
              <p className="font-medium">Local físico</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Leandro Gómez 1076, Paysandú, Uruguay.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lun-Vie 9-18hs · Sáb 9-13hs
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
