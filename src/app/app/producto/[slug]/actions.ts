"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// -------- Reseñas --------

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().nullable(),
  body: z.string().trim().max(2000).optional().nullable(),
});

export type ReviewFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const parsed = reviewSchema.safeParse({
    product_id: formData.get("product_id"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
  const insert: ReviewInsert = {
    product_id: parsed.data.product_id,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body ?? null,
    status: "visible",
  };

  const { error } = await supabase.from("reviews").insert(insert as never);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath(`/app/producto/${formData.get("product_slug")}`);
  return { status: "idle" };
}

// -------- Wishlists --------

export async function toggleWishlistAction(
  productId: string,
): Promise<{ status: "added" | "removed" | "error"; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  // ¿Ya está en la lista?
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle()
    .returns<{ id: string } | null>();

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", existing.id);
    if (error) return { status: "error", message: error.message };
    revalidatePath("/perfil/deseos");
    return { status: "removed" };
  }

  type Insert = Database["public"]["Tables"]["wishlists"]["Insert"];
  const insert: Insert = { user_id: user.id, product_id: productId };
  const { error } = await supabase.from("wishlists").insert(insert as never);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/perfil/deseos");
  return { status: "added" };
}
