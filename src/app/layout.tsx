import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

// Plus Jakarta Sans — humanist sans-serif rounded, similar al feel del
// FUN Parque (friendly, energético, no corporativo). Pesos 400-800.
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mercado Nuestro · Importá en grupo, pagá precio mayorista",
    template: "%s · Mercado Nuestro",
  },
  description:
    "Plataforma uruguaya de compra colaborativa. Sumate a campañas de importación grupal, comprá stock disponible o publicá productos en el marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-UY"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
