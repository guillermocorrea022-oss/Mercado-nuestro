import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";

import { NewProposalForm } from "@/components/propuestas/NewProposalForm";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Proponer producto",
};

export default function ProponerProductoPage() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/propuestas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ver propuestas existentes
        </Link>

        <Reveal className="mt-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="size-6" aria-hidden />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Proponé un producto
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Si hay algo que te gustaría importar y todavía no abrimos campaña,
            contanos. Cuando suficientes personas se sumen, lo evaluamos para
            convertirlo en campaña oficial.
          </p>
        </Reveal>

        <div className="mt-12">
          <NewProposalForm />
        </div>
      </div>
    </Container>
  );
}
