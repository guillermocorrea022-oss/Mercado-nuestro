import { NextResponse, type NextRequest } from "next/server";

import { verifyMercadoPagoWebhookSignature } from "@/lib/mercadopago/client";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Webhook de Mercado Pago.
// Recibe notificaciones `payment.created` / `payment.updated` y actualiza la
// tabla `payments` + el estado de la reserva asociada.
//
// Cuando estén las credenciales reales: validar firma con
// MERCADOPAGO_WEBHOOK_SECRET (header `x-signature`).
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyMercadoPagoWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: { type?: string; data?: { id?: string; reservation_id?: string; amount_cents?: number; status?: string } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  // En este stub aceptamos un formato simplificado:
  // { type: "payment.updated", data: { reservation_id, amount_cents, status } }
  const reservationId = payload.data?.reservation_id;
  const amountCents = payload.data?.amount_cents;
  const externalId = payload.data?.id ?? null;
  const status = (payload.data?.status ?? "aprobado") as
    Database["public"]["Enums"]["payment_status"];

  if (!reservationId || !amountCents) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const supabase = await createClient();

  // Insertar/actualizar payment.
  type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
  const paymentInsert: PaymentInsert = {
    reservation_id: reservationId,
    amount_cents: amountCents,
    currency: "UYU",
    method: "mercado_pago",
    status,
    external_id: externalId,
    raw_payload: payload as never,
    processed_at: new Date().toISOString(),
  };

  const { error: paymentErr } = await supabase
    .from("payments")
    .insert(paymentInsert as never);

  if (paymentErr) {
    console.error("Error insertando payment:", paymentErr);
    return NextResponse.json({ error: paymentErr.message }, { status: 500 });
  }

  // Si el pago fue aprobado, marcar reserva como confirmada.
  if (status === "aprobado") {
    type ReservationUpdate =
      Database["public"]["Tables"]["campaign_reservations"]["Update"];
    const update: ReservationUpdate = { status: "confirmada" };
    await supabase
      .from("campaign_reservations")
      .update(update as never)
      .eq("id", reservationId);
  }

  return NextResponse.json({ ok: true });
}
