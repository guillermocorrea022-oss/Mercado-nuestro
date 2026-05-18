// Cliente WhatsApp Business API (Twilio) — STUB.
// Cuando esté disponible:
//   - TWILIO_WHATSAPP_NUMBER
// reemplazar con el SDK:
//   await client.messages.create({
//     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
//     to: `whatsapp:${to}`,
//     body,
//   });

const HAS_REAL_WHATSAPP = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_NUMBER,
);

export async function sendWhatsApp(
  to: string,
  body: string,
): Promise<{ ok: boolean; stubbed: boolean }> {
  if (!HAS_REAL_WHATSAPP) {
    console.log("[whatsapp:stub] →", { to, body });
    return { ok: true, stubbed: true };
  }
  return { ok: true, stubbed: false };
}
