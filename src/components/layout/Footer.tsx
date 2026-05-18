import Link from "next/link";

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
    title: "Mercado Nuestro",
    links: [
      { href: "/sobre-nosotros", label: "Sobre nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/blog", label: "Blog" },
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
    <footer className="mt-24 border-t border-border bg-muted/30">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full bg-primary"
            />
            <span className="font-medium">Mercado Nuestro</span>
            <span className="text-muted-foreground">
              · Leandro Gómez 1076, Paysandú, Uruguay
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mercado Nuestro. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
