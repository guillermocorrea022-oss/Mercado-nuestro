import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

function verifyAuth(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("authorization");
  return got === `Bearer ${expected}`;
}

// Cron: procesa payouts de comisiones a vendedores por catálogo
// (regla §5.7 — primeros 5 días hábiles del mes). Idealmente corre
// el día 1 de cada mes a la mañana.
async function run(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "process_monthly_seller_payouts",
    { p_min_amount_cents: 2000 },
  );
  if (error) {
    console.error("[cron:process-payouts]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, result: data });
}

export const GET = run;
export const POST = run;
