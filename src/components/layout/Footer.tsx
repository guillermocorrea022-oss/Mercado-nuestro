import Image from "next/image";
import Link from "next/link";

import { IconMN } from "@/components/ui/IconMN";

import { Container } from "./Container";

const footerSections = [
  {
    title: "Comprar",
    links: [
      { href: "/app/campanas", label: "Campañas activas" },
      { href: "/app/marketplace", label: "Stock disponible" },
      { href: "/app/marketplace", label: "Marketplace" },
      { href: "/como-funciona", label: "Cómo funciona" },
    ],
  },
  {
    title: "Vender",
    links: [
      { href: "/ser-vendedor", label: "Programa de vendedores" },
      { href: "/app/marketplace/publicar", label: "Publicar en marketplace" },
      { href: "/app/propuestas/nueva", label: "Proponer producto" },
      { href: "/app/ser-importador", label: "Ser importador avanzado" },
    ],
  },
  {
    title: "Nosotros",
    links: [
      { href: "/quienes-somos", label: "Quiénes somos" },
      { href: "/contacto", label: "Contacto" },
      { href: "/centro-ayuda", label: "Centro de ayuda" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terminos", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Privacidad" },
      { href: "/devoluciones", label: "Devoluciones" },
      { href: "/envios", label: "Envíos" },
    ],
  },
];

const contactLines: { icon: "ubicacion" | "soporte" | "tienda"; label: string }[] = [
  { icon: "ubicacion", label: "Leandro Gómez 1076, Paysandú" },
  { icon: "soporte", label: "hola@mercadonuestro.uy" },
  { icon: "tienda", label: "Lun-Vie 9-18 · Sáb 9-13" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-navy-foreground">
      {/* Faja diagonal tricolor arriba — refuerza la entrada al footer. */}
      <div
        aria-hidden
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(105deg, var(--blue) 0 33.33%, var(--yellow) 33.33% 66.66%, var(--navy) 66.66% 100%)",
        }}
      />

      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2.7fr] lg:gap-16">
          {/* Bloque izquierdo: logo oficial + descripción + info contacto */}
          <div>
            <Link href="/" aria-label="Mercado Nuestro — Inicio">
              <Image
                src="/logos/05_horizontal_blanco.png"
                alt="Mercado Nuestro"
                width={240}
                height={56}
                style={{ height: "auto", width: "auto", maxHeight: "64px" }}
              />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/75">
              Plataforma uruguaya de compra colaborativa. Importamos en grupo
              para que pagues precio mayorista.
            </p>

            <ul className="mt-8 space-y-3">
              {contactLines.map((line) => (
                <li key={line.label} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <IconMN name={line.icon} variant="blanco" size={18} alt="" />
                  </span>
                  {line.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Bloque derecho: grid de 4 columnas con links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-yellow">
                  {section.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition-colors hover:text-yellow"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/15 pt-8 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Mercado Nuestro. Todos los derechos
            reservados.
          </p>
          <p className="inline-flex items-center gap-2">
            Hecho en Uruguay
            <span aria-hidden>🇺🇾</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
