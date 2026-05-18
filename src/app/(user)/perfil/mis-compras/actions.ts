"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createNotification } from "@/lib/notifications/create";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Confirma que el comprador recibió el pedido del marketplace.
// Esto libera el escrow: el monto neto al vendedor pasa a su user_credits.
// (Hoy MP es stub; cuando esté el SDK real, esto dispara una transferencia
// formal en lugar de un crédito en cuenta.)
export async function confirmDeliveryAction(
  orderId: string,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  // Cargar la orden y validar que el buyer es el usuario.
  const { data: order } = await supabase
    .from("marketplace_orders")
    .select(
      "id, buyer_id, seller_id, status, seller_amount_cents_usd, listing:marketplace_listings!marketplace_orders_listing_id_fkey(product:products(name))",
    )
    .eq("id", orderId)
    .eq("buyer_id", user.id)
    .maybeSingle()
    .returns<{
      id: string;
      buyer_id: string;
      seller_id: string;
      status: Database["public"]["Enums"]["marketplace_order_status"];
      seller_amount_cents_usd: number;
      listing:
        | { product: { name: string } | { name: string }[] | null }
        | { product: { name: string } | { name: string }[] | null }[]
        | null;
    } | null>();

  if (!order) {
    return { status: "error", message: "Pedido no encontrado." };
  }
  if (order.status !== "despachada" && order.status !== "pagada") {
    return {
      status: "error",
      message: `Esta orden no se puede confirmar (estado actual: ${order.status}).`,
    };
  }

  // 1. Marcar orden como entregada.
  type Update =
    Database["public"]["Tables"]["marketplace_orders"]["Update"];
  const update: Update = {
    status: "entregada",
    delivered_at: new Date().toISOString(),
  };
  const { error: updErr } = await supabase
    .from("marketplace_orders")
    .update(update as never)
    .eq("id", orderId);

  if (updErr) return { status: "error", message: updErr.message };

  // 2. Liberar escrow vía función SQL atómica (release_marketplace_escrow).
  // La función inserta credit_movement, suma a user_credits, e incrementa
  // seller_profiles.total_sales, todo en una transacción.
  const { error: releaseErr } = await supabase.rpc(
    "release_marketplace_escrow",
    { p_order_id: order.id },
  );
  if (releaseErr) {
    console.error("Error liberando escrow:", releaseErr);
    // No revertimos el cambio de status; el admin puede liberar manualmente.
  }

  const listingProduct = Array.isArray(order.listing)
    ? order.listing[0]?.product
    : order.listing?.product;
  const productName = Array.isArray(listingProduct)
    ? listingProduct[0]?.name
    : listingProduct?.name;

  // 4. Notificar al vendedor.
  await createNotification(supabase, {
    userId: order.seller_id,
    type: "marketplace_order_delivered",
    title: "¡Entrega confirmada!",
    body: `${productName ?? "Tu producto"} llegó al comprador. El monto está disponible en tu crédito.`,
    contextData: { order_id: order.id },
  });

  revalidatePath("/perfil/mis-compras");
  revalidatePath("/perfil/revendedor");
  revalidatePath("/perfil/credito");
  return { status: "success" };
}

// ----------------------------------------------------------------------------
// Reseña del marketplace: el comprador califica al vendedor + producto.
// Regla §7.4 del CLAUDE.md.
// ----------------------------------------------------------------------------

const listingReviewSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(1000).optional().nullable(),
});

export type ListingReviewFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createListingReviewAction(
  _prev: ListingReviewFormState,
  formData: FormData,
): Promise<ListingReviewFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  const parsed = listingReviewSchema.safeParse({
    order_id: formData.get("order_id"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Validar que la orden es del usuario y está entregada.
  const { data: order } = await supabase
    .from("marketplace_orders")
    .select("id, buyer_id, seller_id, listing_id, status")
    .eq("id", parsed.data.order_id)
    .eq("buyer_id", user.id)
    .maybeSingle()
    .returns<{
      id: string;
      buyer_id: string;
      seller_id: string;
      listing_id: string;
      status: Database["public"]["Enums"]["marketplace_order_status"];
    } | null>();

  if (!order) {
    return { status: "error", message: "Pedido no encontrado." };
  }
  if (order.status !== "entregada") {
    return {
      status: "error",
      message: "Solo podés calificar pedidos entregados.",
    };
  }

  // Idempotencia: si ya hay review para esta orden, error.
  const { data: existing } = await supabase
    .from("marketplace_listing_reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle()
    .returns<{ id: string } | null>();
  if (existing) {
    return {
      status: "error",
      message: "Ya calificaste este pedido.",
    };
  }

  type Insert =
    Database["public"]["Tables"]["marketplace_listing_reviews"]["Insert"];
  const insert: Insert = {
    listing_id: order.listing_id,
    order_id: order.id,
    user_id: user.id,
    rating: parsed.data.rating,
    body: parsed.data.body ?? null,
  };
  const { error: insErr } = await supabase
    .from("marketplace_listing_reviews")
    .insert(insert as never);

  if (insErr) {
    return { status: "error", message: insErr.message };
  }

  // Recalcular rating_avg del vendedor.
  const { data: allReviews } = await supabase
    .from("marketplace_listing_reviews")
    .select("rating, order:marketplace_orders!marketplace_listing_reviews_order_id_fkey(seller_id)")
    .returns<
      {
        rating: number;
        order:
          | { seller_id: string }
          | { seller_id: string }[]
          | null;
      }[]
    >();

  const sellerReviews = (allReviews ?? []).filter((r) => {
    const o = Array.isArray(r.order) ? r.order[0] : r.order;
    return o?.seller_id === order.seller_id;
  });

  if (sellerReviews.length > 0) {
    const avg =
      sellerReviews.reduce((acc, r) => acc + r.rating, 0) /
      sellerReviews.length;
    type SellerUpdate =
      Database["public"]["Tables"]["seller_profiles"]["Update"];
    await supabase
      .from("seller_profiles")
      .update({ rating_avg: Math.round(avg * 100) / 100 } as SellerUpdate as never)
      .eq("user_id", order.seller_id);
  }

  await createNotification(supabase, {
    userId: order.seller_id,
    type: "marketplace_review_received",
    title: "Recibiste una reseña",
    body: `Te calificaron con ${parsed.data.rating} estrellas.`,
    contextData: { order_id: order.id },
  });

  revalidatePath("/perfil/mis-compras");
  revalidatePath(`/marketplace/${order.listing_id}`);
  return { status: "idle" };
}
