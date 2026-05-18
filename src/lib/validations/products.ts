import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Nombre demasiado corto").max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  short_description: z.string().trim().max(500).optional().nullable(),
  long_description: z.string().trim().optional().nullable(),
  category_id: z
    .preprocess(
      (v) => (v === "" || v === null ? null : v),
      z.string().uuid().nullable(),
    )
    .optional(),
  brand: z.string().trim().max(100).optional().nullable(),
  main_image_url: z
    .preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.url("URL inválida").optional(),
    )
    .nullable()
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
