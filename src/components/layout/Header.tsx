import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { Container } from "./Container";

const navLinks = [
  { href: "/campanas", label: "Campañas" },
  { href: "/disponible", label: "Disponible" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/ser-vendedor", label: "Ser vendedor" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            {user ? (
              <>
                <Link
                  href="/perfil"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5",
                  )}
                >
                  <UserRound className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Mi cuenta</span>
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5",
                    )}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </form>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
