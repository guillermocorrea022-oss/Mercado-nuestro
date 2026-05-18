import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";

import { NotificationPreferencesForm } from "@/components/perfil/NotificationPreferencesForm";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Preferencias de notificación",
};

type Row = {
  notification_type: string;
  channels: Database["public"]["Enums"]["notification_channel"][];
};

export default async function NotificationPreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("notification_type, channels")
    .eq("user_id", user.id)
    .returns<Row[]>();

  const initial: Record<
    string,
    Database["public"]["Enums"]["notification_channel"][]
  > = {};
  for (const r of prefs ?? []) {
    initial[r.notification_type] = r.channels;
  }

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/perfil/notificaciones"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a notificaciones
        </Link>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Preferencias de notificación
            </h1>
            <p className="mt-2 text-muted-foreground">
              Elegí por qué canales querés recibir cada tipo de aviso.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <NotificationPreferencesForm initial={initial} />
        </div>
      </div>
    </Container>
  );
}
