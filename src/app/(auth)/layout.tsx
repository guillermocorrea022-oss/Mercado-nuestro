import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IconMN } from "@/components/ui/IconMN";

// ─── Auth Layout ──────────────────────────────────────────────────────────────
// Layout split-screen branded para todas las pantallas de auth:
//   - LEFT (desktop only): panel azul con logo, tagline y 3 trust points
//     (escrow, comunidad, importación grupal). Esconde en mobile/tablet.
//   - RIGHT: área de formulario centrada, fondo blanco con grain sutil.
//
// El header de mobile/tablet (cuando el panel izquierdo no se ve) muestra
// el logo arriba para mantener la identidad visible.

const TRUST_POINTS = [
  {
    icon: "seguridad" as const,
    title: "Compras protegidas",
    body: "Toda transacción pasa por escrow hasta que confirmás recepción.",
  },
  {
    icon: "compra_grupal" as const,
    title: "Precio mayorista en grupo",
    body: "Importamos juntos y todos pagan el precio del mejor escalón.",
  },
  {
    icon: "ubicacion" as const,
    title: "Operación uruguaya",
    body: "Local físico en Paysandú y soporte en español rioplatense.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ════════ PANEL IZQUIERDO branded (solo desktop) ════════ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-dark p-10 text-white lg:flex xl:p-14">
        {/* Decoración: orbe amarillo blur en esquina */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-yellow/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 size-[24rem] rounded-full bg-brand-yellow/10 blur-3xl"
        />

        {/* Top: logo + back to home */}
        <div className="relative flex items-center justify-between">
          <Link
            href="/"
            className="block"
            aria-label="Mercado Nuestro — Volver al inicio"
          >
            <Image
              src="/logos/05_horizontal_blanco.png"
              alt="Mercado Nuestro"
              width={220}
              height={60}
              priority
              style={{ height: "auto", width: "auto", maxHeight: "60px" }}
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Inicio
          </Link>
        </div>

        {/* Middle: headline + trust points */}
        <div className="relative">
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight xl:text-4xl">
            Importá en grupo, <br />
            <span className="text-brand-yellow">pagá precio mayorista.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 xl:text-base">
            La plataforma uruguaya donde reservás con seña, esperás que se
            complete el grupo y pagás el mejor precio alcanzado.
          </p>

          <ul className="mt-8 space-y-5">
            {TRUST_POINTS.map((p) => (
              <li key={p.title} className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/25 backdrop-blur">
                  <IconMN
                    name={p.icon}
                    variant="blanco"
                    size={26}
                    alt=""
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white xl:text-base">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/75 xl:text-sm">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: dirección + microcopy */}
        <div className="relative text-xs text-white/60">
          <p>
            <strong className="font-semibold text-white/85">
              Mercado Nuestro
            </strong>{" "}
            · Leandro Gómez 1076, Paysandú, Uruguay
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} — Todos los derechos reservados
          </p>
        </div>
      </aside>

      {/* ════════ ÁREA DEL FORMULARIO (derecha) ════════ */}
      <div className="relative flex min-h-screen flex-col bg-white">
        {/* Header mobile: logo + back (en desktop el panel izquierdo
            cubre esta info, en mobile la mostramos arriba) */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-gray-50 bg-white px-4 sm:px-6 lg:hidden">
          <Link href="/" aria-label="Mercado Nuestro — Volver al inicio">
            <Image
              src="/logos/01_principal.png"
              alt="Mercado Nuestro"
              width={150}
              height={40}
              priority
              style={{ height: "auto", width: "auto", maxHeight: "40px" }}
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-gray-700/70 transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Inicio
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
