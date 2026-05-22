import { Inter } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

// ─────────────────────────────────────────────────────────────────────────────
// Layout DEDICADO a la Web App (rutas /app/*).
//
// Esto vive SEPARADO del layout de la Web Home (src/app/(public)/layout.tsx)
// que cubre la landing (/). Esa landing ya está terminada y no se toca.
//
// FONT: la Web App usa Inter (definida en MERCADO_NUESTRO_DECISIONES.md §5).
// La Web Home queda con Plus Jakarta Sans del root layout. Acá pisamos la
// variable --font-sans solo dentro del subtree de /app/*.
//
// FASE 1.1 (esta migración): por ahora reusa los mismos Header / Footer /
// MobileBottomNav que tiene la Web Home. En FASE 3 se reemplaza el Header
// por el WebAppHeader de 3 barras definido en HEADER.md.
// ─────────────────────────────────────────────────────────────────────────────

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} flex min-h-screen flex-col`}
      style={{ ["--font-sans" as string]: "var(--font-inter)" }}
    >
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
