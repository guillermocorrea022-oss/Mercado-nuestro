// ─── encoding.ts ──────────────────────────────────────────────────────────────
// Helpers para arreglar texto con mojibake (UTF-8 leído como Latin-1 / CP1252
// y luego re-encodeado como UTF-8). Esto típicamente pasó al insertar las
// categorías iniciales vía el SQL Editor con encoding incorrecto, dejando
// "Electrónica" guardado como "ElectrÃ³nica" en la DB.
//
// Esta función detecta los patrones típicos (Ã³, Ã¡, Ã©, Ã­, Ãº, Ã±) y los
// revierte. Si el string ya está OK, lo devuelve sin tocar.
//
// IDEALMENTE deberíamos arreglar los datos en la DB con un UPDATE — pero
// mientras tanto, este helper hace que se vea bien en pantalla.

// Pares [secuencia mojibake → carácter correcto] para acentos del español.
// Solo cubro minúsculas + signos de puntuación porque las mayúsculas
// acentuadas en mojibake usan códigos de control que generan ambigüedad
// en el archivo fuente. Para mayúsculas, ver fixMojibakeBytes() abajo.
const MOJIBAKE_PAIRS: Array<[string, string]> = [
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã¼", "ü"],
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â°", "°"],
];

/**
 * Detecta mojibake en un string y lo arregla. Si el string no tiene mojibake,
 * lo devuelve idéntico.
 *
 * Cubre minúsculas acentuadas (á, é, í, ó, ú, ñ, ü) que son las que aparecen
 * en categorías y nombres de productos en español rioplatense. Si necesitás
 * mayúsculas, agregar el par UTF-16 al MOJIBAKE_PAIRS arriba.
 */
export function fixMojibake(str: string | null | undefined): string {
  if (!str) return "";
  // Detección rápida: si no hay ningún "Ã" o "Â" seguido de algo raro, no hay
  // mojibake.
  if (!/Ã|Â/.test(str)) return str;

  let result = str;
  for (const [bad, good] of MOJIBAKE_PAIRS) {
    result = result.split(bad).join(good);
  }
  return result;
}
