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
