import { redirect } from "next/navigation";

// /app → redirige a la pantalla principal de la Web App: Mercado Nuestro
// (marketplace). Definido en ESTRUCTURA_APP.md sección "Las 4 secciones
// de la Web App" — la sección 1 (Mercado Nuestro/app/marketplace) es la
// pantalla por defecto al entrar a la app.
export default function AppRootPage() {
  redirect("/app/marketplace");
}
