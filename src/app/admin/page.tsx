import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Megaphone,
  Package,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard admin",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Conteos básicos. Como el admin tiene service-role-like via rpc no es
  // necesario, pero las RLS lo permiten para roles admin via has_role en
  // policies futuras. Por ahora hacemos consultas simples count.
  const [
    { count: activeCampaigns },
    { count: totalReservations },
    { count: totalUsers },
    { count: totalProducts },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "activa"),
    supabase
      .from("campaign_reservations")
      .select("*", { count: "exact", head: true })
      .neq("status", "cancelada"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Campañas activas",
      value: activeCampaigns ?? 0,
      icon: Megaphone,
      href: "/admin/campanas",
    },
    {
      label: "Reservas vigentes",
      value: totalReservations ?? 0,
      icon: CalendarClock,
      href: "/admin/campanas",
    },
    {
      label: "Usuarios",
      value: totalUsers ?? 0,
      icon: Users,
      href: "/admin",
    },
    {
      label: "Productos",
      value: totalProducts ?? 0,
      icon: Package,
      href: "/admin/productos",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Vista general del estado de Mercado Nuestro.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="size-5 text-primary" aria-hidden />
              <ArrowRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-base">Próximos pasos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>
              · Revisar las{" "}
              <Link
                href="/admin/campanas"
                className="font-medium text-primary hover:underline"
              >
                campañas activas
              </Link>{" "}
              y cerrar las que llegaron al cierre programado.
            </li>
            <li>
              · Configurar Mercado Pago en{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>
              .
            </li>
            <li>
              · Cargar las API keys de Resend para los emails transaccionales.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
