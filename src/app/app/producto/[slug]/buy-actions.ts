"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type BuyInventoryResult =
  | {
      status: "success";
      orderId: string;
      totalCents: number;
    }
  | { status: "error"; message: string };

export async function buyInventoryItemAction(
  itemId: string,
  quantity: number,
  shippingAddressId: string,
): Promise<BuyInventoryResult> {
  if (!itemId || !shippingAddressId) {
    return { status: "error", message: "Datos incompletos." };
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { status: "error", message: "Cantidad inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Iniciá sesión para comprar." };
  }

  const { data, error } = await supabase.rpc("purchase_inventory_item", {
    p_item_id: itemId,
    p_quantity: quantity,
    p_shipping_address_id: shippingAddressId,
  });

  if (error) {
    console.error("Error comprando inventario:", error);
    return {
      status: "error",
      message: error.message || "No pudimos procesar la compra.",
    };
  }

  const result =
    (data as { ok?: boolean; order_id?: string; total_cents?: number }) || {};
  if (!result.ok || !result.order_id) {
    return { status: "error", message: "No pudimos procesar la compra." };
  }

  revalidatePath("/app/marketplace");
  revalidatePath("/perfil/pedidos");

  return {
    status: "success",
    orderId: result.order_id,
    totalCents: result.total_cents ?? 0,
  };
}
