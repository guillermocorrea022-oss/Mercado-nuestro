import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut, Megaphone, Package, Settings } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campanas", label: "Campañas", icon: Megaphone },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

// Layout del panel administrativo. Verifica que el usuario tenga rol 'admin';
// si no, redirige a /perfil. Renderiza sidebar con navegación interna +
// área de contenido.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  // Verificar rol admin via función SQL (SECURITY DEFINER, ignora RLS).
  const { data: isAdmin } = await supabase.rpc("has_role", {
    check_user_id: user.id,
    check_role: "admin",
  });

  if (!isAdmin) {
    redirect("/perfil");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 p-6 lg:flex lg:flex-col">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
        >
          <span aria-hidden className="size-2.5 rounded-full bg-primary" />
          <span>
            Mercado <span className="text-muted-foreground">Nuestro</span>
          </span>
        </Link>
        <div className="mt-1 text-xs uppercase tracking-wider text-primary">
          Admin
        </div>

        <nav className="mt-10 flex flex-col gap-1" aria-label="Navegación admin">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Volver al sitio
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-1.5",
              )}
            >
              <LogOut className="size-4" aria-hidden />
              Salir
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
