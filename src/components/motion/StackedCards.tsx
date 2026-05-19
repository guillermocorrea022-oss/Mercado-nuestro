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
  /** Espacio (en px) que cada card ocupa antes de que se apile la siguiente. */
  cardHeight?: number;
}

// StackedCards — efecto de cards que se apilan al hacer scroll. Cada card
// queda sticky en su posición y la siguiente la cubre desde abajo. Las cards
// ya pinneadas se van encogiendo y bajando de opacidad para dar profundidad.
//
// Inspiración: funparquesaojoao.pt, Apple, Linear.
export function StackedCards({ children }: StackedCardsProps) {
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

  return (
    <div ref={containerRef} className="relative">
      {children.map((child, i) => {
        const total = children.length;
        // El intervalo donde la card está "activa" en el scroll.
        const start = i / total;
        const end = (i + 1) / total;
        return (
          <StackCard
            key={i}
            index={i}
            total={total}
            start={start}
            end={end}
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
  scrollYProgress: MotionValue<number>;
}

function StackCard({
  children,
  index,
  total,
  start,
  end,
  scrollYProgress,
}: StackCardProps) {
  // Card va escalando hacia abajo cuando ya pasó su turno.
  // - scale empieza en 1 cuando está activa, baja a 0.92 cuando ya pasaron 2-3 cards.
  // - opacity baja a 0.6 cuando es muy vieja.
  const scale = useTransform(
    scrollYProgress,
    [start, end, 1],
    [1, 1, Math.max(0.88, 1 - (total - index) * 0.04)],
  );
  const opacity = useTransform(
    scrollYProgress,
    [start, end, 1],
    [1, 1, Math.max(0.5, 1 - (total - index) * 0.15)],
  );

  return (
    <div className="sticky top-24 mb-8">
      <motion.div
        style={{ scale, opacity, transformOrigin: "top center" }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.05,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
