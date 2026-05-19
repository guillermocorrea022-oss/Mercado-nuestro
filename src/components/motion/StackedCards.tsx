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
  /** Espacio (en vh) que cada card ocupa antes de pasar a la siguiente.
   *  Default 80 (80vh por card). Mas alto = scroll mas largo entre cards. */
  cardSpacing?: number;
  /** Offset desde el top de la viewport donde se pinnean. Default 96px (h-24). */
  topOffset?: number;
}

// StackedCards — cada card se queda STICKY en su posicion mientras la
// siguiente sube desde abajo y la cubre. Las cards ya pasadas se van
// encogiendo y bajando opacidad para dar profundidad.
//
// Implementacion: cada card va en un wrapper de altura cardSpacing*vh.
// El contenido interno tiene `position: sticky; top: topOffset`. Cuando
// el wrapper de la siguiente card empieza a scrollear, la actual queda
// pegada hasta que el wrapper de la nueva la empuje hacia arriba.
export function StackedCards({
  children,
  cardSpacing = 80,
  topOffset = 96,
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
    <div ref={containerRef} className="relative">
      {children.map((child, i) => {
        const start = i / total;
        const end = (i + 1) / total;
        return (
          <StackCard
            key={i}
            index={i}
            total={total}
            start={start}
            end={end}
            spacing={cardSpacing}
            topOffset={topOffset}
            scrollYProgress={scrollYProgress}
          >
            {child}
          </StackCard>
        );
      })}
    </div>
  );
}

interface StackCardProps {
  children: ReactNode;
  index: number;
  total: number;
  start: number;
  end: number;
  spacing: number;
  topOffset: number;
  scrollYProgress: MotionValue<number>;
}

function StackCard({
  children,
  index,
  total,
  start,
  end,
  spacing,
  topOffset,
  scrollYProgress,
}: StackCardProps) {
  // Cuanto mas atras quede (cards mas viejas), mas pequeñas y mas
  // transparentes se ven, dando profundidad.
  const stepsFromNow = total - index - 1;
  const targetScale = Math.max(0.88, 1 - 0.04 * stepsFromNow);
  const targetOpacity = Math.max(0.55, 1 - 0.12 * stepsFromNow);

  const scale = useTransform(scrollYProgress, [start, end, 1], [1, 1, targetScale]);
  const opacity = useTransform(
    scrollYProgress,
    [start, end, 1],
    [1, 1, targetOpacity],
  );

  // El wrapper tiene la altura del scroll que la card "consume".
  // La ultima card no tiene altura extra para que el contenedor termine
  // justo cuando ya se mostraron todas.
  const wrapperHeight = index === total - 1 ? "auto" : `${spacing}vh`;

  return (
    <div
      style={{
        height: wrapperHeight,
        minHeight: index === total - 1 ? undefined : `${spacing}vh`,
      }}
      className="relative"
    >
      <motion.div
        style={{
          scale,
          opacity,
          top: `${topOffset}px`,
          transformOrigin: "top center",
          zIndex: index,
        }}
        className="sticky"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
