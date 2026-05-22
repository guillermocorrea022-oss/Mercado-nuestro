import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// ─── AdSlot ───────────────────────────────────────────────────────────────────
// Slot de banner publicitario / promocional, con soporte responsive: acepta
// una imagen de DESKTOP (apaisada) y opcionalmente una de MOBILE (vertical).
// El componente switcha entre ambas según el viewport (sm: como breakpoint).
//
// Si no se pasa ninguna imagen, muestra un placeholder con borde dashed
// y dimensiones recomendadas para guiar al usuario qué subir.
//
// Tamaños estándar:
//   - "xl"     2508×627 desktop · 1122×1402 mobile  (banner principal)
//   - "medium" 1200×180 desktop · sin móvil          (separador entre secciones)
//   - "square" 600×600                               (mosaicos)
//   - "half"   600×300                               (dos por fila)

export type AdSlotSize = "xl" | "medium" | "square" | "half";

interface AdSlotProps {
  size: AdSlotSize;
  /** Imagen para viewport DESKTOP (≥640px). */
  image?: string | null;
  /** Imagen para viewport MOBILE (<640px). Si no se pasa, usa `image`. */
  mobileImage?: string | null;
  /** Texto alternativo (igual para ambas imágenes). */
  alt?: string;
  /** Link al hacer click (opcional). */
  href?: string;
  /** Descripción interna del slot (visible en el placeholder). */
  label?: string;
  className?: string;
}

const SIZE_CONFIG: Record<
  AdSlotSize,
  {
    aspectDesktop: string;
    aspectMobile: string;
    recommended: string;
    description: string;
  }
> = {
  xl: {
    aspectDesktop: "sm:aspect-[2508/627]",
    aspectMobile: "aspect-[1122/1402]",
    recommended: "2508×627 desktop · 1122×1402 mobile",
    description: "Banner principal — ancho completo",
  },
  medium: {
    aspectDesktop: "sm:aspect-[1200/180]",
    aspectMobile: "aspect-[1200/300]",
    recommended: "1200×180 px",
    description: "Banner separador — entre secciones",
  },
  square: {
    aspectDesktop: "sm:aspect-square",
    aspectMobile: "aspect-square",
    recommended: "600×600 px",
    description: "Banner cuadrado — para mosaicos",
  },
  half: {
    aspectDesktop: "sm:aspect-[600/300]",
    aspectMobile: "aspect-[600/300]",
    recommended: "600×300 px",
    description: "Banner mitad — dos por fila",
  },
};

export function AdSlot({
  size,
  image,
  mobileImage,
  alt = "Espacio publicitario",
  href,
  label,
  className,
}: AdSlotProps) {
  const config = SIZE_CONFIG[size];
  const hasImage = Boolean(image);
  const effectiveMobile = mobileImage ?? image;

  const content = hasImage ? (
    <>
      {/* Imagen DESKTOP — div wrapper hidden en mobile, block en sm+.
          Envolver en div en lugar de aplicar `hidden` al Image asegura que
          el display: none lo controle el wrapper y no compita con los
          estilos inline que next/image setea por `fill`. */}
      <div className="absolute inset-0 hidden sm:block">
        <Image
          src={image!}
          alt={alt}
          fill
          sizes="(max-width: 1500px) 100vw, 1500px"
          className="object-cover"
          priority
        />
      </div>
      {/* Imagen MOBILE — wrapper inverso */}
      {effectiveMobile ? (
        <div className="absolute inset-0 sm:hidden">
          <Image
            src={effectiveMobile}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
    </>
  ) : (
    // ─── Placeholder elegante ─────────────────────────────────────────────
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-blue/5 via-white to-brand-yellow/5 px-6 text-center">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/60">
          Espacio publicitario
        </span>
        <p className="text-base font-bold text-neutral-gray-700 sm:text-lg">
          {label ?? config.description}
        </p>
        <p className="text-xs text-neutral-gray-700/60">
          Recomendado:{" "}
          <span className="font-semibold">{config.recommended}</span>
        </p>
      </div>
    </div>
  );

  const wrapperClass = cn(
    // `block` es importante: cuando href está seteado el wrapper es <a>
    // (inline por defecto) y aspect-ratio no se aplicaría → wrapper colapsa
    // a 0 de alto y la imagen no se ve.
    "relative block w-full overflow-hidden rounded-2xl border bg-white",
    hasImage
      ? "border-transparent shadow-sm"
      : "border-dashed border-brand-blue/30",
    // Aspect ratio: el de mobile manda en <sm, el de desktop en ≥sm
    config.aspectMobile,
    config.aspectDesktop,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label={alt}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
