import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de privacidad"
      intro="Tu privacidad nos importa. Acá explicamos qué datos recolectamos y cómo los usamos."
    >
      <h2>Datos que recolectamos</h2>
      <ul>
        <li>Nombre, email, teléfono y dirección de envío.</li>
        <li>Cédula y datos fiscales solo para vendedores y revendedores.</li>
        <li>Información de pago: la procesa Mercado Pago, no la guardamos.</li>
        <li>Datos de navegación con cookies y métricas de uso.</li>
      </ul>

      <h2>Cómo los usamos</h2>
      <ul>
        <li>Para procesar tus compras y entregas.</li>
        <li>Para verificar identidad en cobros y despachos.</li>
        <li>Para enviarte notificaciones según tus preferencias.</li>
        <li>Para mejorar el servicio (estadísticas agregadas).</li>
      </ul>

      <h2>Compartir con terceros</h2>
      <p>
        Solo compartimos datos con proveedores estrictamente necesarios:
        Mercado Pago, empresas de logística, y servicios de email
        transaccional. Nunca vendemos información a terceros.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés pedir acceso, rectificación o eliminación de tus datos en
        cualquier momento escribiendo a hola@mercadonuestro.uy.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies esenciales para mantener tu sesión y una cookie de
        atribución para los vendedores por catálogo (30 días). No usamos
        cookies de tracking publicitario.
      </p>
    </LegalPage>
  );
}
