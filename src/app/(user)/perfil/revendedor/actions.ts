"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createListingSchema } from "@/lib/validations/listings";
import type { Database } from "@/types/database";

export type ResellerFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

// Activa el rol revendedor para el usuario actual.
// MVP: aprobación automática. En producción podríamos exigir que tenga
// al menos una reserva confirmada (regla §2.5 del CLAUDE.md).
export async function activateResellerRoleAction(): Promise<
  { status: "success" } | { status: "error"; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  type RoleInsert = Database["public"]["Tables"]["user_roles"]["Insert"];
  const insert: RoleInsert = {
    user_id: user.id,
    role: "revendedor",
    assigned_by: user.id,
    active: true,
  };

  const { error } = await supabase
    .from("user_roles")
    .upsert(insert as never, { onConflict: "user_id,role" });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/perfil/revendedor");
  return { status: "success" };
}

// Crea un listing en el marketplace.
export async function createListingAction(
  _prev: ResellerFormState,
  formData: FormData,
): Promise<ResellerFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  const parsed = createListingSchema.safeParse({
    product_id: formData.get("product_id"),
    quantity: formData.get("quantity"),
    price_cents_usd: formData.get("price_cents_usd"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type Insert =
    Database["public"]["Tables"]["marketplace_listings"]["Insert"];
  const insert: Insert = {
    seller_id: user.id,
    product_id: parsed.data.product_id,
    quantity_available: parsed.data.quantity,
    quantity_total: parsed.data.quantity,
    price_cents_usd: parsed.data.price_cents_usd,
    description: parsed.data.description ?? null,
    status: "activa",
  };

  const { error } = await supabase
    .from("marketplace_listings")
    .insert(insert as never);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/perfil/revendedor");
  revalidatePath("/app/marketplace");
  return { status: "idle" };
}

export async function toggleListingStatusAction(
  listingId: string,
  newStatus: Database["public"]["Enums"]["listing_status"],
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  type Update =
    Database["public"]["Tables"]["marketplace_listings"]["Update"];
  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: newStatus } as Update as never)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) return { status: "error", message: error.message };
  revalidatePath("/perfil/revendedor");
  revalidatePath("/app/marketplace");
  return { status: "success" };
}

// Marca un pedido como despachado.
export async function markOrderShippedAction(
  orderId: string,
  trackingCode?: string,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  type Update =
    Database["public"]["Tables"]["marketplace_orders"]["Update"];
  const update: Update = {
    status: "despachada",
    shipped_at: new Date().toISOString(),
    tracking_code: trackingCode || null,
  };

  const { error } = await supabase
    .from("marketplace_orders")
    .update(update as never)
    .eq("id", orderId)
    .eq("seller_id", user.id);

  if (error) return { status: "error", message: error.message };
  revalidatePath("/perfil/revendedor");
  revalidatePath("/perfil/mis-compras");
  return { status: "success" };
}
