import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MessageComposer } from "@/components/marketplace/MessageComposer";
import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Conversación",
};

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  sent_at: string;
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Resolver el listing (id == conversation_id).
  const { data: listing } = await supabase
    .from("marketplace_listings")
    .select(
      "id, seller_id, product:products(name, main_image_url, slug)",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<{
      id: string;
      seller_id: string;
      product:
        | { name: string; main_image_url: string | null; slug: string }
        | { name: string; main_image_url: string | null; slug: string }[]
        | null;
    } | null>();

  if (!listing) notFound();

  const { data: messages } = await supabase
    .from("marketplace_messages")
    .select("id, sender_id, body, sent_at")
    .eq("conversation_id", id)
    .order("sent_at", { ascending: true })
    .returns<MessageRow[]>();

  const list = messages ?? [];
  // Solo participantes pueden ver. Si el user no participó, esconder.
  const isParticipant =
    user.id === listing.seller_id ||
    list.some((m) => m.sender_id === user.id);
  if (!isParticipant && list.length === 0) {
    notFound();
  }

  const product = Array.isArray(listing.product)
    ? listing.product[0]
    : listing.product;

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/perfil/mensajes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Todos los mensajes
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Conversación sobre
          </p>
          {product ? (
            <Link
              href={`/marketplace/${listing.id}`}
              className="mt-1 text-lg font-semibold tracking-tight hover:text-primary"
            >
              {product.name}
            </Link>
          ) : null}
        </div>

        <ul className="mt-6 space-y-3">
          {list.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground">
              Todavía no hay mensajes. Empezá la conversación abajo.
            </li>
          ) : (
            list.map((m) => {
              const isMine = m.sender_id === user.id;
              return (
                <li
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    isMine
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-card border border-border",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      isMine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {new Date(m.sent_at).toLocaleString("es-UY", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              );
            })
          )}
        </ul>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <MessageComposer listingId={listing.id} />
        </div>
      </div>
    </Container>
  );
}
