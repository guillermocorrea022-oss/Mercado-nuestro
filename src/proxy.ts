import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// En Next 16 esto se llama `proxy` (antes `middleware`), pero el patrón de
// @supabase/ssr sigue siendo el mismo: leer cookies del request, refrescar el
// token si expiró, y propagar las cookies a la response.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Excluir rutas internas de Next.js y assets estáticos.
  // El refresh de sesión solo importa en navegación real y llamadas a API.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
