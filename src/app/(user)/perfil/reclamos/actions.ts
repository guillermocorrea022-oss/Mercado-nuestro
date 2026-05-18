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

// ----------------------------------------------------------------------------
// appealClaimAction — apelar una resolución (UNA sola vez, regla §5.8)
// ----------------------------------------------------------------------------

export type AppealClaimResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function appealClaimAction(
  claimId: string,
  reason: string,
): Promise<AppealClaimResult> {
  if (!claimId) {
    return { status: "error", message: "Reclamo inválido." };
  }
  if (!reason || reason.trim().length < 10) {
    return {
      status: "error",
      message: "Contanos al menos 10 caracteres por qué apelás.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  const { error } = await supabase.rpc("appeal_claim", {
    p_claim_id: claimId,
    p_reason: reason.trim(),
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "No pudimos registrar la apelación.",
    };
  }

  revalidatePath("/perfil/reclamos");
  return {
    status: "success",
    message: "Recibimos tu apelación. Vamos a revisar el caso de nuevo.",
  };
}
