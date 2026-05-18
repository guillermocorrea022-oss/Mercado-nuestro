import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Envíos y entregas",
};

export default function EnviosPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Envíos y entregas"
      intro="Cómo y cuándo te llega tu pedido."
    >
      <h2>Stock disponible</h2>
      <p>
        Llega a tu casa en 2 a 5 días hábiles dentro de Uruguay. También podés
        retirar gratis en nuestro local de Leandro Gómez 1076, Paysandú.
      </p>

      <h2>Campañas de importación</h2>
      <p>
        Los plazos dependen del proveedor y de la aduana. En el detalle de la
        campaña vas a ver una fecha estimada de llegada. Te avisamos cada
        cambio de estado por email y notificación in-app.
      </p>

      <h2>Marketplace</h2>
      <p>
        El despacho lo coordina el revendedor con la empresa de logística que
        elija. El plazo máximo de despacho es 3 días hábiles. Si pasan 7 días
        sin despacho, se cancela la venta y se te devuelve el dinero.
      </p>

      <h2>Costos de envío</h2>
      <p>
        Los costos se calculan en el checkout según destino. Local de Paysandú
        retiro gratis siempre.
      </p>
    </LegalPage>
  );
}
