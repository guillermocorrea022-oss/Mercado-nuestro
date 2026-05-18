import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

function verifyAuth(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("authorization");
  return got === `Bearer ${expected}`;
}

// Cron: libera escrow del marketplace de órdenes despachadas hace 3+ días
// (regla §5.6). Idealmente corre cada hora.
async function run(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "auto_release_marketplace_escrow",
  );
  if (error) {
    console.error("[cron:release-escrow]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, released: data });
}

export const GET = run;
export const POST = run;
