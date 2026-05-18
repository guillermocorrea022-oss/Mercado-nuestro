import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

// Layout para todas las rutas públicas (home, campañas, marketplace, etc.).
// Server Component por default; el Header puede leer la sesión más adelante.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
