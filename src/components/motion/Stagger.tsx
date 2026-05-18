"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Delay entre cada hijo en segundos. Default 0.08. */
  stagger?: number;
  /** Delay total antes de empezar. */
  delay?: number;
  /** Si true, la animación se reproduce sólo una vez. Default true. */
  once?: boolean;
}

// Container que orquesta una entrada escalonada de sus hijos.
// Cada hijo debe envolverse en <StaggerItem> para participar.
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  once = true,
}: StaggerProps) {
  const shouldReduce = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduce ? 0 : stagger,
        delayChildren: shouldReduce ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: StaggerItemProps) {
  const shouldReduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
