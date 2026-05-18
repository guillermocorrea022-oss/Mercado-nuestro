// Cliente SMS — STUB.
// Cuando esté Twilio en producción:
//   - TWILIO_ACCOUNT_SID
//   - TWILIO_AUTH_TOKEN
//   - TWILIO_SMS_NUMBER
// reemplazar este archivo con el SDK de Twilio:
//   import twilio from "twilio";
//   const client = twilio(SID, TOKEN);
//   await client.messages.create({ from, to, body });

const HAS_REAL_TWILIO = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN,
);

export async function sendSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; stubbed: boolean }> {
  if (!HAS_REAL_TWILIO) {
    console.log("[sms:stub] →", { to, body });
    return { ok: true, stubbed: true };
  }
  // TODO(twilio): SDK real.
  return { ok: true, stubbed: false };
}

export function generateVerificationCode(): string {
  // 6 dígitos. Suficiente para SMS one-shot con expiración corta.
  return Math.floor(100000 + Math.random() * 900000).toString();
}
