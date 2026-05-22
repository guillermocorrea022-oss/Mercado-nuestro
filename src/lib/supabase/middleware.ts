import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// Refresca la sesión en cada request y propaga las cookies actualizadas.
// Llamar desde src/middleware.ts. No tocar la lógica de cookies salvo que
// entiendas el ciclo de refresh de @supabase/ssr: leer cookies del request,
// crear el cliente, y reescribirlas tanto en el request como en la response.
export async function updateSession(request: NextRequest) {
  // Inyectar el pathname en los request headers para que Server Components
  // puedan conocer la ruta actual con headers().get("x-pathname").
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Mantener los requestHeaders con x-pathname al recrear la response.
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Importante: llamar a getUser() acá fuerza el refresh del token si expiró.
  await supabase.auth.getUser();

  return response;
}
