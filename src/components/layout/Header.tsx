import Link from "next/link";
import { Bell, LogOut, UserRound } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { FloatingHeaderShell } from "./FloatingHeaderShell";

const navLinks = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/#lineas", label: "Líneas" },
  { href: "/#grupos", label: "Grupos" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/#testimonios", label: "Testimonios" },
];

// Header isla flotante con scroll-aware behavior. Visible al cargar,
// se oculta al scroll-down y reaparece al scroll-up. Estilo FUN Parque:
// pill rounded, backdrop-blur, max-width centrado.
//
// La logica de scroll vive en FloatingHeaderShell (client component).
// El Header sigue siendo server async para leer la sesion.
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
    <FloatingHeaderShell>
      <div className="flex h-14 items-center justify-between gap-4 pl-5 pr-2 sm:pl-6 sm:pr-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight"
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
          className="hidden lg:flex items-center gap-1"
          aria-label="Menú principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link
                href="/perfil/notificaciones"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "relative rounded-full",
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
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-secondary",
                )}
              >
                <UserRound className="size-4" aria-hidden />
                <span className="hidden sm:inline">Mi cuenta</span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
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
                className="hidden h-9 items-center rounded-full border border-foreground px-4 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-white sm:inline-flex"
              >
                Precios
              </Link>
              <Link
                href="/#reservar"
                className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              >
                Reservar
              </Link>
            </>
          )}
        </div>
      </div>
    </FloatingHeaderShell>
  );
}
