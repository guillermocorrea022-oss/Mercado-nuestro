import Link from "next/link";
import { Bell, LogOut, UserRound } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { Container } from "./Container";

const navLinks = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#lineas", label: "Líneas" },
  { href: "/#grupos", label: "Grupos" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#testimonios", label: "Testimonios" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Conteo de notificaciones sin leer (solo si hay sesión).
  let unread = 0;
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unread = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
          >
            <span aria-hidden className="relative flex size-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-30" />
              <span className="relative inline-block size-2.5 rounded-full bg-primary" />
            </span>
            <span>
              Mercado <span className="text-muted-foreground">Nuestro</span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Menú principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/perfil/notificaciones"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "relative",
                  )}
                  aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
                >
                  <Bell className="size-4" aria-hidden />
                  {unread > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </Link>
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
                  href="/#precios"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden font-semibold sm:inline-flex",
                  )}
                >
                  Precios
                </Link>
                <Link
                  href="/#reservar"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "font-semibold shadow-glow",
                  )}
                >
                  Reservar
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
