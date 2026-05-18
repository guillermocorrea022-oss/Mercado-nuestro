"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCampaignAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const initialState = { status: "idle" as const };

interface Tier {
  min_quantity: string;
  max_quantity: string;
  unit_price_cents_usd: string;
}

interface ProductOption {
  id: string;
  name: string;
}

interface CreateCampaignFormProps {
  products: ProductOption[];
}

export function CreateCampaignForm({ products }: CreateCampaignFormProps) {
  const [state, formAction] = useActionState(
    createCampaignAction,
    initialState,
  );

  const [tiers, setTiers] = useState<Tier[]>([
    { min_quantity: "1", max_quantity: "", unit_price_cents_usd: "" },
  ]);

  const addTier = () =>
    setTiers((prev) => [
      ...prev,
      { min_quantity: "", max_quantity: "", unit_price_cents_usd: "" },
    ]);
  const removeTier = (i: number) =>
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  const updateTier = (i: number, field: keyof Tier, value: string) =>
    setTiers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)),
    );

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <FormError message={state.message} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight">
          Datos de la campaña
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="product_id">Producto</Label>
            <select
              id="product_id"
              name="product_id"
              required
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>
                Elegí un producto…
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.product_id} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="title">Título de la campaña</Label>
            <Input
              id="title"
              name="title"
              required
              className="mt-1.5"
              placeholder="Cámara IP WiFi · Primera tanda"
            />
            <FieldError errors={state.fieldErrors?.title} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              required
              className="mt-1.5"
              placeholder="camara-ip-wifi-primera-tanda"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Solo minúsculas, números y guiones. Aparece en la URL pública.
            </p>
            <FieldError errors={state.fieldErrors?.slug} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Descripción corta</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Sumate a la primera importación grupal..."
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="hero_image_url">Imagen destacada (URL)</Label>
            <Input
              id="hero_image_url"
              name="hero_image_url"
              type="url"
              className="mt-1.5"
              placeholder="https://..."
            />
            <FieldError errors={state.fieldErrors?.hero_image_url} />
          </div>

          <div>
            <Label htmlFor="moq">MOQ (mínimo para que se ejecute)</Label>
            <Input
              id="moq"
              name="moq"
              type="number"
              min="1"
              required
              className="mt-1.5"
            />
            <FieldError errors={state.fieldErrors?.moq} />
          </div>

          <div>
            <Label htmlFor="max_quantity">Cupo máximo (opcional)</Label>
            <Input
              id="max_quantity"
              name="max_quantity"
              type="number"
              min="1"
              className="mt-1.5"
            />
            <FieldError errors={state.fieldErrors?.max_quantity} />
          </div>

          <div>
            <Label htmlFor="deposit_percentage">% Seña</Label>
            <Input
              id="deposit_percentage"
              name="deposit_percentage"
              type="number"
              min="1"
              max="100"
              defaultValue={30}
              required
              className="mt-1.5"
            />
            <FieldError errors={state.fieldErrors?.deposit_percentage} />
          </div>

          <div>
            <Label htmlFor="closes_at">Fecha de cierre</Label>
            <Input
              id="closes_at"
              name="closes_at"
              type="datetime-local"
              required
              className="mt-1.5"
            />
            <FieldError errors={state.fieldErrors?.closes_at} />
          </div>

          <div>
            <Label htmlFor="estimated_arrival_at">
              Llegada estimada (opcional)
            </Label>
            <Input
              id="estimated_arrival_at"
              name="estimated_arrival_at"
              type="date"
              className="mt-1.5"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="return_policy">Política de devolución</Label>
            <textarea
              id="return_policy"
              name="return_policy"
              rows={3}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Garantía de 6 meses contra defecto de fábrica..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Escalones de precio
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              El primer escalón debe arrancar en 1. Al cerrar, todos pagan el
              mejor alcanzado.
            </p>
          </div>
          <button
            type="button"
            onClick={addTier}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5",
            )}
          >
            <Plus className="size-3.5" aria-hidden />
            Agregar escalón
          </button>
        </div>

        {state.fieldErrors?.pricing_tiers ? (
          <FieldError errors={state.fieldErrors.pricing_tiers} />
        ) : null}

        <div className="mt-6 space-y-3">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-end"
            >
              <div>
                <Label htmlFor={`tier-min-${idx}`}>Desde unidad</Label>
                <Input
                  id={`tier-min-${idx}`}
                  name={`tier-min-${idx}`}
                  type="number"
                  min="1"
                  required
                  value={tier.min_quantity}
                  onChange={(e) => updateTier(idx, "min_quantity", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor={`tier-max-${idx}`}>Hasta (opcional)</Label>
                <Input
                  id={`tier-max-${idx}`}
                  name={`tier-max-${idx}`}
                  type="number"
                  min="1"
                  value={tier.max_quantity}
                  onChange={(e) => updateTier(idx, "max_quantity", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor={`tier-price-${idx}`}>
                  Precio por unidad (centavos USD)
                </Label>
                <Input
                  id={`tier-price-${idx}`}
                  name={`tier-price-${idx}`}
                  type="number"
                  min="1"
                  required
                  value={tier.unit_price_cents_usd}
                  onChange={(e) =>
                    updateTier(idx, "unit_price_cents_usd", e.target.value)
                  }
                  className="mt-1.5"
                  placeholder="2500 = USD 25"
                />
              </div>
              {tiers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeTier(idx)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5 text-destructive",
                  )}
                  aria-label={`Eliminar escalón ${idx + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <SubmitButton label="Crear campaña" pendingLabel="Creando..." />
    </form>
  );
}
