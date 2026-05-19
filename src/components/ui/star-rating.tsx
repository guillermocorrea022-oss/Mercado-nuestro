import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  /** Valor entre 0 y 5 (acepta decimales). */
  value: number;
  /** Tamaño del icono en clases tailwind (default size-4). */
  size?: string;
  className?: string;
};

// Estrella rellena/parcial según el valor. Inspirado en testimonials de
// FUN Parque (6-7 estrellas se ven con muchas filled).
export function StarRating({ value, size = "size-4", className }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((i) => {
        const fill = Math.min(1, Math.max(0, value - (i - 1))) * 100;
        return (
          <span key={i} className={cn("relative", size)}>
            <Star
              className={cn("absolute inset-0 text-border", size)}
              aria-hidden
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill}%` }}
              aria-hidden
            >
              <Star
                className={cn("text-primary", size)}
                fill="currentColor"
                aria-hidden
              />
            </span>
          </span>
        );
      })}
      <span className="sr-only">{value} de 5 estrellas</span>
    </div>
  );
}
