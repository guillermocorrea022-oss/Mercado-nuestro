import { IconMN, type IconMNName } from "@/components/ui/IconMN";

import { AppContainer } from "@/components/layout/AppContainer";

// ─── ServiceStrip ─────────────────────────────────────────────────────────────
// Tira de 5 servicios destacados con cards verticales centradas estilo
// Mercado Libre / Temu. Cada card tiene un círculo grande con fondo azul
// claro y el ícono color (con tonos brand blue+yellow) dentro.
//
// La sección está pensada para SOLAPARSE con el HeroCarousel: usa una
// negative margin-top (-mt-12 lg:-mt-20) y z-10 para que las cards queden
// "mitad sobre el hero, mitad sobre la página" y unan ambas piezas
// visualmente.

interface ServiceItem {
  icon: IconMNName;
  title: string;
  subtitle: string;
}

const SERVICES: ServiceItem[] = [
  {
    icon: "envios",
    title: "Envío gratis",
    subtitle: "En compras desde $1.500",
  },
  {
    icon: "seguridad",
    title: "Compra protegida",
    subtitle: "Pago seguro con escrow",
  },
  {
    icon: "pagar",
    title: "Hasta 12 cuotas",
    subtitle: "Con tarjeta de crédito",
  },
  {
    icon: "devoluciones",
    title: "Devolución gratis",
    subtitle: "Tenés 7 días para reclamar",
  },
  {
    icon: "tienda",
    title: "Retiro en Paysandú",
    subtitle: "Leandro Gómez 1076",
  },
];

export function ServiceStrip() {
  return (
    <section className="relative z-10 -mt-12 pb-8 sm:-mt-16 sm:pb-10 lg:-mt-24">
      <AppContainer>
        <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="group flex w-[180px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/40 bg-white p-5 text-center shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:w-auto"
            >
              {/* Círculo grande con gradient azul + ícono color centrado.
                  El gradient sutil da profundidad y los tonos amarillos del
                  ícono color contrastan bien con el azul. */}
              <span className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/15 via-brand-blue/10 to-brand-blue/5 ring-1 ring-brand-blue/10 transition-transform group-hover:scale-105">
                <IconMN
                  name={service.icon}
                  variant="color"
                  size={52}
                  alt=""
                />
              </span>
              <div className="leading-tight">
                <p className="whitespace-nowrap text-sm font-extrabold text-neutral-gray-700 sm:text-base">
                  {service.title}
                </p>
                <p className="mt-1 text-xs leading-snug text-neutral-gray-700/65 sm:whitespace-normal">
                  {service.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
