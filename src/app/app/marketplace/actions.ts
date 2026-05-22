"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createNotification } from "@/lib/notifications/create";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const buySchema = z.object({
  listing_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(1000),
});

export type MarketplaceBuyState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

// Crea una marketplace_order en estado 'pagada' (stub MP).
// Reduce el stock del listing. Notifica al vendedor.
export async function createMarketplaceOrderAction(
  _prev: MarketplaceBuyState,
  formData: FormData,
): Promise<MarketplaceBuyState> {
  const parsed = buySchema.safeParse({
    listing_id: formData.get("listing_id"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=/app/marketplace/${encodeURIComponent(parsed.data.listing_id)}`,
    );
  }

  // Cargar listing con seller y producto.
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("id, seller_id, price_cents_usd, quantity_available, status, product:products(name)")
    .eq("id", parsed.data.listing_id)
    .maybeSingle()
    .returns<{
      id: string;
      seller_id: string;
      price_cents_usd: number;
      quantity_available: number;
      status: Database["public"]["Enums"]["listing_status"];
      product:
        | { name: string }
        | { name: string }[]
        | null;
    } | null>();

  if (!listing) {
    return { status: "error", message: "Publicación no encontrada." };
  }
  if (listing.status !== "activa") {
    return { status: "error", message: "Esta publicación no está activa." };
  }
  if (listing.seller_id === user.id) {
    return {
      status: "error",
      message: "No podés comprar tu propia publicación.",
    };
  }
  if (parsed.data.quantity > listing.quantity_available) {
    return {
      status: "error",
      message: `Solo quedan ${listing.quantity_available} unidades disponibles.`,
    };
  }

  // Comisión marketplace desde settings.
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "marketplace_commission_default_pct")
    .maybeSingle()
    .returns<{ value: unknown } | null>();
  const commissionPct =
    typeof setting?.value === "number" ? setting.value : 8;

  const totalCents = listing.price_cents_usd * parsed.data.quantity;
  const commissionCents = Math.round((totalCents * commissionPct) / 100);
  const sellerAmountCents = totalCents - commissionCents;

  // Insertar la orden.
  type OrderInsert =
    Database["public"]["Tables"]["marketplace_orders"]["Insert"];
  const orderInsert: OrderInsert = {
    listing_id: listing.id,
    buyer_id: user.id,
    seller_id: listing.seller_id,
    quantity: parsed.data.quantity,
    unit_price_cents_usd: listing.price_cents_usd,
    total_cents_usd: totalCents,
    commission_cents_usd: commissionCents,
    seller_amount_cents_usd: sellerAmountCents,
    status: "pagada",
    paid_at: new Date().toISOString(),
  };

  const { data: order, error: orderErr } = await supabase
    .from("marketplace_orders")
    .insert(orderInsert as never)
    .select("id")
    .single()
    .returns<{ id: string }>();

  if (orderErr || !order) {
    return {
      status: "error",
      message: orderErr?.message ?? "No pudimos crear el pedido.",
    };
  }

  // Reducir stock del listing.
  type ListingUpdate =
    Database["public"]["Tables"]["marketplace_listings"]["Update"];
  const newAvailable = listing.quantity_available - parsed.data.quantity;
  const newStatus: Database["public"]["Enums"]["listing_status"] =
    newAvailable === 0 ? "agotada" : listing.status;
  await supabase
    .from("marketplace_listings")
    .update({
      quantity_available: newAvailable,
      status: newStatus,
    } as ListingUpdate as never)
    .eq("id", listing.id);

  // Notificar al vendedor.
  const productName = Array.isArray(listing.product)
    ? listing.product[0]?.name
    : listing.product?.name;
  await createNotification(supabase, {
    userId: listing.seller_id,
    type: "marketplace_order_paid",
    title: "¡Nueva venta!",
    body: `Tenés un pedido de ${parsed.data.quantity} unidad(es) de "${productName ?? "tu producto"}" para despachar.`,
    contextData: {
      order_id: order.id,
      listing_id: listing.id,
    },
  });

  revalidatePath("/app/marketplace");
  revalidatePath("/perfil/revendedor");
  revalidatePath("/perfil/mis-compras");

  redirect(`/perfil/mis-compras?order=${order.id}`);
}
