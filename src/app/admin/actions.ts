"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createCampaignSchema } from "@/lib/validations/campaigns";
import { createProductSchema } from "@/lib/validations/products";
import type { Database } from "@/types/database";

export type CloseCampaignResult =
  | { status: "success"; summary: Record<string, unknown> }
  | { status: "error"; message: string };

export type AdminFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, message: "Tenés que iniciar sesión." };
  }
  const { data: isAdmin } = await supabase.rpc("has_role", {
    check_user_id: user.id,
    check_role: "admin",
  });
  if (!isAdmin) {
    return { ok: false as const, message: "Acción solo para admins." };
  }
  return { ok: true as const, user, supabase };
}

// Parsea los pricing tiers que vienen como campos repetidos en el FormData.
// Convención: tier-min-N, tier-max-N, tier-price-N (N = 0..k).
function parsePricingTiersFromFormData(formData: FormData) {
  const tiers: {
    min_quantity: string;
    max_quantity: string;
    unit_price_cents_usd: string;
    tier_number: number;
  }[] = [];

  let i = 0;
  while (formData.has(`tier-min-${i}`)) {
    tiers.push({
      tier_number: i + 1,
      min_quantity: String(formData.get(`tier-min-${i}`) ?? ""),
      max_quantity: String(formData.get(`tier-max-${i}`) ?? ""),
      unit_price_cents_usd: String(formData.get(`tier-price-${i}`) ?? ""),
    });
    i++;
  }
  return tiers;
}

export async function createCampaignAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  const rawTiers = parsePricingTiersFromFormData(formData);

  const parsed = createCampaignSchema.safeParse({
    product_id: formData.get("product_id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    hero_image_url: formData.get("hero_image_url"),
    moq: formData.get("moq"),
    max_quantity: formData.get("max_quantity"),
    deposit_percentage: formData.get("deposit_percentage"),
    closes_at: formData.get("closes_at"),
    estimated_arrival_at: formData.get("estimated_arrival_at"),
    return_policy: formData.get("return_policy"),
    pricing_tiers: rawTiers,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Insertar campaña
  type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
  const newCampaign: CampaignInsert = {
    product_id: parsed.data.product_id,
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    hero_image_url: parsed.data.hero_image_url ?? null,
    moq: parsed.data.moq,
    max_quantity: parsed.data.max_quantity,
    deposit_percentage: parsed.data.deposit_percentage,
    closes_at: new Date(parsed.data.closes_at).toISOString(),
    estimated_arrival_at: parsed.data.estimated_arrival_at ?? null,
    return_policy: parsed.data.return_policy ?? null,
    status: "borrador",
    created_by: auth.user.id,
  };

  const { data: campaign, error } = await auth.supabase
    .from("campaigns")
    .insert(newCampaign as never)
    .select("id, slug")
    .single()
    .returns<{ id: string; slug: string }>();

  if (error || !campaign) {
    console.error("Error creando campaña:", error);
    return {
      status: "error",
      message:
        error?.code === "23505"
          ? "Ya existe una campaña con ese slug. Cambiá el slug."
          : "No pudimos crear la campaña. Revisá los datos e intentá de nuevo.",
    };
  }

  // Insertar pricing tiers
  type TierInsert =
    Database["public"]["Tables"]["campaign_pricing_tiers"]["Insert"];
  const tiersToInsert: TierInsert[] = parsed.data.pricing_tiers.map(
    (tier, idx) => ({
      campaign_id: campaign.id,
      tier_number: idx + 1,
      min_quantity: tier.min_quantity,
      max_quantity: tier.max_quantity,
      unit_price_cents_usd: tier.unit_price_cents_usd,
    }),
  );

  const { error: tierErr } = await auth.supabase
    .from("campaign_pricing_tiers")
    .insert(tiersToInsert as never);

  if (tierErr) {
    console.error("Error creando tiers:", tierErr);
    return {
      status: "error",
      message: "La campaña se creó pero falló al guardar los escalones de precio.",
    };
  }

  // Log de auditoría
  await auth.supabase.from("admin_actions_log").insert({
    admin_id: auth.user.id,
    action: "create_campaign",
    entity_type: "campaign",
    entity_id: campaign.id,
    after_state: { slug: campaign.slug, title: parsed.data.title } as never,
  } as never);

  revalidatePath("/admin/campanas");
  revalidatePath("/campanas");
  redirect(`/admin/campanas`);
}

// ---------------------------------------------------------------------------
// createProductAction — crea un producto desde el panel admin.
// ---------------------------------------------------------------------------

export async function createProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    long_description: formData.get("long_description"),
    category_id: formData.get("category_id"),
    brand: formData.get("brand"),
    main_image_url: formData.get("main_image_url"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
  const newProduct: ProductInsert = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    short_description: parsed.data.short_description ?? null,
    long_description: parsed.data.long_description ?? null,
    category_id: parsed.data.category_id ?? null,
    brand: parsed.data.brand ?? null,
    main_image_url: parsed.data.main_image_url ?? null,
  };

  const { data, error } = await auth.supabase
    .from("products")
    .insert(newProduct as never)
    .select("id")
    .single()
    .returns<{ id: string }>();

  if (error || !data) {
    return {
      status: "error",
      message:
        error?.code === "23505"
          ? "Ya existe un producto con ese slug."
          : "No pudimos crear el producto.",
    };
  }

  await auth.supabase.from("admin_actions_log").insert({
    admin_id: auth.user.id,
    action: "create_product",
    entity_type: "product",
    entity_id: data.id,
    after_state: { slug: parsed.data.slug, name: parsed.data.name } as never,
  } as never);

  revalidatePath("/admin/productos");
  revalidatePath("/campanas");
  redirect("/admin/productos");
}

// ---------------------------------------------------------------------------
// updateSettingsAction — actualiza valores de la tabla `settings`.
// ---------------------------------------------------------------------------

export async function updateSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  // Esperamos pares: key-N, type-N, value-N
  const entries: { key: string; type: string; value: string }[] = [];
  let i = 0;
  while (formData.has(`key-${i}`)) {
    entries.push({
      key: String(formData.get(`key-${i}`)),
      type: String(formData.get(`type-${i}`)),
      value: String(formData.get(`value-${i}`) ?? ""),
    });
    i++;
  }

  for (const entry of entries) {
    let jsonValue: unknown;
    if (entry.type === "number") {
      const n = Number(entry.value);
      if (Number.isNaN(n)) {
        return {
          status: "error",
          message: `El valor de "${entry.key}" no es un número válido.`,
        };
      }
      jsonValue = n;
    } else if (entry.type === "boolean") {
      jsonValue = entry.value === "true" || entry.value === "on";
    } else {
      jsonValue = entry.value;
    }

    type SettingUpdate = Database["public"]["Tables"]["settings"]["Update"];
    const update: SettingUpdate = {
      value: jsonValue as never,
      updated_by: auth.user.id,
    };

    const { error } = await auth.supabase
      .from("settings")
      .update(update as never)
      .eq("key", entry.key);

    if (error) {
      return {
        status: "error",
        message: `Error guardando "${entry.key}": ${error.message}`,
      };
    }
  }

  await auth.supabase.from("admin_actions_log").insert({
    admin_id: auth.user.id,
    action: "update_settings",
    entity_type: "settings",
    after_state: entries as never,
  } as never);

  revalidatePath("/admin/configuracion");
  return { status: "idle" };
}

// ---------------------------------------------------------------------------
// toggleUserRoleAction — asigna o quita un rol a un usuario.
// ---------------------------------------------------------------------------

export async function toggleUserRoleAction(
  targetUserId: string,
  role: Database["public"]["Enums"]["user_role"],
  enable: boolean,
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  // Evitar quitarse el rol admin a uno mismo (deja al sistema sin admin).
  if (
    !enable &&
    role === "admin" &&
    targetUserId === auth.user.id
  ) {
    return {
      status: "error",
      message: "No podés quitarte el rol admin a vos mismo.",
    };
  }

  if (enable) {
    type RoleInsert = Database["public"]["Tables"]["user_roles"]["Insert"];
    const insert: RoleInsert = {
      user_id: targetUserId,
      role,
      assigned_by: auth.user.id,
      active: true,
    };
    const { error } = await auth.supabase
      .from("user_roles")
      .upsert(insert as never, { onConflict: "user_id,role" });
    if (error) {
      return { status: "error", message: error.message };
    }
  } else {
    const { error } = await auth.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role", role);
    if (error) {
      return { status: "error", message: error.message };
    }
  }

  await auth.supabase.from("admin_actions_log").insert({
    admin_id: auth.user.id,
    action: enable ? "assign_role" : "remove_role",
    entity_type: "user",
    entity_id: targetUserId,
    after_state: { role } as never,
  } as never);

  revalidatePath("/admin/usuarios");
  return { status: "success" };
}

// ---------------------------------------------------------------------------
// createCampaignStatusUpdateAction — publica una actualización a una campaña.
// Estas updates las ve el usuario en el detalle público.
// ---------------------------------------------------------------------------

export async function createCampaignStatusUpdateAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  const campaignId = String(formData.get("campaign_id") ?? "");
  const type = String(
    formData.get("type") ?? "mensaje_general",
  ) as Database["public"]["Enums"]["campaign_update_type"];
  const description = String(formData.get("description") ?? "").trim();
  const photoUrl = String(formData.get("photo_url") ?? "").trim() || null;
  const visible = formData.get("visible_to_users") !== null;

  if (!campaignId) {
    return { status: "error", message: "Campaña inválida." };
  }
  if (description.length < 5) {
    return {
      status: "error",
      fieldErrors: { description: ["Texto demasiado corto"] },
    };
  }

  type UpdateInsert =
    Database["public"]["Tables"]["campaign_status_updates"]["Insert"];
  const insert: UpdateInsert = {
    campaign_id: campaignId,
    type,
    description,
    photo_url: photoUrl,
    visible_to_users: visible,
    created_by: auth.user.id,
  };

  const { error } = await auth.supabase
    .from("campaign_status_updates")
    .insert(insert as never);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath(`/admin/campanas/${campaignId}`);
  // Buscar slug para revalidar la pública.
  const { data: c } = await auth.supabase
    .from("campaigns")
    .select("slug")
    .eq("id", campaignId)
    .maybeSingle()
    .returns<{ slug: string } | null>();
  if (c) {
    revalidatePath(`/campanas/${c.slug}`);
  }

  return { status: "idle" };
}

// Cambia status de campaña: borrador -> activa, o cancela.
export async function updateCampaignStatusAction(
  campaignId: string,
  newStatus: Database["public"]["Enums"]["campaign_status"],
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const auth = await assertAdmin();
  if (!auth.ok) {
    return { status: "error", message: auth.message };
  }

  type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];
  const update: CampaignUpdate = { status: newStatus };

  const { error } = await auth.supabase
    .from("campaigns")
    .update(update as never)
    .eq("id", campaignId);

  if (error) {
    return { status: "error", message: error.message };
  }

  await auth.supabase.from("admin_actions_log").insert({
    admin_id: auth.user.id,
    action: "update_campaign_status",
    entity_type: "campaign",
    entity_id: campaignId,
    after_state: { status: newStatus } as never,
  } as never);

  revalidatePath("/admin/campanas");
  revalidatePath("/campanas");
  return { status: "success" };
}

// Cierra una campaña invocando la función SQL `close_campaign`.
// La función chequea internamente que el caller tenga rol admin.
export async function closeCampaignAction(
  campaignId: string,
): Promise<CloseCampaignResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("close_campaign", {
    p_campaign_id: campaignId,
  });

  if (error) {
    console.error("Error cerrando campaña:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/campanas");
  revalidatePath("/campanas");

  return {
    status: "success",
    summary: (data ?? {}) as Record<string, unknown>,
  };
}

// ----------------------------------------------------------------------------
// extendCampaignAction — extiende el cierre de una campaña (regla §5.4)
// Validaciones reales (>=85% MOQ, <7 días, una vez) viven en la rpc SQL.
// ----------------------------------------------------------------------------

export type ExtendCampaignResult =
  | { status: "success"; message: string; newClosesAt: string }
  | { status: "error"; message: string };

export async function extendCampaignAction(
  campaignId: string,
  newClosesAt: string,
): Promise<ExtendCampaignResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { status: "error", message: guard.message };

  const { data, error } = await guard.supabase.rpc("extend_campaign", {
    p_campaign_id: campaignId,
    p_new_closes_at: newClosesAt,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "No pudimos extender la campaña.",
    };
  }

  revalidatePath("/admin/campanas");
  revalidatePath(`/admin/campanas/${campaignId}`);
  revalidatePath("/campanas");

  const result = (data as { new_closes_at?: string }) || {};
  return {
    status: "success",
    message: "Extendiste la campaña y notificamos a los participantes.",
    newClosesAt: result.new_closes_at ?? newClosesAt,
  };
}

// ----------------------------------------------------------------------------
// reviewVerificationAction — admin aprueba/rechaza un user_verifications.
// ----------------------------------------------------------------------------

export async function reviewVerificationAction(
  verificationId: string,
  decision: "aprobado" | "rechazado",
  rejectionReason?: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  const guard = await assertAdmin();
  if (!guard.ok) return { status: "error", message: guard.message };

  type Update = Database["public"]["Tables"]["user_verifications"]["Update"];
  const update: Update = {
    status: decision,
    reviewed_by: guard.user.id,
    reviewed_at: new Date().toISOString(),
    rejection_reason: decision === "rechazado" ? (rejectionReason ?? null) : null,
  };

  const { error } = await guard.supabase
    .from("user_verifications")
    .update(update as never)
    .eq("id", verificationId);

  if (error) {
    return { status: "error", message: error.message };
  }

  await guard.supabase.from("admin_actions_log").insert({
    admin_id: guard.user.id,
    action: "review_verification",
    entity_type: "user_verification",
    entity_id: verificationId,
    after_state: { decision, rejection_reason: rejectionReason ?? null },
  } as never);

  revalidatePath("/admin/verificaciones");
  return { status: "success" };
}

// ----------------------------------------------------------------------------
// resolveClaimAction — admin resuelve un reclamo (a favor de uno u otro).
// ----------------------------------------------------------------------------

export async function resolveClaimAction(
  claimId: string,
  decision:
    | "resuelto_a_favor_usuario"
    | "resuelto_a_favor_vendedor"
    | "cerrado",
  notes?: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  const guard = await assertAdmin();
  if (!guard.ok) return { status: "error", message: guard.message };

  type Update = Database["public"]["Tables"]["claims"]["Update"];
  const update: Update = {
    status: decision,
    resolution: notes ?? null,
    resolution_notes: notes ?? null,
    resolved_at: new Date().toISOString(),
  };

  const { error } = await guard.supabase
    .from("claims")
    .update(update as never)
    .eq("id", claimId);

  if (error) return { status: "error", message: error.message };

  await guard.supabase.from("admin_actions_log").insert({
    admin_id: guard.user.id,
    action: "resolve_claim",
    entity_type: "claim",
    entity_id: claimId,
    after_state: { decision },
  } as never);

  revalidatePath("/admin/reclamos");
  revalidatePath("/perfil/reclamos");
  return { status: "success" };
}

// ----------------------------------------------------------------------------
// processSellerPayoutsAction — corre la rpc mensual (regla §5.7)
// ----------------------------------------------------------------------------

export async function processSellerPayoutsAction(): Promise<{
  status: "success" | "error";
  message: string;
}> {
  const guard = await assertAdmin();
  if (!guard.ok) return { status: "error", message: guard.message };

  const { data, error } = await guard.supabase.rpc(
    "process_monthly_seller_payouts",
    {},
  );

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/comisiones");
  const result = (data as { payouts_created?: number; total_cents?: number }) || {};
  return {
    status: "success",
    message: `Creamos ${result.payouts_created ?? 0} payouts por USD ${(
      (result.total_cents ?? 0) / 100
    ).toFixed(2)}.`,
  };
}

// ----------------------------------------------------------------------------
// markPayoutPaidAction — admin marca un payout como pagado.
// ----------------------------------------------------------------------------

export async function markPayoutPaidAction(
  payoutId: string,
  proofUrl?: string,
): Promise<{ status: "success" | "error"; message?: string }> {
  const guard = await assertAdmin();
  if (!guard.ok) return { status: "error", message: guard.message };

  type Update = Database["public"]["Tables"]["commission_payouts"]["Update"];
  const update: Update = {
    status: "pagado",
    paid_at: new Date().toISOString(),
    proof_url: proofUrl ?? null,
  };

  const { error } = await guard.supabase
    .from("commission_payouts")
    .update(update as never)
    .eq("id", payoutId);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/comisiones");
  return { status: "success" };
}
