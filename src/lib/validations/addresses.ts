import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Nombre requerido").max(60),
  street: z.string().trim().min(2, "Calle requerida").max(200),
  street_number: z.string().trim().max(20).optional().nullable(),
  apartment: z.string().trim().max(50).optional().nullable(),
  city: z.string().trim().min(1, "Ciudad requerida").max(100),
  department: z.string().trim().min(1, "Departamento requerido").max(100),
  postal_code: z.string().trim().max(20).optional().nullable(),
  instructions: z.string().trim().max(500).optional().nullable(),
  is_primary: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
