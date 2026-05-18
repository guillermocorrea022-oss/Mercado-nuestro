"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const claimSchema = z.object({
  type: z.enum([
    "defectuoso",
    "no_llego",
    "llego_equivocado",
    "faltante",
    "no_corresponde_descripcion",
    "otro",
  ]),
  description: z.string().trim().min(20, "Contanos qué pasó en al menos 20 caracteres"),
  order_id: z.string().uuid().optional().nullable(),
});

export type ClaimFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createClaimAction(
  _prev: ClaimFormState,
  formData: FormData,
): Promise<ClaimFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const parsed = claimSchema.safeParse({
    type: formData.get("type"),
    description: formData.get("description"),
    order_id: formData.get("order_id") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type ClaimInsert = Database["public"]["Tables"]["claims"]["Insert"];
  const insert: ClaimInsert = {
    user_id: user.id,
    type: parsed.data.type,
    description: parsed.data.description,
    order_id: parsed.data.order_id ?? null,
    status: "abierto",
  };

  const { error } = await supabase.from("claims").insert(insert as never);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/perfil/reclamos");
  redirect("/perfil/reclamos");
}
