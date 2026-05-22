import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";

// ─── CategoryHighlights ───────────────────────────────────────────────────────
// 4 tarjetas grandes de categorías destacadas con foto background, overlay
// gradient, badge de categoría arriba y título + CTA abajo. Estilo Mercado
// Libre "Inmuebles · Vehículos · Servicios · Supermercado".
//
// Las imágenes son placeholders (Unsplash). El usuario las reemplaza después
// con imágenes propias subidas a /public/categorias/.

type Highlight = {
  slug: string;
  label: string;
  title: string;
  image: string;
  overlay: string;
  accent: "blue" | "yellow" | "navy" | "blue-light";
};

const HIGHLIGHTS: Highlight[] = [
  {
    slug: "electronica",
    label: "Tendencia",
    title: "Lo último en electrónica",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
    overlay: "from-brand-blue-dark/90",
    accent: "blue",
  },
  {
    slug: "hogar",
    label: "Renová",
    title: "Imperdibles para tu hogar",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
    overlay: "from-brand-blue/85",
    accent: "yellow",
  },
  {
    slug: "indumentaria",
    label: "Nueva temporada",
    title: "Moda y accesorios",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop",
    overlay: "from-black/80",
    accent: "blue-light",
  },
  {
    slug: "deportes",
    label: "Activo",
    title: "Deportes y aire libre",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
    overlay: "from-brand-blue-dark/80",
    accent: "navy",
  },
];

interface CategoryHighlightsProps {
  /** Eyebrow del bloque, ej "EXPLORÁ" */
  eyebrow?: string;
  /** Título grande, ej "Categorías destacadas" */
  title?: string;
}

export function CategoryHighlights({
  eyebrow = "Explorá",
  title = "Categorías destacadas",
}: CategoryHighlightsProps = {}) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <AppContainer>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-3xl">
              {title}
            </h2>
          </div>
          <Link
            href="/app/marketplace"
            className="hidden text-sm font-semibold text-brand-blue hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            Ver todas las categorías
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <Link
              key={h.slug}
              href={`/app/marketplace?cat=${h.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src={h.image}
                alt={h.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay con gradient — más opaco abajo para legibilidad del texto */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${h.overlay} via-transparent`}
              />

              {/* Badge eyebrow arriba */}
              <span className="absolute left-4 top-4 rounded-full bg-brand-yellow px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-gray-700">
                {h.label}
              </span>

              {/* Título + arrow abajo */}
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-white">
                <h3 className="text-base font-extrabold leading-tight tracking-tight sm:text-lg">
                  {h.title}
                </h3>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
