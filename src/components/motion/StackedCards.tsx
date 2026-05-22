"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

interface StackedCardsProps {
  children: ReactNode[];
  /** Top offset (rem o px) donde se pinnean las cards. Default "6rem". */
  topOffset?: string;
  /** Espacio (vh) entre cada card. Más alto = scroll más largo entre stacks. */
  spacing?: string;
}

// ─── StackedCards ─────────────────────────────────────────────────────────────
// Deck-stack real estilo Apple/Linear:
//   - Cada card es position: sticky top-{offset} dentro del contenedor.
//   - Las cards anteriores se ESCALAN (más chicas) y se TRASLADAN UP cuando
//     llegan las siguientes — así sus tops "asoman" arriba de la card del
//     frente y se ve claramente el efecto pila de cartas.
//   - Z-index creciente: la última es la del frente.
//
// FIX importante (no romper la última card):
//   - La última card lleva marginBottom = 0 (no agrega espacio blanco abajo).
//   - El contenedor termina justo donde termina la última card, así la
//     siguiente sección aparece pegada inmediatamente. La última card todavía
//     tiene una runway de sticky igual a su PROPIA altura (700-800px típico)
//     porque sticky se rompe cuando container.bottom - 96px ≤ scrollY, y
//     container.bottom = ultimaCard.bottom. Eso da tiempo suficiente para
//     verla "apilada" antes de que se despegue.
export function StackedCards({
  children,
  topOffset = "6rem",
  spacing = "30vh",
}: StackedCardsProps) {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (shouldReduce) {
    return (
      <div className="space-y-8">
        {children.map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>
    );
  }

  const total = children.length;

  return (
    // display: flow-root crea un nuevo block formatting context para que la
    // marginBottom de las cards intermedias no se "escape" por margin collapse.
    // SIN paddingBottom ni marginBottom negativo: la última card tiene su
    // propio sticky runway (su altura) y la siguiente sección viene pegada.
    <div
      ref={containerRef}
      className="relative"
      style={{ display: "flow-root" }}
    >
      {children.map((child, i) => (
        <StackCard
          key={i}
          index={i}
          total={total}
          topOffset={topOffset}
          spacing={spacing}
          scrollYProgress={scrollYProgress}
        >
          {child}
        </StackCard>
      ))}
    </div>
  );
}

interface StackCardProps {
  children: ReactNode;
  index: number;
  total: number;
  topOffset: string;
  spacing: string;
  scrollYProgress: MotionValue<number>;
}

function StackCard({
  children,
  index,
  total,
  topOffset,
  spacing,
  scrollYProgress,
}: StackCardProps) {
  // Posición de la card en el deck contando desde el frente.
  // Card del frente (última) = depth 0. La anterior = depth 1. Etc.
  const depth = total - index - 1;

  // Cada card empieza a animarse al "turno" de la que está atrás de ella
  // (cuando la próxima entra encima). El factor `start` es la posición
  // (0..1) del scrollYProgress donde la card comienza a escalar/trasladar.
  const start = (index + 1) / total;

  // Escala final: cuanto más atrás está la card en el deck, más chica queda.
  // 6% por nivel de profundidad — suficiente para que se vea apilado real.
  const targetScale = 1 - 0.06 * depth;

  // TranslateY: las cards anteriores se mueven HACIA ARRIBA para que su top
  // asome por encima de la card del frente. 12px por nivel de profundidad.
  // La última card (depth 0) no se mueve.
  const targetY = -12 * depth;

  const scale = useTransform(scrollYProgress, [start, 1], [1, targetScale]);
  const y = useTransform(scrollYProgress, [start, 1], [0, targetY]);

  // Última card: SIN marginBottom (la siguiente sección viene pegada).
  // Cards intermedias: marginBottom = spacing (runway para la próxima card).
  const isLast = index === total - 1;

  return (
    <motion.div
      style={{
        position: "sticky",
        top: topOffset,
        zIndex: index + 1,
        scale,
        y,
        transformOrigin: "top center",
        marginBottom: isLast ? 0 : spacing,
      }}
    >
      {children}
    </motion.div>
  );
}
