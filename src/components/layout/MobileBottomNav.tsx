"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconMN, type IconMNName } from "@/components/ui/IconMN";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: IconMNName;
  /** Función para decidir si este item está activo según el pathname actual. */
  match: (path: string) => boolean;
};

// 5 items principales — uno por línea funcional + cuenta. Diseñado para sentir
// como una app nativa: tap targets grandes, ítem activo destacado, iconos del
// kit oficial Mercado Nuestro.
const items: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    icon: "tienda",
    match: (p) => p === "/",
  },
  {
    href: "/campanas",
    label: "Campañas",
    icon: "compra_grupal",
    match: (p) => p.startsWith("/campanas"),
  },
  {
    href: "/marketplace",
    label: "Buscar",
    icon: "buscar",
    match: (p) => p.startsWith("/marketplace") || p.startsWith("/disponible"),
  },
  {
    href: "/perfil/mis-compras",
    label: "Pedidos",
    icon: "pedidos",
    match: (p) => p.startsWith("/perfil/mis-compras") || p.startsWith("/pedidos"),
  },
  {
    href: "/perfil",
    label: "Cuenta",
    icon: "usuario",
    match: (p) => p.startsWith("/perfil") && !p.startsWith("/perfil/mis-compras"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Navegación principal mobile"
      className={cn(
        // Visible solo en mobile (≤ sm). Sticky abajo con safe-area-inset
        // para iOS PWAs / notch devices.
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl lg:hidden",
        "pb-[max(env(safe-area-inset-bottom),0px)]",
      )}
    >
      <ul className="flex h-16 items-stretch justify-around">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary/10",
                  )}
                >
                  <IconMN name={item.icon} size={22} alt="" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
