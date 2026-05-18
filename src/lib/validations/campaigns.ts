import { z } from "zod";

// Validaciones para crear/editar campañas desde el panel admin.

const pricingTierSchema = z.object({
  min_quantity: z.coerce
    .number({ error: "Cantidad mínima requerida" })
    .int()
    .positive("Debe ser mayor a 0"),
  max_quantity: z
    .preprocess(
      (v) => (v === "" || v === undefined || v === null ? null : v),
      z.coerce.number().int().positive().nullable(),
    ),
  unit_price_cents_usd: z.coerce
    .number({ error: "Precio requerido" })
    .int()
    .positive("Debe ser mayor a 0"),
});

export const createCampaignSchema = z
  .object({
    product_id: z.string().uuid("Producto inválido"),
    title: z.string().trim().min(3, "Título demasiado corto").max(200),
    slug: z
      .string()
      .trim()
      .min(3, "Slug demasiado corto")
      .max(120)
      .regex(
        /^[a-z0-9-]+$/,
        "Solo minúsculas, números y guiones (sin espacios ni acentos)",
      ),
    description: z.string().trim().optional().nullable(),
    hero_image_url: z
      .preprocess(
        (v) => (v === "" || v === null ? undefined : v),
        z.url("URL inválida").optional(),
      )
      .nullable()
      .optional(),
    moq: z.coerce.number().int().positive(),
    max_quantity: z
      .preprocess(
        (v) => (v === "" || v === undefined || v === null ? null : v),
        z.coerce.number().int().positive().nullable(),
      ),
    deposit_percentage: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(30),
    closes_at: z
      .string()
      .min(1, "Fecha de cierre requerida")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
    estimated_arrival_at: z
      .preprocess(
        (v) => (v === "" || v === null ? null : v),
        z.string().nullable(),
      )
      .optional(),
    return_policy: z.string().trim().optional().nullable(),
    pricing_tiers: z
      .array(pricingTierSchema)
      .min(1, "Tenés que definir al menos un escalón de precio"),
  })
  .refine(
    (data) =>
      data.max_quantity === null ||
      data.max_quantity === undefined ||
      data.max_quantity >= data.moq,
    {
      path: ["max_quantity"],
      message: "El cupo máximo no puede ser menor al MOQ",
    },
  );

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
