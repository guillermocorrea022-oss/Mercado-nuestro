import Link from "next/link";
import { MapPin } from "lucide-react";

import { Container } from "./Container";

const footerSections = [
  {
    title: "Comprar",
    links: [
      { href: "/campanas", label: "Campañas activas" },
      { href: "/disponible", label: "Stock disponible" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/como-funciona", label: "Cómo funciona" },
    ],
  },
  {
    title: "Vender",
    links: [
      { href: "/ser-vendedor", label: "Programa de vendedores" },
      { href: "/marketplace/publicar", label: "Publicar en marketplace" },
      { href: "/proponer-producto", label: "Proponer producto" },
    ],
  },
  {
    title: "Nosotros",
    links: [
      { href: "/quienes-somos", label: "Quiénes somos" },
      { href: "/contacto", label: "Contacto" },
      { href: "/ser-importador", label: "Ser importador avanzado" },
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

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border bg-background bg-grain">
      <Container className="py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-xl font-semibold tracking-tight"
            >
              <span aria-hidden className="size-2.5 rounded-full bg-primary" />
              Mercado Nuestro
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma uruguaya de compra colaborativa. Importamos en grupo
              para que pagues precio mayorista.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              Leandro Gómez 1076, Paysandú · Uruguay
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
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

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Mercado Nuestro. Todos los derechos
            reservados.
          </p>
          <p>Hecho en Uruguay 🇺🇾</p>
        </div>
      </Container>
    </footer>
  );
}
