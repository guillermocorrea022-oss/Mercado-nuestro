import { NextResponse, type NextRequest } from "next/server";

// Link corto del vendedor. Setea cookie de atribución (30 días) y redirige
// al catálogo público /app/vendedor/[slug]. La cookie se lee al crear reservas
// y compras para asignar la comisión al vendedor.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(`/app/vendedor/${slug}`, request.url);
  const response = NextResponse.redirect(url, { status: 302 });

  // Cookie de atribución: 30 días desde última actividad.
  response.cookies.set("mn_seller", slug, {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  return response;
}
