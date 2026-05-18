import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Mercado Nuestro es una plataforma uruguaya que democratiza el acceso a precios de importación al por mayor.",
};

export default function QuienesSomosPage() {
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

        <Reveal className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Quiénes somos
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Importar en grupo, pagar precio mayorista
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Nacimos en Paysandú con la idea de que el acceso a precios de
            importación al por mayor no debería ser un privilegio de las
            grandes empresas.
          </p>
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-3xl border border-border shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80"
            alt="Equipo de Mercado Nuestro"
            width={1600}
            height={900}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="mt-12 space-y-6 text-base text-muted-foreground">
          <p>
            Funcionamos juntando demanda real: cada vez que abrimos una campaña,
            los usuarios reservan unidades con una seña y, al cruzar el MOQ,
            todos pagan el mejor precio escalonado alcanzado.
          </p>
          <p>
            Sumamos un marketplace de reventa para que quien importó pueda
            vender el sobrante con plena protección, y un programa de
            vendedores por catálogo para multiplicar nuestra red comercial.
          </p>
          <p>
            Operación inicial 100% en Uruguay, con vocación de seguir creciendo.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-4 text-primary" aria-hidden />
            Local físico
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Leandro Gómez 1076, Paysandú, Uruguay.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Contacto: hola@mercadonuestro.uy
          </p>
        </div>
      </div>
    </Container>
  );
}
