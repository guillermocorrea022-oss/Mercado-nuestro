import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/Container";

type Props = {
  title: string;
  eyebrow?: string;
  intro?: string;
  children: React.ReactNode;
};

export function LegalPage({ title, eyebrow, intro, children }: Props) {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio
        </Link>

        {eyebrow ? (
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 text-base text-muted-foreground">{intro}</p>
        ) : null}

        <div className="prose prose-sm mt-10 max-w-none space-y-4 text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground">
          {children}
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          Última actualización:{" "}
          {new Date().toLocaleDateString("es-UY", { dateStyle: "long" })}.
          Consultas a hola@mercadonuestro.uy.
        </p>
      </div>
    </Container>
  );
}
