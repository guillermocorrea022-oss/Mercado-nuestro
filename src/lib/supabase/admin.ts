import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Cliente admin con service_role key — SOLO para usar desde route handlers
// con autorización por shared secret (cron endpoints, webhooks).
// JAMÁS importar desde código que se ejecute en el cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
