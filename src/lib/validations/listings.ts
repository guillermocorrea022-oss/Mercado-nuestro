import { z } from "zod";

export const createListingSchema = z.object({
  product_id: z.string().uuid("Elegí un producto"),
  quantity: z.coerce
    .number({ error: "Cantidad requerida" })
    .int()
    .positive()
    .max(10000),
  price_cents_usd: z.coerce
    .number({ error: "Precio requerido" })
    .int()
    .positive(),
  description: z.string().trim().max(1000).optional().nullable(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
