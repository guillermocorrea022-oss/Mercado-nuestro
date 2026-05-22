"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── CampaignsTabsNav ─────────────────────────────────────────────────────────
// Tabs principales de la sección Campañas, estilo iOS/Android: 3 pestañas con
// underline animado debajo de la activa. Mobile-first, escala bien en desktop.
//
// Tabs:
//   - /app/campanas              → "Activas"
//   - /app/campanas/mis-reservas → "Mis reservas"
//   - /app/campanas/como-funciona → "Cómo funciona"

const TABS = [
  { label: "Activas", href: "/app/campanas" },
  { label: "Mis reservas", href: "/app/campanas/mis-reservas" },
  { label: "Cómo funciona", href: "/app/campanas/como-funciona" },
];

export function CampaignsTabsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones de campañas"
      className="border-b border-border bg-white"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-8">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/app/campanas"
              ? pathname === "/app/campanas"
              : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-3 py-3 text-sm font-bold transition-colors sm:text-base ${
                isActive
                  ? "text-brand-blue"
                  : "text-neutral-gray-700/70 hover:text-neutral-gray-700"
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-brand-blue"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
