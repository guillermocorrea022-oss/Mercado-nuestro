"use server";

import { revalidatePath } from "next/cache";

import { createNotification } from "@/lib/notifications/create";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Envía un mensaje en la conversación de un listing específico.
// conversation_id se mapea 1:1 al listing_id (cada listing tiene su hilo).
export async function sendMarketplaceMessageAction(
  listingId: string,
  body: string,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const trimmed = body.trim();
  if (trimmed.length < 1) {
    return { status: "error", message: "Escribí un mensaje." };
  }
  if (trimmed.length > 2000) {
    return { status: "error", message: "Mensaje muy largo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  // Resolver el listing para saber quién es el otro lado.
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select("id, seller_id, product:products(name)")
    .eq("id", listingId)
    .maybeSingle()
    .returns<{
      id: string;
      seller_id: string;
      product: { name: string } | { name: string }[] | null;
    } | null>();

  if (!listing) {
    return { status: "error", message: "Publicación no encontrada." };
  }

  // El destinatario es el otro lado.
  const recipientId =
    user.id === listing.seller_id
      ? // Si soy el vendedor, busco al último comprador que escribió en esta convo.
        await (async () => {
          const { data: lastMsg } = await supabase
            .from("marketplace_messages")
            .select("sender_id, recipient_id")
            .eq("conversation_id", listing.id)
            .neq("sender_id", listing.seller_id)
            .order("sent_at", { ascending: false })
            .limit(1)
            .maybeSingle()
            .returns<{ sender_id: string; recipient_id: string } | null>();
          return lastMsg?.sender_id ?? null;
        })()
      : listing.seller_id;

  if (!recipientId) {
    return {
      status: "error",
      message: "Para responder necesitás un comprador iniciando la conversación.",
    };
  }

  type Insert =
    Database["public"]["Tables"]["marketplace_messages"]["Insert"];
  const insert: Insert = {
    conversation_id: listing.id,
    sender_id: user.id,
    recipient_id: recipientId,
    body: trimmed,
  };

  const { error } = await supabase
    .from("marketplace_messages")
    .insert(insert as never);

  if (error) return { status: "error", message: error.message };

  // Notificar al destinatario.
  const productName = Array.isArray(listing.product)
    ? listing.product[0]?.name
    : listing.product?.name;
  await createNotification(supabase, {
    userId: recipientId,
    type: "marketplace_message",
    title: "Nuevo mensaje",
    body: `Sobre "${productName ?? "una publicación"}".`,
    contextData: { listing_id: listing.id },
  });

  revalidatePath(`/perfil/mensajes/${listing.id}`);
  revalidatePath("/perfil/mensajes");
  return { status: "success" };
}
