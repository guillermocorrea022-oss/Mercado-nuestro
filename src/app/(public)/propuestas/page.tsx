import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb, Users } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Propuestas de la comunidad",
};

export const revalidate = 60;

type ProposalRow = {
  id: string;
  title: string;
  description: string | null;
  reference_url: string | null;
  status: Database["public"]["Enums"]["proposal_status"];
  created_at: string;
};

export default async function PropuestasPage() {
  const supabase = await createClient();

  const { data: proposals } = await supabase
    .from("product_proposals")
    .select("id, title, description, reference_url, status, created_at")
    .in("status", ["abierta", "en_revision", "aprobada"])
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<ProposalRow[]>();

  const list = proposals ?? [];

  // Sumar interesados por propuesta.
  const ids = list.map((p) => p.id);
  type InterestRow = { proposal_id: string; quantity: number };
  let interestsByProposal = new Map<string, { count: number; quantity: number }>();
  if (ids.length > 0) {
    const { data: interests } = await supabase
      .from("product_proposal_interests")
      .select("proposal_id, quantity")
      .in("proposal_id", ids)
      .returns<InterestRow[]>();
    for (const i of interests ?? []) {
      const prev = interestsByProposal.get(i.proposal_id) ?? {
        count: 0,
        quantity: 0,
      };
      interestsByProposal.set(i.proposal_id, {
        count: prev.count + 1,
        quantity: prev.quantity + i.quantity,
      });
    }
  }

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />
        <Container className="py-20 sm:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              La comunidad decide
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Propuestas de productos
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Estos son productos que la comunidad pidió. Si se suma suficiente
              gente, se convierte en campaña oficial.
            </p>
            <div className="mt-8">
              <Link
                href="/proponer-producto"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-6 text-base shadow-glow",
                )}
              >
                Proponer uno
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {list.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-border bg-card/30 p-16 text-center backdrop-blur">
                <Lightbulb
                  className="mx-auto size-10 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-4 text-lg font-medium">
                  Todavía no hay propuestas
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Sé el primero en pedir lo que querés que importemos.
                </p>
              </div>
            </Reveal>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => {
                const stats = interestsByProposal.get(p.id) ?? {
                  count: 0,
                  quantity: 0,
                };
                return (
                  <li key={p.id}>
                    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        {p.status.replace("_", " ")}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight">
                        {p.title}
                      </h3>
                      {p.description ? (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      ) : null}
                      <div className="mt-6 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Users className="size-3.5" aria-hidden />
                          {stats.count} interesado{stats.count === 1 ? "" : "s"}
                        </span>
                        <span className="font-medium">
                          {stats.quantity} unidades
                        </span>
                      </div>
                      {p.reference_url ? (
                        <a
                          href={p.reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-xs text-primary hover:underline"
                        >
                          Ver referencia →
                        </a>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
