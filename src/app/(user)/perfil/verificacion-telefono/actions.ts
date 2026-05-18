"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { generateVerificationCode, sendSms } from "@/lib/sms/send";
import type { Database } from "@/types/database";

export type PhoneFormState = {
  status: "idle" | "code_sent" | "verified" | "error";
  message?: string;
  /** Solo en modo stub: el código se devuelve al cliente para que el user
   *  pueda probar el flujo sin SMS real. En prod con Twilio esto NUNCA debe
   *  exponerse — la SDK manda el SMS y el server no devuelve el código. */
  stubCode?: string;
};

export async function sendPhoneCodeAction(
  _prev: PhoneFormState,
  formData: FormData,
): Promise<PhoneFormState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!/^\+?\d{8,15}$/.test(phone)) {
    return {
      status: "error",
      message: "Número inválido. Usá formato +5985xxxxxxxx.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  // Actualizar phone en profile.
  type Update = Database["public"]["Tables"]["profiles"]["Update"];
  await supabase
    .from("profiles")
    .update({ phone, phone_verified_at: null } as Update as never)
    .eq("id", user.id);

  // Generar código + guardarlo.
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  type Insert =
    Database["public"]["Tables"]["phone_verification_codes"]["Insert"];
  await supabase.from("phone_verification_codes").insert({
    user_id: user.id,
    code,
    expires_at: expiresAt,
  } as Insert as never);

  const { stubbed } = await sendSms(
    phone,
    `Tu código de Mercado Nuestro es ${code}. Expira en 10 minutos.`,
  );

  revalidatePath("/perfil/verificacion-telefono");
  return {
    status: "code_sent",
    message: stubbed
      ? "SMS stubbed — usá el código que aparece abajo para probar."
      : "Te enviamos un código por SMS.",
    stubCode: stubbed ? code : undefined,
  };
}

export async function verifyPhoneCodeAction(
  _prev: PhoneFormState,
  formData: FormData,
): Promise<PhoneFormState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { status: "error", message: "Código inválido (6 dígitos)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Iniciá sesión." };

  // Buscar el código más reciente no consumido.
  const { data: record } = await supabase
    .from("phone_verification_codes")
    .select("id, code, expires_at, consumed_at")
    .eq("user_id", user.id)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .returns<{
      id: string;
      code: string;
      expires_at: string;
      consumed_at: string | null;
    } | null>();

  if (!record) {
    return { status: "error", message: "Pedí un código primero." };
  }
  if (new Date(record.expires_at) < new Date()) {
    return { status: "error", message: "El código expiró. Pedí uno nuevo." };
  }
  if (record.code !== code) {
    return { status: "error", message: "Código incorrecto." };
  }

  // Marcar como consumido + verificar el teléfono.
  type CodeUpdate =
    Database["public"]["Tables"]["phone_verification_codes"]["Update"];
  await supabase
    .from("phone_verification_codes")
    .update({ consumed_at: new Date().toISOString() } as CodeUpdate as never)
    .eq("id", record.id);

  type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
  await supabase
    .from("profiles")
    .update({
      phone_verified_at: new Date().toISOString(),
    } as ProfileUpdate as never)
    .eq("id", user.id);

  revalidatePath("/perfil/verificacion-telefono");
  revalidatePath("/perfil");
  return {
    status: "verified",
    message: "¡Listo! Tu teléfono está verificado.",
  };
}
