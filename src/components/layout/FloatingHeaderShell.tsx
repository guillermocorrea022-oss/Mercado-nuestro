"use client";

import { type ReactNode, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// Floating header shell con scroll-direction detection:
//   - Scroll DOWN > 80px: se oculta hacia arriba.
//   - Scroll UP cualquier amount: vuelve a aparecer.
//   - Cerca del top (<32px): siempre visible y "expandido" (sin sombra).
//
// El header es una "isla flotante": fixed con max-width, márgenes, rounded-full
// y shadow. Estilo aero-glass con backdrop-blur.
export function FloatingHeaderShell({ children }: { children: ReactNode }) {
  const shouldReduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const currentY = window.scrollY;
      const goingDown = currentY > lastY;
      const movedEnough = Math.abs(currentY - lastY) > 6;

      if (currentY < 32) {
        setHidden(false);
        setAtTop(true);
      } else {
        setAtTop(false);
        if (movedEnough) {
          // Solo escondemos hacia abajo después de 80px de scroll total.
          if (goingDown && currentY > 80) {
            setHidden(true);
          } else if (!goingDown) {
            setHidden(false);
          }
        }
      }
      lastY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      animate={
        shouldReduce
          ? { y: 0 }
          : { y: hidden ? "-130%" : 0, opacity: hidden ? 0 : 1 }
      }
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed left-1/2 top-4 z-50 w-[min(96%,1100px)] -translate-x-1/2",
      )}
    >
      <div
        className={cn(
          "rounded-full border border-border bg-white/85 backdrop-blur-xl transition-shadow duration-500",
          atTop ? "shadow-soft" : "shadow-glow",
        )}
      >
        {children}
      </div>
    </motion.header>
  );
}
