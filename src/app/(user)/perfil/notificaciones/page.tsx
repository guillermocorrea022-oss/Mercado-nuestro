import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";

import { markAllNotificationsReadAction } from "./actions";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Notificaciones",
};

type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(100)
    .returns<NotificationRow[]>();

  const list = notifications ?? [];
  const unreadCount = list.filter((n) => n.read_at === null).length;

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Notificaciones
            </h1>
            <p className="mt-2 text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : "Todas leídas. Te avisamos cuando haya novedades."}
            </p>
          </div>
          {unreadCount > 0 ? (
            <form
              action={async () => {
                "use server";
                await markAllNotificationsReadAction();
              }}
            >
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5",
                )}
              >
                <CheckCheck className="size-3.5" aria-hidden />
                Marcar todas como leídas
              </button>
            </form>
          ) : null}
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <Bell
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 font-medium">Sin notificaciones todavía.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Te vamos a avisar acá cuando una reserva cambie de estado o una
              campaña avance.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {list.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  n.read_at === null
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <Bell
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      n.read_at === null
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {new Date(n.sent_at).toLocaleString("es-UY", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
