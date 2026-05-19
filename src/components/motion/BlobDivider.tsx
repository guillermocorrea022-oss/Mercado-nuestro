import { cn } from "@/lib/utils";

type Props = {
  /** Posición y orientación de la decoración. */
  variant?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  /** Color del blob — clase Tailwind tipo bg-primary/15. */
  className?: string;
  /** Si la animación float aplica (default true). */
  float?: boolean;
  /** Variante del shape (organic SVG paths). */
  shape?: 1 | 2 | 3;
};

const SHAPES = {
  1: "M40.3,-58.7C53.5,-50.8,66.7,-42.4,71.4,-30.1C76,-17.8,72.2,-1.5,67.1,12.6C62,26.8,55.7,38.8,45.7,49.4C35.7,60,22,69.2,7.1,71.3C-7.7,73.5,-23.7,68.6,-35.7,59.8C-47.7,51,-55.6,38.4,-61.5,24.8C-67.4,11.3,-71.2,-3.1,-69.5,-17.4C-67.8,-31.6,-60.5,-45.6,-49.4,-54.2C-38.2,-62.8,-23.1,-66,-9.1,-65.4C4.8,-64.8,27.2,-66.7,40.3,-58.7Z",
  2: "M48.2,-66.7C61.4,-58.4,70.2,-43.6,73.4,-28.3C76.6,-13.1,74.2,2.6,67.9,15.7C61.7,28.8,51.6,39.3,40.2,49.1C28.7,58.9,15.9,68,1.5,66.1C-13,64.2,-26,51.4,-37.7,40.6C-49.4,29.8,-59.9,21,-65.4,9.2C-70.9,-2.5,-71.4,-17.3,-65.7,-29.5C-60,-41.7,-48.1,-51.4,-35.4,-58.9C-22.7,-66.3,-9.3,-71.6,4.4,-72.9C18.1,-74.2,35,-75,48.2,-66.7Z",
  3: "M37.5,-52.3C50.5,-46.1,64.2,-38.5,71.7,-26.6C79.2,-14.7,80.5,1.5,76,16.1C71.6,30.6,61.6,43.6,49.1,52.5C36.7,61.5,21.9,66.5,6.3,68.4C-9.4,70.4,-25.9,69.4,-37.5,61.4C-49,53.4,-55.6,38.5,-62.7,23.2C-69.8,7.9,-77.3,-7.7,-74.7,-21.3C-72.1,-34.9,-59.4,-46.4,-45.6,-53.1C-31.7,-59.8,-16.8,-61.7,-2.4,-58.5C12.1,-55.3,24.5,-58.4,37.5,-52.3Z",
};

const POSITIONS: Record<NonNullable<Props["variant"]>, string> = {
  "top-left": "-top-32 -left-32",
  "top-right": "-top-32 -right-32",
  "bottom-left": "-bottom-32 -left-32",
  "bottom-right": "-bottom-32 -right-32",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

// Blob SVG decorativo inspirado en FUN Parque — formas orgánicas que rompen
// el ritmo entre secciones. Pensado para usar en `relative isolate
// overflow-hidden` con `aria-hidden`.
export function BlobDivider({
  variant = "top-right",
  className,
  float = true,
  shape = 1,
}: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 size-[520px] opacity-60 mix-blend-multiply",
        POSITIONS[variant],
        float && "animate-float-slow",
      )}
    >
      <svg
        viewBox="-100 -100 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-full w-full", className ?? "fill-primary/8")}
      >
        <path d={SHAPES[shape]} />
      </svg>
    </div>
  );
}
