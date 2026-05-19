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

// Deck stack real:
// - Cada card es sticky top-{offset} y vive en flujo normal del container.
// - Las cards posteriores tienen z-index mayor, asi se montan por encima.
// - Para tener espacio de scroll entre stacks, agregamos margin-bottom a
//   cada card (excepto la ultima).
// - Las cards anteriores se van encogiendo cuando llegan las siguientes.
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
    // display: flow-root crea un nuevo block formatting context, lo cual
    // EVITA que la marginBottom de la ultima card colapse hacia afuera del
    // contenedor. Sin esto, el margin de la ultima card se escapaba y el
    // contenedor no crecia, dejando sin runway de scroll a la ultima card.
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
  // Cada card empieza a achicarse a partir de su "turno" (start) y queda
  // chica al final (scrollYProgress = 1). El factor depende de cuantas
  // cards la cubren despues.
  const start = (index + 1) / total;
  const targetScale = 1 - 0.04 * (total - index - 1);
  const scale = useTransform(
    scrollYProgress,
    [start, 1],
    [1, targetScale],
  );

  // Todas las cards (incluida la ultima) reciben marginBottom para que
  // tengan su propio "runway" de scroll donde quedan apiladas al frente.
  // Sin esto, la ultima nunca se llega a pinnar porque el contenedor se
  // termina justo donde termina su contenido.
  return (
    <motion.div
      style={{
        position: "sticky",
        top: topOffset,
        zIndex: index + 1,
        scale,
        transformOrigin: "top center",
        marginBottom: spacing,
      }}
    >
      {children}
    </motion.div>
  );
}
