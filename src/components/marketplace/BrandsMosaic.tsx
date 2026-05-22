import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";

// ─── BrandsMosaic ─────────────────────────────────────────────────────────────
// Grid de tiendas oficiales / marcas destacadas (estilo "Tiendas Oficiales" de
// ML). Cuadros blancos con sombra ligera, logo centrado, nombre debajo.
//
// En MVP usa placeholders con texto. Cuando el usuario suba logos reales
// (a /public/marcas/), pasarlos como prop `brands`.

type Brand = {
  slug: string;
  name: string;
  /** URL del logo. Si es null, muestra solo nombre como placeholder. */
  logo?: string | null;
  /** Color de acento del placeholder (hex). */
  accent?: string;
};

const PLACEHOLDER_BRANDS: Brand[] = [
  { slug: "marca-1", name: "Marca 1", accent: "#0D47B6" },
  { slug: "marca-2", name: "Marca 2", accent: "#FFC107" },
  { slug: "marca-3", name: "Marca 3", accent: "#072A6B" },
  { slug: "marca-4", name: "Marca 4", accent: "#3D7BFF" },
  { slug: "marca-5", name: "Marca 5", accent: "#0D47B6" },
  { slug: "marca-6", name: "Marca 6", accent: "#FFC107" },
  { slug: "marca-7", name: "Marca 7", accent: "#072A6B" },
  { slug: "marca-8", name: "Marca 8", accent: "#3D7BFF" },
];

interface BrandsMosaicProps {
  brands?: Brand[];
}

export function BrandsMosaic({
  brands = PLACEHOLDER_BRANDS,
}: BrandsMosaicProps = {}) {
  return (
    <section className="bg-neutral-gray-50 py-12 sm:py-16">
      <AppContainer>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
              Importadores destacados
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-neutral-gray-700 sm:text-3xl">
              Tiendas oficiales
            </h2>
          </div>
          <Link
            href="/app/marketplace?filter=oficiales"
            className="hidden text-sm font-semibold text-brand-blue hover:underline sm:inline-flex sm:items-center sm:gap-1"
          >
            Ver todas
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/app/marketplace?brand=${brand.slug}`}
              className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {brand.logo ? (
                <div className="relative size-14 sm:size-16">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              ) : (
                // Placeholder con bloque de color + inicial
                <div
                  className="flex size-14 items-center justify-center rounded-full text-lg font-extrabold text-white sm:size-16 sm:text-xl"
                  style={{ backgroundColor: brand.accent ?? "#0D47B6" }}
                >
                  {brand.name.charAt(0)}
                </div>
              )}
              <p className="text-xs font-semibold text-neutral-gray-700 transition-colors group-hover:text-brand-blue">
                {brand.name}
              </p>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}
