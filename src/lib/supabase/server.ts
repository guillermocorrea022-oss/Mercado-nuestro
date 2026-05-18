import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// Cliente Supabase para Server Components, Server Actions y Route Handlers.
// Lee y escribe cookies de sesión vía next/headers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En Server Components puros no se pueden setear cookies; el middleware
          // se encarga del refresh. El try/catch evita ruido cuando esto se llama
          // desde un Server Component renderizando una página.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Llamado desde Server Component: ignorar.
          }
        },
      },
    },
  );
}
