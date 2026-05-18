"use server";

import { z } from "zod";

import { sendEmail } from "@/lib/email/send";

const SCHEMA = z.object({
  name: z.string().min(2, "Tu nombre completo, por favor."),
  email: z.string().email("Email inválido."),
  phone: z.string().min(6, "Necesitamos un teléfono de contacto."),
  experience: z.string().min(20, "Contanos un poco más (al menos 20 caracteres)."),
  categories: z.string().optional(),
});

export type ImporterApplicationState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function applyImporterAction(
  _prev: ImporterApplicationState,
  formData: FormData,
): Promise<ImporterApplicationState> {
  const parsed = SCHEMA.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    experience: formData.get("experience"),
    categories: formData.get("categories"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, experience, categories } = parsed.data;

  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? "admin@mercadonuestro.uy",
    subject: `Nueva postulación a importador avanzado — ${name}`,
    text: `Postulación nueva para importador avanzado.

Nombre: ${name}
Email: ${email}
Teléfono: ${phone}
Categorías de interés: ${categories || "no especificadas"}

Experiencia:
${experience}
`,
  });

  return {
    status: "ok",
    message:
      "Recibimos tu postulación. Nos pondremos en contacto en los próximos días hábiles.",
  };
}
