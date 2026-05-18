import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

// Cron: cierra campañas vencidas (regla §5.4). Vercel Cron envía
// `Authorization: Bearer <CRON_SECRET>` configurado en variable de entorno.
function verifyAuth(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("authorization");
  return got === `Bearer ${expected}`;
}

async function run(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("auto_close_expired_campaigns");
  if (error) {
    console.error("[cron:close-expired]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, result: data });
}

export const GET = run;
export const POST = run;
