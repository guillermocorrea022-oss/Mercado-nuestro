"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const proposalSchema = z.object({
  title: z.string().trim().min(5, "Título demasiado corto").max(200),
  description: z.string().trim().optional().nullable(),
  reference_url: z
    .preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.url("URL inválida").optional(),
    )
    .nullable()
    .optional(),
  my_quantity: z.coerce
    .number({ error: "Cantidad requerida" })
    .int()
    .positive("Mayor a 0")
    .max(10000),
  max_price_cents_usd: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.coerce.number().int().positive().nullable(),
    )
    .optional(),
});

export type ProposalFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function createProposalAction(
  _prev: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/app/propuestas/nueva");
  }

  const parsed = proposalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    reference_url: formData.get("reference_url"),
    my_quantity: formData.get("my_quantity"),
    max_price_cents_usd: formData.get("max_price_cents_usd"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type ProposalInsert = Database["public"]["Tables"]["product_proposals"]["Insert"];
  const insert: ProposalInsert = {
    proposed_by: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    reference_url: parsed.data.reference_url ?? null,
    my_quantity: parsed.data.my_quantity,
    max_price_cents_usd: parsed.data.max_price_cents_usd ?? null,
    status: "abierta",
  };

  const { data: proposal, error } = await supabase
    .from("product_proposals")
    .insert(insert as never)
    .select("id")
    .single()
    .returns<{ id: string }>();
  if (error || !proposal) {
    return { status: "error", message: error?.message ?? "Error" };
  }

  // El proponente queda automáticamente "interesado" con su cantidad.
  type InterestInsert =
    Database["public"]["Tables"]["product_proposal_interests"]["Insert"];
  const interest: InterestInsert = {
    proposal_id: proposal.id,
    user_id: user.id,
    quantity: parsed.data.my_quantity,
    max_price_cents_usd: parsed.data.max_price_cents_usd ?? null,
  };
  await supabase
    .from("product_proposal_interests")
    .insert(interest as never);

  revalidatePath("/app/propuestas");
  redirect(`/app/propuestas`);
}

export async function joinProposalAction(
  proposalId: string,
  quantity: number,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  type InterestInsert =
    Database["public"]["Tables"]["product_proposal_interests"]["Insert"];
  const insert: InterestInsert = {
    proposal_id: proposalId,
    user_id: user.id,
    quantity,
  };

  const { error } = await supabase
    .from("product_proposal_interests")
    .upsert(insert as never, { onConflict: "proposal_id,user_id" });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/app/propuestas");
  return { status: "success" };
}
