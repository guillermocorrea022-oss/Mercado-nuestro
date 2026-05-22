import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { IconMN } from "@/components/ui/IconMN";
import { createClient } from "@/lib/supabase/server";
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
      {/* Hero estilo home: orb blur + eyebrow pill + headline gigante uppercase */}
      <section className="relative isolate overflow-hidden bg-background">
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 size-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 right-0 -z-10 size-[400px] rounded-full bg-yellow/10 blur-3xl"
        />
        <AppContainer className="py-16 sm:py-24">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                La comunidad decide
              </span>
            </p>
            <h1 className="mt-6 font-extrabold uppercase leading-[0.95] tracking-tight text-[clamp(2.5rem,6vw,5rem)]">
              Propuestas de <span className="text-highlight">productos</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Estos son productos que la comunidad pidió. Si se suma suficiente
              gente, se convierte en campaña oficial.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/app/propuestas/nueva"
                className="inline-flex items-center gap-2 rounded-full bg-blue px-8 py-4 text-sm font-bold uppercase tracking-wider text-blue-foreground transition-transform hover:-translate-y-0.5"
              >
                Proponer producto
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </AppContainer>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <AppContainer>
          {list.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary">
                  <IconMN name="oferta" variant="blanco" size={36} alt="" />
                </div>
                <p className="mt-6 text-xl font-extrabold uppercase tracking-tight">
                  Todavía no hay propuestas
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Sé el primero en pedir lo que querés que importemos.
                </p>
                <Link
                  href="/app/propuestas/nueva"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 text-sm font-bold uppercase tracking-wider text-blue-foreground transition-transform hover:-translate-y-0.5"
                >
                  Proponer producto
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => {
                const stats = interestsByProposal.get(p.id) ?? {
                  count: 0,
                  quantity: 0,
                };
                return (
                  <StaggerItem key={p.id}>
                    <article className="hover-lift flex h-full flex-col rounded-3xl border border-border bg-card p-6 sm:p-7">
                      <p className="inline-flex w-fit items-center rounded-full bg-yellow px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-yellow-foreground">
                        {p.status.replace("_", " ")}
                      </p>
                      <h3 className="mt-4 text-lg font-extrabold uppercase tracking-tight">
                        {p.title}
                      </h3>
                      {p.description ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {p.description}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Users className="size-3.5" aria-hidden />
                          {stats.count} interesado{stats.count === 1 ? "" : "s"}
                        </span>
                        <span className="font-bold text-blue">
                          {stats.quantity} unidades
                        </span>
                      </div>
                      {p.reference_url ? (
                        <a
                          href={p.reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 text-xs font-semibold text-blue hover:underline"
                        >
                          Ver referencia →
                        </a>
                      ) : null}
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </AppContainer>
      </section>
    </>
  );
}
