"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function markAllNotificationsReadAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  type Update = Database["public"]["Tables"]["notifications"]["Update"];
  const update: Update = { read_at: new Date().toISOString() };

  await supabase
    .from("notifications")
    .update(update as never)
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath("/perfil/notificaciones");
  revalidatePath("/", "layout");
}
