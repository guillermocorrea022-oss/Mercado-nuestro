"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { findCurrentTier, type PricingTier } from "@/lib/campaigns";
import { createReservationSchema } from "@/lib/validations/reservations";
import type { Database } from "@/types/database";

import type { ReserveFormState } from "./reserve-state";

// Crea una reserva (estado `activa`) para la campaña indicada. La seña queda
// asentada como `expected_deposit_cents_usd`; el pago real con Mercado Pago se
// integra en un paso siguiente y al cobrarse pasa a `confirmada`.
//
// Reglas (§5 CLAUDE.md):
//   - Solo usuarios logueados pueden reservar.
//   - Solo en campañas con status='activa'.
//   - No se permite reservar más que `max_quantity - reserved` si hay tope.
//   - El precio mostrado es el del escalón vigente para el total proyectado.
//   - Seña = precio_total * deposit_percentage / 100.
export async function createReservationAction(
  _prev: ReserveFormState,
  formData: FormData,
): Promise<ReserveFormState> {
  const parsed = createReservationSchema.safeParse({
    campaignId: formData.get("campaignId"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { campaignId, quantity } = parsed.data;

  const supabase = await createClient();

  // 1. Verificar sesión. Si no hay, redirigimos a login preservando destino.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Para que `next` pueda incluir la cantidad, lo serializamos en query.
    const slug = formData.get("campaignSlug");
    const slugStr = typeof slug === "string" ? slug : "";
    const next = slugStr
      ? `/campanas/${encodeURIComponent(slugStr)}?reservar=${quantity}`
      : "/perfil";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // 2. Traer la campaña con sus escalones y verificar estado.
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select(
      `
      id, slug, status, deposit_percentage, max_quantity,
      pricing_tiers:campaign_pricing_tiers(*)
      `,
    )
    .eq("id", campaignId)
    .maybeSingle()
    .returns<{
      id: string;
      slug: string;
      status: Database["public"]["Enums"]["campaign_status"];
      deposit_percentage: number;
      max_quantity: number | null;
      pricing_tiers: PricingTier[];
    } | null>();

  if (campaignError || !campaign) {
    return {
      status: "error",
      message: "No encontramos esa campaña. Revisá el link y volvé a intentar.",
    };
  }

  if (campaign.status !== "activa") {
    return {
      status: "error",
      message: "Esa campaña ya no está abierta a reservas.",
    };
  }

  // 3. Calcular cantidad reservada actual (excluyendo canceladas).
  const { data: existingRes } = await supabase
    .from("campaign_reservations")
    .select("quantity, status")
    .eq("campaign_id", campaign.id)
    .returns<
      {
        quantity: number;
        status: Database["public"]["Enums"]["reservation_status"];
      }[]
    >();

  const reservedTotal = (existingRes ?? [])
    .filter((r) => r.status !== "cancelada")
    .reduce((acc, r) => acc + r.quantity, 0);

  if (campaign.max_quantity && reservedTotal + quantity > campaign.max_quantity) {
    const left = Math.max(0, campaign.max_quantity - reservedTotal);
    return {
      status: "error",
      message:
        left === 0
          ? "La campaña ya alcanzó su cupo máximo."
          : `Solo quedan ${left} unidad(es) disponibles.`,
    };
  }

  // 4. Determinar el escalón vigente para el total proyectado.
  const projectedTotal = reservedTotal + quantity;
  const tier = findCurrentTier(campaign.pricing_tiers, projectedTotal);
  if (!tier) {
    return {
      status: "error",
      message: "La campaña todavía no tiene escalones de precio configurados.",
    };
  }

  const unitPriceCents = tier.unit_price_cents_usd;
  const totalCents = unitPriceCents * quantity;
  const depositCents = Math.round(
    (totalCents * campaign.deposit_percentage) / 100,
  );

  // 5. Insertar la reserva. RLS verifica que user_id == auth.uid().
  type ReservationInsert =
    Database["public"]["Tables"]["campaign_reservations"]["Insert"];
  const newReservation: ReservationInsert = {
    campaign_id: campaign.id,
    user_id: user.id,
    quantity,
    unit_price_at_reservation_cents_usd: unitPriceCents,
    expected_deposit_cents_usd: depositCents,
    status: "activa",
  };

  const { error: insertError } = await supabase
    .from("campaign_reservations")
    .insert(newReservation as never);

  if (insertError) {
    console.error("Error creating reservation:", insertError);
    return {
      status: "error",
      message: "No pudimos guardar tu reserva. Intentá de nuevo en un minuto.",
    };
  }

  // 6. Invalidar caches y redirigir a confirmación.
  revalidatePath("/campanas");
  revalidatePath(`/campanas/${campaign.slug}`);
  revalidatePath("/mis-reservas");

  redirect(`/campanas/${campaign.slug}/reservada?quantity=${quantity}`);
}

// ----------------------------------------------------------------------------
// cancelReservationAction — cancela una reserva del usuario actual.
// Regla §5.3 del CLAUDE.md: permitido hasta 72 hs antes del cierre.
// ----------------------------------------------------------------------------

export type CancelReservationResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function cancelReservationAction(
  reservationId: string,
  reason?: string,
): Promise<CancelReservationResult> {
  if (!reservationId) {
    return { status: "error", message: "Reserva inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  // Buscamos la reserva del user (RLS también lo refuerza).
  const { data: reservation, error: rErr } = await supabase
    .from("campaign_reservations")
    .select(
      `
      id, status, user_id, campaign_id,
      campaign:campaigns(id, slug, status, closes_at)
      `,
    )
    .eq("id", reservationId)
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<{
      id: string;
      status: Database["public"]["Enums"]["reservation_status"];
      user_id: string;
      campaign_id: string;
      campaign:
        | { id: string; slug: string; status: string; closes_at: string }
        | { id: string; slug: string; status: string; closes_at: string }[]
        | null;
    } | null>();

  if (rErr || !reservation) {
    return { status: "error", message: "No encontramos esa reserva." };
  }

  if (reservation.status === "cancelada") {
    return { status: "error", message: "Esta reserva ya está cancelada." };
  }

  const campaign = Array.isArray(reservation.campaign)
    ? reservation.campaign[0]
    : reservation.campaign;
  if (!campaign) {
    return { status: "error", message: "Campaña no disponible." };
  }

  // Solo se puede cancelar si la campaña todavía está activa.
  if (campaign.status !== "activa") {
    return {
      status: "error",
      message:
        "La campaña ya cerró. Si querés gestionar tu reserva, abrí un ticket de soporte.",
    };
  }

  // Validamos los 72hs antes del cierre.
  const closesAtMs = new Date(campaign.closes_at).getTime();
  const cutoffMs = closesAtMs - 72 * 60 * 60 * 1000;
  if (Date.now() > cutoffMs) {
    return {
      status: "error",
      message:
        "Ya pasó el plazo para cancelar (72 hs antes del cierre). Tu reserva sigue activa.",
    };
  }

  // Actualizamos. RLS verifica que sea el dueño.
  type ReservationUpdate =
    Database["public"]["Tables"]["campaign_reservations"]["Update"];
  const update: ReservationUpdate = {
    status: "cancelada",
    cancelled_at: new Date().toISOString(),
    cancellation_reason: reason?.trim() || "Cancelación voluntaria del usuario",
  };

  const { error: uErr } = await supabase
    .from("campaign_reservations")
    .update(update as never)
    .eq("id", reservationId)
    .eq("user_id", user.id);

  if (uErr) {
    console.error("Error cancelando reserva:", uErr);
    return {
      status: "error",
      message: "No pudimos cancelar la reserva. Probá de nuevo en un minuto.",
    };
  }

  revalidatePath("/mis-reservas");
  revalidatePath(`/campanas/${campaign.slug}`);

  return {
    status: "success",
    message:
      "Tu reserva fue cancelada. Si pagaste seña, te la devolvemos al método original.",
  };
}
