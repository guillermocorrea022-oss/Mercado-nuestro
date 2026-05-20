import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { IconMN } from "@/components/ui/IconMN";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { FloatingHeaderShell } from "./FloatingHeaderShell";

// Navbar como app-web: links directos a las páginas funcionales del sitio.
// El home queda como landing explicativa pero el resto del sitio es la
// app navegable propiamente dicha — el usuario que ya entendió la propuesta
// puede saltar directo a explorar campañas, marketplace o stock.
const navLinks = [
  { href: "/campanas", label: "Campañas" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/disponible", label: "Disponible" },
  { href: "/como-funciona", label: "Cómo funciona" },
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
      <div className="flex h-14 items-center justify-between gap-4 pl-3 pr-2 sm:pl-4 sm:pr-3">
        <Link href="/" className="flex items-center" aria-label="Mercado Nuestro — Inicio">
          {/* Mobile: isotipo solo (espacio reducido). Desktop: logo horizontal. */}
          <Image
            src="/logos/07_isotipo-principal_color.png"
            alt="Mercado Nuestro"
            width={36}
            height={36}
            className="sm:hidden"
            priority
          />
          <Image
            src="/logos/01_principal.png"
            alt="Mercado Nuestro"
            width={160}
            height={36}
            className="hidden sm:block"
            style={{ height: "auto", width: "auto", maxHeight: "36px" }}
            priority
          />
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
                className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-secondary"
                aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
              >
                <IconMN name="notificaciones" size={20} alt="" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-yellow px-1 text-[10px] font-bold text-yellow-foreground">
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/perfil"
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-secondary"
              >
                <IconMN name="usuario" size={20} alt="" />
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
                href="/login"
                className="hidden h-9 items-center rounded-full border border-primary px-4 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:-translate-y-0.5 shadow-glow"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </FloatingHeaderShell>
  );
}
