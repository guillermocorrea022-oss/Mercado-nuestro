"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createNotification } from "@/lib/notifications/create";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Simula el callback de éxito de Mercado Pago — solo en modo demo sin
// credenciales reales. Cuando el SDK real esté integrado, esta acción se
// reemplaza por el flujo real con webhook.
export async function simulateMpPaymentSuccessAction(
  reservationId: string,
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reservation } = await supabase
    .from("campaign_reservations")
    .select("id, user_id, expected_deposit_cents_usd, campaign:campaigns(slug, title)")
    .eq("id", reservationId)
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<{
      id: string;
      user_id: string;
      expected_deposit_cents_usd: number;
      campaign: { slug: string; title: string } | { slug: string; title: string }[] | null;
    } | null>();

  if (!reservation) {
    redirect("/mis-reservas");
  }

  const campaign = Array.isArray(reservation.campaign)
    ? reservation.campaign[0]
    : reservation.campaign;

  // Insertar payment simulado.
  type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
  const insert: PaymentInsert = {
    reservation_id: reservation.id,
    amount_cents: reservation.expected_deposit_cents_usd,
    currency: "USD",
    method: "mercado_pago",
    status: "aprobado",
    external_id: `stub_${reservation.id}`,
    raw_payload: { source: "stub_checkout" } as never,
    processed_at: new Date().toISOString(),
  };
  await supabase.from("payments").insert(insert as never);

  // Marcar reserva como confirmada.
  type ReservationUpdate =
    Database["public"]["Tables"]["campaign_reservations"]["Update"];
  await supabase
    .from("campaign_reservations")
    .update({ status: "confirmada" } as ReservationUpdate as never)
    .eq("id", reservation.id);

  // Notificación in-app.
  await createNotification(supabase, {
    userId: user.id,
    type: "payment_confirmed",
    title: "Seña confirmada",
    body: campaign
      ? `Tu seña para "${campaign.title}" fue procesada correctamente.`
      : "Tu seña fue procesada correctamente.",
    contextData: {
      reservation_id: reservation.id,
      campaign_slug: campaign?.slug,
    },
  });

  revalidatePath("/mis-reservas");
  if (campaign?.slug) {
    revalidatePath(`/app/campanas/${campaign.slug}`);
  }

  redirect(
    campaign?.slug
      ? `/app/campanas/${campaign.slug}/reservada?paid=1`
      : "/mis-reservas",
  );
}
