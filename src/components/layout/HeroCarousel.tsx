"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Slide type ───────────────────────────────────────────────────────────────
export type HeroSlide = {
  /** Imagen full-width del slide. Optimizada con next/image. */
  image: string;
  /** Texto alternativo de la imagen. */
  alt: string;
  /** Link al hacer click en el slide (opcional). */
  href?: string;
  /** Color de fondo del slide (cuando la imagen no llena el viewport). */
  background?: string;
};

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Milisegundos entre auto-slides. Default 5000. Pasar 0 para deshabilitar. */
  autoplayMs?: number;
}

// ─── HeroCarousel ─────────────────────────────────────────────────────────────
// Carousel full-width con autoplay, flechas izq/der, dots indicadores y
// pausa al hacer hover. Inspirado en el hero de Mercado Libre.
//
// El carousel sigue rotando aunque el usuario interactúe — al usar las flechas
// o los dots, se resetea el timer para que no rote inmediatamente después.

export function HeroCarousel({ slides, autoplayMs = 5000 }: HeroCarouselProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      const total = slides.length;
      const normalized = ((next % total) + total) % total;
      setDirection(normalized > index ? 1 : -1);
      setIndex(normalized);
    },
    [index, slides.length],
  );

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (autoplayMs <= 0 || paused || slides.length <= 1 || shouldReduce) return;
    const t = setTimeout(next, autoplayMs);
    return () => clearTimeout(t);
  }, [index, autoplayMs, paused, next, slides.length, shouldReduce]);

  if (slides.length === 0) return null;

  const current = slides[index];

  // El contenido del slide — si tiene href, lo envuelve en un Link.
  // object-contain garantiza que la imagen se vea COMPLETA sin crop ni zoom.
  // Si el contenedor es más ancho que la relación de la imagen, el fondo del
  // slide (bg color) llena los laterales como letterbox.
  const SlideContent = (
    <div className="relative h-full w-full">
      <Image
        src={current.image}
        alt={current.alt}
        fill
        sizes="100vw"
        className="object-contain"
        priority={index === 0}
      />
    </div>
  );

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: current.background ?? "#FFD200" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Ofertas destacadas"
    >
      {/* Gradient overlay inferior — funde el hero con el fondo de la página
          (neutral-gray-50) y deja espacio visual para que la ServiceStrip
          que viene abajo se solape encima. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-b from-transparent to-neutral-gray-50 sm:h-40 lg:h-48"
      />

      {/* Contenedor con aspect-ratio natural de las imágenes (2048x768 = 8:3,
          banners panorámicos estilo Mercado Libre). Object-contain garantiza
          que se vean COMPLETAS sin crop ni zoom. Max-w 2048 evita que se
          estiren en pantallas ultra-anchas. */}
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: "2048px", aspectRatio: "2048 / 768" }}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={
              shouldReduce
                ? { opacity: 0 }
                : { opacity: 0, x: direction > 0 ? 60 : -60 }
            }
            animate={
              shouldReduce ? { opacity: 1 } : { opacity: 1, x: 0 }
            }
            exit={
              shouldReduce
                ? { opacity: 0 }
                : { opacity: 0, x: direction > 0 ? -60 : 60 }
            }
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
          >
            {current.href ? (
              <Link
                href={current.href}
                className="block h-full w-full"
                aria-label={current.alt}
              >
                {SlideContent}
              </Link>
            ) : (
              SlideContent
            )}
          </motion.div>
        </AnimatePresence>

        {/* Flecha izquierda */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="absolute left-2 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-all hover:bg-white hover:scale-105 sm:left-4 sm:size-14"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}

        {/* Flecha derecha */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Slide siguiente"
            className="absolute right-2 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg transition-all hover:bg-white hover:scale-105 sm:right-4 sm:size-14"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        )}

        {/* Dots indicadores — subidos para no quedar tapados por el gradient
            inferior ni por las ServiceStrip cards que se solapan abajo. */}
        {slides.length > 1 && (
          <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-28 lg:bottom-32">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-white shadow-md"
                    : "w-2 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
