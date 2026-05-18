import type { Metadata } from "next";

import { UserRoleToggle } from "@/components/admin/UserRoleToggle";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Usuarios · Admin",
};

const ROLES: Database["public"]["Enums"]["user_role"][] = [
  "comprador",
  "vendedor_catalogo",
  "revendedor",
  "importador_avanzado",
  "admin",
];

type ProfileRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: Database["public"]["Enums"]["user_status"];
  created_at: string;
};

type UserRoleRow = {
  user_id: string;
  role: Database["public"]["Enums"]["user_role"];
  active: boolean;
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<ProfileRow[]>(),
    supabase
      .from("user_roles")
      .select("user_id, role, active")
      .eq("active", true)
      .returns<UserRoleRow[]>(),
  ]);

  const rolesByUser = new Map<string, Set<string>>();
  for (const r of roles ?? []) {
    if (!rolesByUser.has(r.user_id)) rolesByUser.set(r.user_id, new Set());
    rolesByUser.get(r.user_id)!.add(r.role);
  }

  const list = profiles ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Usuarios
      </h1>
      <p className="mt-2 text-muted-foreground">
        Últimos 200 usuarios registrados. Click en un rol para asignar o quitar.
      </p>

      {list.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="text-base font-medium">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((p) => {
                const userRoles = rolesByUser.get(p.id) ?? new Set();
                const name =
                  [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                  "Sin nombre";
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        Registrado{" "}
                        {new Date(p.created_at).toLocaleDateString("es-UY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {p.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map((role) => (
                          <UserRoleToggle
                            key={role}
                            userId={p.id}
                            role={role}
                            active={userRoles.has(role)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
