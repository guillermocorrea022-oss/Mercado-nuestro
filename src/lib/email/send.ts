// Cliente de email — STUB.
//
// Cuando esté disponible RESEND_API_KEY en .env.local, reemplazar esta
// implementación con el SDK de Resend:
//
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY!);
//   await resend.emails.send({...});

const HAS_REAL_RESEND = Boolean(process.env.RESEND_API_KEY);

export interface EmailMessage {
  to: string;
  subject: string;
  /** Cuerpo en texto plano. Por simplicidad sin HTML por ahora. */
  text: string;
  /** Opcional: cuerpo HTML. */
  html?: string;
}

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean }> {
  if (!HAS_REAL_RESEND) {
    // STUB: solo logueamos. El envío real se conecta cuando haya API key.
    console.log("[email:stub] →", {
      to: msg.to,
      subject: msg.subject,
      text: msg.text.slice(0, 120),
    });
    return { ok: true };
  }

  // TODO(resend): implementar con SDK real.
  try {
    // const { Resend } = await import("resend");
    // const resend = new Resend(process.env.RESEND_API_KEY!);
    // await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL ?? "hola@mercadonuestro.uy",
    //   to: msg.to,
    //   subject: msg.subject,
    //   text: msg.text,
    //   html: msg.html,
    // });
    return { ok: true };
  } catch (err) {
    console.error("[email] error enviando:", err);
    return { ok: false };
  }
}

export function reservationConfirmedEmail(args: {
  firstName?: string | null;
  campaignTitle: string;
  quantity: number;
  depositCents: number;
  campaignUrl: string;
}): EmailMessage["text"] {
  const greeting = args.firstName ? `Hola ${args.firstName},` : "Hola,";
  return `${greeting}

¡Reservaste tu lugar en "${args.campaignTitle}"!

· Cantidad: ${args.quantity} unidad(es)
· Seña pendiente: USD ${(args.depositCents / 100).toFixed(2)}

En las próximas horas te llegará un link para pagar la seña con Mercado Pago.
Mientras tanto, podés ver el estado de tu reserva acá:
${args.campaignUrl}

Cuando la campaña cierre, te avisamos por email. Si llegamos a un mejor
escalón de precio, la diferencia se descuenta del saldo automáticamente.

¡Gracias por sumarte!
— Equipo Mercado Nuestro`;
}
