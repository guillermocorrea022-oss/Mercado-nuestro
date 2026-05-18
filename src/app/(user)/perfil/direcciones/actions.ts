"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { addressSchema } from "@/lib/validations/addresses";
import type { Database } from "@/types/database";

export type AddressFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function addAddressAction(
  _prev: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    street: formData.get("street"),
    street_number: formData.get("street_number"),
    apartment: formData.get("apartment"),
    city: formData.get("city"),
    department: formData.get("department"),
    postal_code: formData.get("postal_code"),
    instructions: formData.get("instructions"),
    is_primary: formData.get("is_primary") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type Insert = Database["public"]["Tables"]["user_addresses"]["Insert"];
  const insert: Insert = {
    user_id: user.id,
    label: parsed.data.label,
    street: parsed.data.street,
    street_number: parsed.data.street_number ?? null,
    apartment: parsed.data.apartment ?? null,
    city: parsed.data.city,
    department: parsed.data.department,
    postal_code: parsed.data.postal_code ?? null,
    instructions: parsed.data.instructions ?? null,
    is_primary: parsed.data.is_primary ?? false,
  };

  // Si is_primary, desmarcar las otras primero (en la misma transacción
  // lógica; podríamos hacerlo en RPC pero por simplicidad lo hacemos en JS).
  if (insert.is_primary) {
    type Update = Database["public"]["Tables"]["user_addresses"]["Update"];
    await supabase
      .from("user_addresses")
      .update({ is_primary: false } as Update as never)
      .eq("user_id", user.id);
  }

  const { error } = await supabase
    .from("user_addresses")
    .insert(insert as never);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/perfil/direcciones");
  return { status: "idle" };
}

export async function deleteAddressAction(
  addressId: string,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Sin sesión" };

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { status: "error", message: error.message };
  revalidatePath("/perfil/direcciones");
  return { status: "success" };
}
