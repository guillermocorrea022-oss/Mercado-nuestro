// Cliente de Mercado Pago — STUB.
//
// Cuando estén disponibles las credenciales reales en .env.local:
//   - MERCADOPAGO_ACCESS_TOKEN
//   - MERCADOPAGO_PUBLIC_KEY
//   - MERCADOPAGO_WEBHOOK_SECRET
// reemplazar este archivo con el SDK real (`mercadopago` v2).
//
// Por ahora, las funciones devuelven valores mock que permiten que el flujo
// de reservas funcione end-to-end en demo: createCampaignReservePreference()
// devuelve una URL ficticia, y el webhook handler en /api/webhooks/mercadopago
// puede recibir simulaciones desde el admin.

const HAS_REAL_CREDENTIALS =
  Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN) &&
  process.env.MERCADOPAGO_ACCESS_TOKEN !== "";

export interface CampaignDepositPreferenceInput {
  reservationId: string;
  campaignSlug: string;
  campaignTitle: string;
  quantity: number;
  amountCents: number;
  /** Email del usuario (para que MP lo asocie). */
  userEmail: string;
  /** URL absoluta de éxito/cancel. */
  successUrl: string;
  cancelUrl: string;
}

export interface CreatedPreference {
  /** ID de la preferencia (en stub: prefijo `stub_`). */
  id: string;
  /** URL a la que redirigir al usuario. */
  initPoint: string;
  /** Si está corriendo contra credenciales reales. */
  isReal: boolean;
}

export async function createCampaignDepositPreference(
  input: CampaignDepositPreferenceInput,
): Promise<CreatedPreference> {
  if (!HAS_REAL_CREDENTIALS) {
    // STUB: devolvemos un "init point" a una página local que simula el
    // checkout. Esto permite que el flujo se complete sin MP real.
    return {
      id: `stub_${input.reservationId}`,
      initPoint: `/checkout/mercadopago-stub?reservation=${encodeURIComponent(
        input.reservationId,
      )}`,
      isReal: false,
    };
  }

  // TODO(MP): implementar con SDK real cuando estén las credenciales.
  // Algo así:
  //
  // const { default: mercadopago } = await import("mercadopago");
  // mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  // const pref = await mercadopago.preferences.create({
  //   items: [
  //     {
  //       title: `Seña: ${input.campaignTitle}`,
  //       quantity: 1,
  //       unit_price: input.amountCents / 100, // MP espera unidades
  //       currency_id: "UYU",
  //     },
  //   ],
  //   external_reference: input.reservationId,
  //   payer: { email: input.userEmail },
  //   back_urls: { success: input.successUrl, failure: input.cancelUrl },
  //   auto_return: "approved",
  //   notification_url: `${new URL(input.successUrl).origin}/api/webhooks/mercadopago`,
  // });
  // return { id: pref.body.id, initPoint: pref.body.init_point, isReal: true };

  throw new Error("MP SDK no implementado todavía");
}

export function verifyMercadoPagoWebhookSignature(
  _payload: string,
  _signatureHeader: string | null,
): boolean {
  if (!HAS_REAL_CREDENTIALS) return true; // Stub: confiamos en dev
  // TODO(MP): validar firma con MERCADOPAGO_WEBHOOK_SECRET (HMAC-SHA256).
  return true;
}
