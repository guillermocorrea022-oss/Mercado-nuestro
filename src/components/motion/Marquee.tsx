import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  /** Tiempo de un ciclo entero en segundos. Default 30. */
  duration?: number;
  /** Color de fondo. Default bg-primary (lime green). */
  background?: string;
  /** Color del texto. Default text-foreground. */
  textColor?: string;
  /** Separador entre items (default "★"). */
  separator?: string;
  className?: string;
};

// Marquee infinito horizontal con items duplicados (para loop suave).
// Estilo FUN Parque: barra colorida con texto bold uppercase corriendo.
export function Marquee({
  items,
  duration = 30,
  background = "bg-primary",
  textColor = "text-foreground",
  separator = "★",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden border-y-2 border-foreground/10 py-3",
        background,
        textColor,
        className,
      )}
    >
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ animationDuration: `${duration}s` }}
      >
        {Array.from({ length: 2 }).map((_, dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-10 pr-10">
            {items.flatMap((item, i) => [
              <span
                key={`${dup}-${i}-text`}
                className="text-sm font-extrabold uppercase tracking-wider"
              >
                {item}
              </span>,
              <span
                key={`${dup}-${i}-sep`}
                className="text-xs opacity-50"
                aria-hidden
              >
                {separator}
              </span>,
            ])}
          </div>
        ))}
      </div>
    </div>
  );
}
