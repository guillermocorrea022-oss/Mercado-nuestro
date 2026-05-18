"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const NOTIFICATION_TYPES = [
  "campaign_updates",
  "marketplace_orders",
  "claims",
  "marketing",
] as const;

type NotificationType = (typeof NOTIFICATION_TYPES)[number];
type Channel = Database["public"]["Enums"]["notification_channel"];

export type PreferencesFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

export async function updateNotificationPrefsAction(
  _prev: PreferencesFormState,
  formData: FormData,
): Promise<PreferencesFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  type Insert =
    Database["public"]["Tables"]["notification_preferences"]["Insert"];

  const rows: Insert[] = NOTIFICATION_TYPES.map((type) => {
    const channels: Channel[] = (
      ["in_app", "email", "sms", "whatsapp"] as Channel[]
    ).filter((ch) => formData.get(`${type}_${ch}`) === "on");
    return {
      user_id: user.id,
      notification_type: type,
      channels: channels.length > 0 ? channels : ["in_app"],
    };
  });

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(rows as never, {
      onConflict: "user_id,notification_type",
    });

  if (error) {
    console.error("Error guardando prefs:", error);
    return {
      status: "error",
      message: "No pudimos guardar tus preferencias.",
    };
  }

  revalidatePath("/perfil/notificaciones/preferencias");
  return { status: "ok", message: "Preferencias guardadas." };
}
