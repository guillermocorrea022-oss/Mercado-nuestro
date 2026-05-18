import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Política de devoluciones",
};

export default function DevolucionesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de devoluciones"
      intro="Si algo no está bien con tu pedido, lo resolvemos. Estas son las reglas que aplicamos."
    >
      <h2>Plazo</h2>
      <p>
        Tenés 7 días corridos desde la entrega para abrir un reclamo desde tu
        panel.
      </p>

      <h2>Motivos válidos</h2>
      <ul>
        <li>Producto defectuoso de fábrica.</li>
        <li>No llegó a destino.</li>
        <li>Producto distinto al pedido.</li>
        <li>Faltante de unidades.</li>
        <li>No corresponde a la descripción publicada.</li>
      </ul>

      <h2>Evidencia requerida</h2>
      <p>
        Foto del producto recibido, foto del embalaje y una descripción breve
        de lo ocurrido. Adjuntala en el formulario de reclamo.
      </p>

      <h2>Resolución</h2>
      <p>
        Resolvemos los reclamos en hasta 5 días hábiles. Cuando es técnicamente
        posible, los reembolsos se hacen al método de pago original; si no, se
        acreditan como saldo en tu cuenta.
      </p>

      <h2>Apelación</h2>
      <p>
        Si no estás de acuerdo con la resolución, podés apelar UNA vez desde el
        mismo reclamo. La apelación la revisa otro miembro del equipo.
      </p>
    </LegalPage>
  );
}
