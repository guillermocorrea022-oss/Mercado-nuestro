import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// Cliente Supabase para Client Components.
// Lee la sesión desde cookies que el middleware refresca en cada request.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
