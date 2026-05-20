import Image from "next/image";
import { cn } from "@/lib/utils";

// Catálogo cerrado de iconos del kit oficial — usar este type para que el
// editor autocomplete los nombres válidos. Coincide 1:1 con los archivos
// en /public/iconos/color y /public/iconos/blanco.
export type IconMNName =
  | "billetera"
  | "buscar"
  | "campana_importacion"
  | "carrito"
  | "catalogo"
  | "categorias"
  | "centro_ayuda"
  | "compra_grupal"
  | "devoluciones"
  | "envios"
  | "favoritos"
  | "importar"
  | "notificaciones"
  | "oferta"
  | "opiniones"
  | "pagar"
  | "paquete"
  | "pedidos"
  | "seguridad"
  | "soporte"
  | "tienda"
  | "ubicacion"
  | "usuario"
  | "vendedor";

type IconVariant = "color" | "blanco";

interface IconMNProps {
  name: IconMNName;
  /** "color" para fondos claros, "blanco" para fondos azules/oscuros. */
  variant?: IconVariant;
  /** Tamaño en píxeles (cuadrado). Default 24. */
  size?: number;
  /** Alt para accesibilidad. Si va con texto al lado, pasá string vacío. */
  alt?: string;
  className?: string;
}

// Wrapper sobre next/image que selecciona el PNG correcto del kit de iconos.
// Centraliza la lógica para que no aparezcan paths a mano por todos lados.
export function IconMN({
  name,
  variant = "color",
  size = 24,
  alt = "",
  className,
}: IconMNProps) {
  return (
    <Image
      src={`/iconos/${variant}/${name}.png`}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
