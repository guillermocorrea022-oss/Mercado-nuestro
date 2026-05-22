import { fixMojibake } from "@/lib/encoding";
import { createClient } from "@/lib/supabase/server";

import { UnifiedHeader, type CategoryNode } from "./UnifiedHeader";

// Server Component: lee auth + categorías una vez por carga de layout y los
// pasa al UnifiedHeader (Client Component). El client usa usePathname() para
// saber en qué página está y decide qué variante de header mostrar.

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
};

// Convierte el listado plano en árbol: roots con sus hijos (recursivo).
function buildCategoryTree(rows: CategoryRow[]): CategoryNode[] {
  const byParent = new Map<string | null, CategoryRow[]>();
  for (const row of rows) {
    const key = row.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }

  function build(parentId: string | null): CategoryNode[] {
    const children = byParent.get(parentId) ?? [];
    return children.map((c) => ({
      id: c.id,
      slug: c.slug,
      // Arregla acentos que quedaron mal codificados al insertar los seeds
      // ("ElectrÃ³nica" → "Electrónica"). Mientras no se corrijan en DB.
      name: fixMojibake(c.name),
      children: build(c.id),
    }));
  }

  return build(null);
}

export async function Header() {
  const supabase = await createClient();

  const [userRes, categoriesRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("categories")
      .select("id, slug, name, parent_id")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .returns<CategoryRow[]>(),
  ]);

  const user = userRes.data.user;
  const categoryTree = buildCategoryTree(categoriesRes.data ?? []);

  let unread = 0;
  let canPublish = false;
  let userName: string | null = null;

  if (user) {
    const [notifRes, adminRes, profileRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null),
      supabase.rpc("has_role", { check_user_id: user.id, check_role: "admin" }),
      supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle()
        .returns<{ first_name: string | null } | null>(),
    ]);
    unread = notifRes.count ?? 0;
    canPublish = adminRes.data === true;
    userName =
      profileRes.data?.first_name ??
      user.email?.split("@")[0] ??
      null;
  }

  return (
    <UnifiedHeader
      userId={user?.id ?? null}
      userName={userName}
      unread={unread}
      canPublish={canPublish}
      categories={categoryTree}
    />
  );
}
