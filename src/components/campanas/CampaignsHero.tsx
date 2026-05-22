import { IconMN } from "@/components/ui/IconMN";

// ─── CampaignsHero ────────────────────────────────────────────────────────────
// Banner azul de bienvenida a la sección Campañas. Estilo "elevator pitch":
// título grande + 4 pasos en línea con flechas conectoras.
//
// Inspirado en el mockup de la app: gradient azul de Mercado Nuestro
// (brand-blue → brand-blue-dark), bordes redondeados, número en círculo
// + título corto por paso.

const STEPS: {
  number: number;
  icon: "billetera" | "compra_grupal" | "importar" | "paquete";
  title: string;
}[] = [
  { number: 1, icon: "billetera", title: "Reservás con seña" },
  { number: 2, icon: "compra_grupal", title: "Se completa el MOQ" },
  { number: 3, icon: "importar", title: "Importamos" },
  { number: 4, icon: "paquete", title: "Recibís o retirás" },
];

export function CampaignsHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-blue-dark p-6 text-white shadow-lg sm:p-8">
      {/* Decoración: orbe amarillo blur en esquina inferior derecha */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full bg-brand-yellow/20 blur-2xl"
      />

      <div className="relative">
        <h2 className="text-center text-xl font-extrabold leading-tight sm:text-2xl">
          Comprá junto a otros y{" "}
          <span className="text-brand-yellow">pagá mejor</span>
        </h2>
        <p className="mt-1 text-center text-xs text-white/80 sm:text-sm">
          El poder de comprar en grupo.
        </p>

        {/* 4 pasos en línea con flechas */}
        <div className="mt-6 grid grid-cols-4 items-start gap-1 sm:gap-3">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Círculo con icono */}
              <div className="relative flex size-14 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30 backdrop-blur sm:size-16">
                <IconMN
                  name={step.icon}
                  variant="blanco"
                  size={28}
                  alt=""
                  className="opacity-95"
                />
                {/* Número chiquito arriba a la derecha */}
                <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-brand-yellow text-[10px] font-extrabold text-neutral-gray-700">
                  {step.number}
                </span>
              </div>

              {/* Flecha conectora (solo si no es el último) */}
              {idx < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-7 hidden translate-x-1/2 text-white/40 sm:block"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <p className="mt-2 text-[10px] font-semibold leading-tight text-white/95 sm:text-xs">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
