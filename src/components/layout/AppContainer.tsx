import { cn } from "@/lib/utils";

interface AppContainerProps {
  children: React.ReactNode;
  className?: string;
}

// ─── AppContainer ─────────────────────────────────────────────────────────────
// Container ancho para todas las páginas del Web App (/app/*). A diferencia del
// Container estándar de la web pública (max-w-6xl = 1152px), este usa 1500px
// para alinear con el estándar de marketplaces premium (Mercado Libre ~1200,
// Amazon ~1500, Temu ~1440).
//
// IMPORTANTE: no usar este componente en la web home pública — esa sigue con
// el Container original, no se toca.
export function AppContainer({ children, className }: AppContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
