"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  content: ReactNode;
};

type Props = {
  items: Item[];
  /** Si más de uno puede estar abierto a la vez. */
  multiple?: boolean;
  className?: string;
};

// Accordion simple inspirado en el "Como funciona" de FUN Parque:
// cada item es un row con título grande + icono "+" que rota a "x".
// Click expande con animación suave. Respeta prefers-reduced-motion.
export function Accordion({ items, multiple = false, className }: Props) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const reduce = useReducedMotion();

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ul className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:text-primary"
            >
              <span className="text-lg font-semibold tracking-tight sm:text-xl">
                {item.title}
              </span>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500",
                  isOpen
                    ? "rotate-45 border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground",
                )}
              >
                <Plus className="size-4" aria-hidden />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { height: "auto", opacity: 1 }
                  }
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pr-12 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.content}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
