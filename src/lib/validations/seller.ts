import { z } from "zod";

export const sellerProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Nombre demasiado corto")
    .max(80, "Nombre demasiado largo"),
  slug: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo minúsculas, números y guiones (sin espacios ni acentos)",
    ),
  bio: z.string().trim().max(500).optional().nullable(),
});

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
