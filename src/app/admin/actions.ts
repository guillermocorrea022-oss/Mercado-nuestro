"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CloseCampaignResult =
  | { status: "success"; summary: Record<string, unknown> }
  | { status: "error"; message: string };

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
