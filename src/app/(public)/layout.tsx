import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

// Layout para todas las rutas públicas (home, campañas, marketplace, etc.).
// Server Component por default; el Header puede leer la sesión más adelante.
// El padding-bottom de <main> reserva espacio para el bottom nav mobile
// (~80px = 64 nav + 16 de margen para que no quede pegado al footer).
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
