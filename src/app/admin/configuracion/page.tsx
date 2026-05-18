import type { Metadata } from "next";

import {
  SettingsForm,
  type SettingRow,
} from "@/components/admin/SettingsForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Configuración · Admin",
};

export default async function AdminConfiguracionPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("key, value, description, value_type")
    .order("key")
    .returns<SettingRow[]>();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Configuración
      </h1>
      <p className="mt-2 text-muted-foreground">
        Parámetros globales del sistema. Los cambios impactan inmediatamente.
      </p>

      <div className="mt-10">
        <SettingsForm settings={settings ?? []} />
      </div>
    </div>
  );
}
