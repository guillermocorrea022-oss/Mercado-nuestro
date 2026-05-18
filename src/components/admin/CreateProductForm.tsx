"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormError,
  SubmitButton,
} from "@/components/auth/AuthFormHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction } from "@/app/admin/actions";

const initialState = { status: "idle" as const };

interface CategoryOption {
  id: string;
  name: string;
}

export function CreateProductForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [state, formAction] = useActionState(createProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormError message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required className="mt-1.5" />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required className="mt-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">
            URL del producto. Solo minúsculas, números y guiones.
          </p>
          <FieldError errors={state.fieldErrors?.slug} />
        </div>

        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="category_id">Categoría</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue=""
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="main_image_url">Imagen principal (URL)</Label>
          <Input
            id="main_image_url"
            name="main_image_url"
            type="url"
            className="mt-1.5"
          />
          <FieldError errors={state.fieldErrors?.main_image_url} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="short_description">Descripción corta</Label>
          <textarea
            id="short_description"
            name="short_description"
            rows={2}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="long_description">Descripción larga</Label>
          <textarea
            id="long_description"
            name="long_description"
            rows={5}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <SubmitButton label="Crear producto" pendingLabel="Creando..." />
    </form>
  );
}
