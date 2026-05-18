import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Container } from "./Container";

const navLinks = [
  { href: "/campanas", label: "Campañas" },
  { href: "/disponible", label: "Disponible" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/ser-vendedor", label: "Ser vendedor" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="inline-block size-3 rounded-full bg-primary"
            />
            <span>Mercado Nuestro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Menú principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className={buttonVariants({ size: "sm" })}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
