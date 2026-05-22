"use client";

import { Check } from "lucide-react";

import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Tier = {
  range: string;
  pricePerUnit: string;
  /** Para destacar el escalón "mejor precio". */
  highlight?: boolean;
};

type Category = {
  id: string;
  label: string;
  /** Descripción debajo del título. */
  intro: string;
  tiers: Tier[];
  /** Items incluidos en todos los escalones. */
  features: string[];
  unitsHeader?: string;
  ctaLabel: string;
  ctaHref: string;
};

const CATEGORIES: Category[] = [
  {
    id: "electronica",
    label: "Electrónica",
    intro:
      "Cámaras IP, parlantes Bluetooth, accesorios y más. Precios escalonados según volumen total de la campaña.",
    unitsHeader: "Cantidad reservada entre todos",
    tiers: [
      { range: "1 a 10 unidades", pricePerUnit: "USD 25" },
      { range: "11 a 30 unidades", pricePerUnit: "USD 18" },
      { range: "31 a 100 unidades", pricePerUnit: "USD 14", highlight: true },
    ],
    features: [
      "Garantía local de 6 meses",
      "Soporte en español",
      "Manual + accesorios incluidos",
    ],
    ctaLabel: "Ver campañas electrónica",
    ctaHref: "/app/campanas",
  },
  {
    id: "hogar",
    label: "Hogar",
    intro:
      "Artículos para el hogar a precio importador. Ideal para juntar pedido con vecinos del barrio.",
    unitsHeader: "Cantidad reservada entre todos",
    tiers: [
      { range: "1 a 5 unidades", pricePerUnit: "USD 45" },
      { range: "6 a 20 unidades", pricePerUnit: "USD 32" },
      { range: "21 unidades o más", pricePerUnit: "USD 24", highlight: true },
    ],
    features: [
      "Retiro gratis en Paysandú",
      "Envío a todo Uruguay",
      "Devolución hasta 7 días",
    ],
    ctaLabel: "Ver campañas hogar",
    ctaHref: "/app/campanas",
  },
  {
    id: "indumentaria",
    label: "Indumentaria",
    intro:
      "Ropa y accesorios al por mayor para revender o equipar a tu familia con calidad importada.",
    unitsHeader: "Cantidad reservada entre todos",
    tiers: [
      { range: "1 a 12 unidades", pricePerUnit: "USD 12" },
      { range: "13 a 50 unidades", pricePerUnit: "USD 9" },
      { range: "51 unidades o más", pricePerUnit: "USD 7", highlight: true },
    ],
    features: [
      "Talles disponibles S a XXL",
      "Múltiples colores",
      "Bonus revendedor desde 5 uds",
    ],
    ctaLabel: "Ver campañas indumentaria",
    ctaHref: "/app/campanas",
  },
  {
    id: "empresas",
    label: "Empresas",
    intro:
      "Para comercios o emprendedores que importan al por mayor. Precios negociables y servicio dedicado.",
    unitsHeader: "Cantidad por pedido",
    tiers: [
      { range: "50 a 100 unidades", pricePerUnit: "consultar" },
      { range: "101 a 500 unidades", pricePerUnit: "consultar" },
      { range: "Más de 500", pricePerUnit: "a medida", highlight: true },
    ],
    features: [
      "Facturación con RUT",
      "Logística dedicada",
      "Asesoría de importador avanzado",
    ],
    ctaLabel: "Postularme como importador",
    ctaHref: "/app/ser-importador",
  },
];

function PriceTable({ category }: { category: Category }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {category.intro}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-2 bg-secondary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{category.unitsHeader ?? "Cantidad"}</span>
            <span className="text-right">Precio por unidad</span>
          </div>
          <ul className="divide-y divide-border">
            {category.tiers.map((tier) => (
              <li
                key={tier.range}
                className={cn(
                  "grid grid-cols-2 items-center px-5 py-4 text-sm",
                  tier.highlight && "bg-primary/8",
                )}
              >
                <span className="font-medium">{tier.range}</span>
                <span
                  className={cn(
                    "text-right text-lg font-extrabold tracking-tight",
                    tier.highlight ? "text-primary-foreground/90" : "",
                  )}
                >
                  {tier.pricePerUnit}
                  {tier.highlight ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 align-middle text-[10px] font-semibold text-primary-foreground">
                      MEJOR PRECIO
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Incluido en todos los escalones
        </p>
        <ul className="mt-4 space-y-3">
          {category.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>

        <a
          href={category.ctaHref}
          className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
        >
          {category.ctaLabel} →
        </a>
      </aside>
    </div>
  );
}

export function PricingTabs() {
  return (
    <Tabs
      tabs={CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        content: <PriceTable category={c} />,
      }))}
    />
  );
}
