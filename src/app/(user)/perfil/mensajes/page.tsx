import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mis mensajes",
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  sent_at: string;
  read_at: string | null;
};

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Mensajes donde participo (como sender o recipient).
  const { data: messages } = await supabase
    .from("marketplace_messages")
    .select("id, conversation_id, sender_id, recipient_id, body, sent_at, read_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("sent_at", { ascending: false })
    .returns<MessageRow[]>();

  // Agrupar por conversation_id quedándose con el más reciente.
  const conversations = new Map<string, MessageRow>();
  for (const m of messages ?? []) {
    if (!conversations.has(m.conversation_id)) {
      conversations.set(m.conversation_id, m);
    }
  }
  const list = Array.from(conversations.values());

  // Traer info de los listings para mostrar el título del producto.
  const ids = list.map((m) => m.conversation_id);
  type ListingInfo = {
    id: string;
    product: { name: string } | { name: string }[] | null;
  };
  let listingsByConv = new Map<string, ListingInfo>();
  if (ids.length > 0) {
    const { data: listings } = await supabase
      .from("marketplace_listings")
      .select("id, product:products(name)")
      .in("id", ids)
      .returns<ListingInfo[]>();
    for (const l of listings ?? []) listingsByConv.set(l.id, l);
  }

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

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mensajes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Conversaciones con compradores y vendedores del marketplace.
        </p>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <MessageSquare
              className="mx-auto size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 font-medium">No hay conversaciones todavía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Empezá una desde cualquier publicación del marketplace.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {list.map((m) => {
              const listing = listingsByConv.get(m.conversation_id);
              const product = listing
                ? Array.isArray(listing.product)
                  ? listing.product[0]
                  : listing.product
                : null;
              const isMine = m.sender_id === user.id;
              const unread =
                !isMine && m.read_at === null;
              return (
                <li key={m.id}>
                  <Link
                    href={`/perfil/mensajes/${m.conversation_id}`}
                    className={`block rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30 ${
                      unread ? "border-primary/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {product?.name ?? "Publicación"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.sent_at).toLocaleDateString("es-UY", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                      {isMine ? "Vos: " : ""}
                      {m.body}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
