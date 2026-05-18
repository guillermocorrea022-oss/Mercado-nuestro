"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay en segundos antes de empezar la animación. */
  delay?: number;
  /** Duración total en segundos. */
  duration?: number;
  /** Cantidad de desplazamiento vertical inicial en px (0 = solo fade). */
  y?: number;
  /** Si true, la animación se reproduce sólo una vez. Default true. */
  once?: boolean;
  /** Renderiza como otro elemento HTML (default: div). */
  as?: "div" | "section" | "article" | "header" | "li" | "p" | "h1" | "h2" | "h3";
}

// Animación de entrada genérica: fade + slide up cuando el elemento entra al
// viewport. Pensado para envolver hero, secciones y bloques individuales.
//
// Respeta prefers-reduced-motion (sin animación si el sistema lo pide).
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  y = 24,
  once = true,
  as = "div",
}: RevealProps) {
  const shouldReduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const MotionComp = motion[as] as typeof motion.div;

  return (
    <MotionComp
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </MotionComp>
  );
}
