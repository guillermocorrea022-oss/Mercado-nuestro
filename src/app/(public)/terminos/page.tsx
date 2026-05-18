import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Términos y condiciones",
};

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Términos y condiciones"
      intro="Este documento describe cómo funciona Mercado Nuestro y los términos del acuerdo entre la plataforma y vos."
    >
      <h2>1. Sobre Mercado Nuestro</h2>
      <p>
        Mercado Nuestro es una plataforma uruguaya de comercio colaborativo que
        combina importación grupal, marketplace de reventa, stock disponible y
        red de vendedores por catálogo. Operamos desde Leandro Gómez 1076,
        Paysandú.
      </p>

      <h2>2. Aceptación</h2>
      <p>
        Al crear una cuenta o usar nuestros servicios estás aceptando estos
        términos. Si no estás de acuerdo, no uses la plataforma.
      </p>

      <h2>3. Roles del sistema</h2>
      <p>
        Existen seis roles acumulables: visitante, comprador, vendedor por
        catálogo, revendedor, importador avanzado y administrador. Cada rol
        tiene sus condiciones particulares descritas en el flujo de alta.
      </p>

      <h2>4. Campañas de importación</h2>
      <p>
        Las campañas tienen escalones de precio y un MOQ (cantidad mínima). Al
        cerrar exitosamente una campaña, todos los participantes pagan el mejor
        escalón alcanzado. Si no se llega al MOQ, devolvemos la seña al método
        de pago original o, si elegís, como crédito en cuenta + 5% de bonus.
      </p>

      <h2>5. Cancelaciones</h2>
      <p>
        Podés cancelar tu reserva hasta 72 horas antes del cierre de la
        campaña. Fuera de ese plazo no se devuelve la seña si la campaña sigue
        activa.
      </p>

      <h2>6. Marketplace de reventa</h2>
      <p>
        Las compras en el marketplace siempre pasan por la plataforma (modelo
        escrow). El dinero se libera al revendedor cuando confirmás recepción o
        cuando pasan 3 días desde el despacho sin reclamo.
      </p>

      <h2>7. Pagos</h2>
      <p>
        Procesamos pagos vía Mercado Pago Uruguay, transferencia, Abitab,
        Redpagos y crédito en cuenta. La moneda base de cálculo es USD; en
        checkout mostramos también el valor en UYU.
      </p>

      <h2>8. Datos personales</h2>
      <p>
        Tu información personal se trata según nuestra{" "}
        <a href="/privacidad" className="underline">
          política de privacidad
        </a>
        . No vendemos tus datos a terceros.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        Las campañas dependen de proveedores externos. Si una campaña no llega
        al MOQ o si un proveedor falla, no garantizamos la entrega del
        producto. En esos casos devolvemos el 100% del dinero pagado.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podemos modificar estos términos avisando con al menos 15 días de
        anticipación a través de la plataforma y por email.
      </p>
    </LegalPage>
  );
}
