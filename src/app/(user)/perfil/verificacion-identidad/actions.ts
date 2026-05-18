"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const SCHEMA = z.object({
  type: z.enum(["cedula", "rut", "comprobante_domicilio"]),
  fileUrl: z.string().url("Necesitamos un link válido a la imagen."),
});

export type VerificationFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

// Por ahora aceptamos URL externa (Imgur / Drive / etc). En Fase 3 esto migra
// a Supabase Storage con bucket privado y signed URLs.
export async function submitVerificationAction(
  _prev: VerificationFormState,
  formData: FormData,
): Promise<VerificationFormState> {
  const parsed = SCHEMA.safeParse({
    type: formData.get("type"),
    fileUrl: formData.get("fileUrl"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  type Insert =
    Database["public"]["Tables"]["user_verifications"]["Insert"];

  const row: Insert = {
    user_id: user.id,
    type: parsed.data.type,
    file_url: parsed.data.fileUrl,
    status: "pendiente",
  };

  const { error } = await supabase
    .from("user_verifications")
    .insert(row as never);

  if (error) {
    console.error("Error guardando verificación:", error);
    return {
      status: "error",
      message: "No pudimos guardar la verificación. Intentá de nuevo.",
    };
  }

  revalidatePath("/perfil/verificacion-identidad");
  revalidatePath("/perfil");

  return {
    status: "ok",
    message:
      "Recibimos tu verificación. Te avisamos cuando el equipo la revise.",
  };
}
