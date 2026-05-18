"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sellerProfileSchema } from "@/lib/validations/seller";
import type { Database } from "@/types/database";

export type SellerFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

// Activa el rol vendedor por catálogo: crea seller_profile, asigna el rol,
// crea catalog_link inicial. En el MVP no requiere aprobación manual.
export async function activateSellerProfileAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const parsed = sellerProfileSchema.safeParse({
    display_name: formData.get("display_name"),
    slug: formData.get("slug"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 1. Crear seller_profile.
  type SellerInsert = Database["public"]["Tables"]["seller_profiles"]["Insert"];
  const sellerInsert: SellerInsert = {
    user_id: user.id,
    display_name: parsed.data.display_name,
    slug: parsed.data.slug,
    bio: parsed.data.bio ?? null,
  };
  const { error: sellerErr } = await supabase
    .from("seller_profiles")
    .insert(sellerInsert as never);
  if (sellerErr) {
    return {
      status: "error",
      message:
        sellerErr.code === "23505"
          ? "Ese alias ya está en uso. Probá con otro."
          : sellerErr.message,
    };
  }

  // 2. Asignar rol vendedor_catalogo.
  type RoleInsert = Database["public"]["Tables"]["user_roles"]["Insert"];
  await supabase.from("user_roles").upsert(
    {
      user_id: user.id,
      role: "vendedor_catalogo",
      assigned_by: user.id,
      active: true,
    } as RoleInsert as never,
    { onConflict: "user_id,role" },
  );

  // 3. Crear el catalog_link inicial con el mismo slug.
  type LinkInsert = Database["public"]["Tables"]["catalog_links"]["Insert"];
  const linkInsert: LinkInsert = {
    seller_id: user.id,
    slug: parsed.data.slug,
    internal_name: "Link principal",
    active: true,
  };
  await supabase.from("catalog_links").insert(linkInsert as never);

  revalidatePath("/perfil");
  revalidatePath("/perfil/vendedor");
  return { status: "idle" };
}

export async function updateSellerBioAction(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);

  type Update = Database["public"]["Tables"]["seller_profiles"]["Update"];
  const { error } = await supabase
    .from("seller_profiles")
    .update({ bio: bio || null } as Update as never)
    .eq("user_id", user.id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/perfil/vendedor");
  return { status: "idle" };
}
