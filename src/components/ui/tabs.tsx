"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  defaultId?: string;
  className?: string;
};

// Tabs inspiradas en el FAQ tabbed de FUN Parque: pill activo con
// background animado tipo "magic line" entre tabs. Layout horizontal
// scrolleable en mobile.
export function Tabs({ tabs, defaultId, className }: Props) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
  const reduce = useReducedMotion();
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className={cn("space-y-8", className)}>
      <div
        role="tablist"
        className="-mx-1 flex flex-wrap gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 shadow-soft"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="mn-tab-pill"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-glow"
                />
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        <motion.div
          key={activeTab?.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab?.content}
        </motion.div>
      </div>
    </div>
  );
}
