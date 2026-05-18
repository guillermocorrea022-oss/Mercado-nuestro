// Helper para crear notificaciones in-app desde Server Actions.
// El envío por email (cuando esté Resend) se dispara en paralelo si el user
// tiene esa preferencia activa — eso lo decide enviarEmailTransaccional().

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  contextData?: Record<string, unknown>;
}

export async function createNotification(
  supabase: SupabaseClient<Database>,
  input: CreateNotificationInput,
) {
  const insert: NotificationInsert = {
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    context_data: (input.contextData ?? {}) as never,
    channel: "in_app",
  };

  const { error } = await supabase
    .from("notifications")
    .insert(insert as never);

  if (error) {
    console.error("Error creando notificación:", error);
  }
}
