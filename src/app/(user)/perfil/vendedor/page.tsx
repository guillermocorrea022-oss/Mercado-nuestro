import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleDollarSign,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";

import { ActivateSellerForm } from "@/components/vendedor/ActivateSellerForm";
import { ShareButton } from "@/components/campanas/ShareButton";
import { Container } from "@/components/layout/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUsdFromCents } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Programa de vendedores",
};

type SellerProfileRow =
  Database["public"]["Tables"]["seller_profiles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function VendedorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<SellerProfileRow | null>();

  if (!seller) {
    // Onboarding: no es vendedor todavía.
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle()
      .returns<Pick<ProfileRow, "first_name" | "last_name"> | null>();
    const defaultName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "";

    return (
      <Container className="py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Volver a Mi cuenta
          </Link>

          <div className="mt-6 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Convertite en vendedora/or por catálogo
          </h1>
          <p className="mt-3 text-muted-foreground">
            Compartís tu link, vendés desde tu celular y ganás comisión por
            cada venta. Sin tener stock propio, sin inversión inicial.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex gap-3">
              <Megaphone
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                Tu link único:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">
                  mercadonuestro.uy/v/tu-alias
                </code>
              </span>
            </li>
            <li className="flex gap-3">
              <CircleDollarSign
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                Comisión base entre 8% y 15% según categoría, con bonus por
                volumen mensual.
              </span>
            </li>
            <li className="flex gap-3">
              <Users
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                Atribución por cookie de 30 días: si alguien compra después
                de visitar tu link, la venta es tuya.
              </span>
            </li>
          </ul>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Activar mi catálogo</CardTitle>
              <CardDescription>
                Aprobación automática. En el MVP no requiere verificación
                manual. Para cobrar comisiones después vamos a pedirte cédula.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivateSellerForm defaultName={defaultName} />
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  // Vendedor ya activo — dashboard.
  const { data: sales } = await supabase
    .from("catalog_sales")
    .select("commission_cents_usd, status, consolidated_at")
    .eq("seller_id", user.id);

  const totalPending =
    (sales ?? [])
      .filter((s) => s.status === "pendiente")
      .reduce((acc, s) => acc + s.commission_cents_usd, 0);
  const totalConsolidated =
    (sales ?? [])
      .filter((s) => s.status === "consolidada")
      .reduce((acc, s) => acc + s.commission_cents_usd, 0);
  const totalPaid =
    (sales ?? [])
      .filter((s) => s.status === "pagada")
      .reduce((acc, s) => acc + s.commission_cents_usd, 0);

  const catalogUrl = `/v/${seller.slug}`;

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a Mi cuenta
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Vendedor por catálogo
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {seller.display_name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu link:{" "}
              <Link
                href={catalogUrl}
                className="font-medium text-foreground hover:underline"
              >
                mercadonuestro.uy/v/{seller.slug}
              </Link>
            </p>
          </div>
          <ShareButton
            url={catalogUrl}
            title={`${seller.display_name} en Mercado Nuestro`}
            prefilledMessage={`Mirá los productos que estoy vendiendo en Mercado Nuestro: `}
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider">
                Comisión pendiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {formatUsdFromCents(totalPending)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Esperando que se confirme la entrega
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider">
                Disponible para retirar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight text-primary">
                {formatUsdFromCents(totalConsolidated)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Retiro mínimo USD 20
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wider">
                Pagado historicamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {formatUsdFromCents(totalPaid)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {sales?.length ?? 0} ventas en total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="text-base">Tu catálogo público</CardTitle>
            <CardDescription>
              Esto es lo que ven las personas que entran por tu link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={catalogUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Abrir mi catálogo en una pestaña nueva
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
