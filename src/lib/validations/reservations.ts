import { z } from "zod";

// Validaciones para reservas de campañas.

export const createReservationSchema = z.object({
  campaignId: z
    .string({ error: "Campaña inválida" })
    .uuid("Campaña inválida"),
  quantity: z.coerce
    .number({ error: "Ingresá una cantidad válida" })
    .int("Tiene que ser un número entero")
    .positive("Tiene que ser mayor a 0")
    .max(1000, "Cantidad demasiado alta"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
