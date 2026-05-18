"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, QrCode, Share2, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  title: string;
  prefilledMessage?: string;
}

export function ShareButton({
  url,
  title,
  prefilledMessage,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const fullUrl =
    typeof window !== "undefined" && !url.startsWith("http")
      ? `${window.location.origin}${url}`
      : url;

  const waMessage =
    prefilledMessage ??
    `Mirá esta campaña en Mercado Nuestro: ${title} → ${fullUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso: el usuario puede seleccionar manualmente.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5",
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Share2 className="size-3.5" aria-hidden />
        Compartir
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-glow">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 text-primary"
                fill="currentColor"
              >
                <path d="M17.5 14.4l-2.4-1.2a.7.7 0 00-.8.1l-.9 1c-1.6-.8-2.8-2-3.6-3.6l1-.9a.7.7 0 00.1-.8L9.6 6.5a.7.7 0 00-.8-.4l-2 .5a.7.7 0 00-.6.7c0 5.6 4.5 10.1 10.1 10.1.4 0 .7-.3.7-.6l.5-2a.7.7 0 00-.4-.8z" />
                <path d="M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm0 1.7a8.3 8.3 0 11-4.3 15.4l-.3-.2-2.9.8.8-2.9-.2-.3A8.3 8.3 0 0112 3.7z" />
              </svg>
              Enviar por WhatsApp
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              {copied ? (
                <Check className="size-4 text-primary" aria-hidden />
              ) : (
                <Copy className="size-4 text-primary" aria-hidden />
              )}
              {copied ? "Copiado al portapapeles" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <QrCode className="size-4 text-primary" aria-hidden />
              Ver código QR
            </button>
          </div>
        </>
      ) : null}

      {showQr ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setShowQr(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQr(false)}
              aria-label="Cerrar"
              className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" aria-hidden />
            </button>
            <h2 className="text-base font-semibold tracking-tight">
              Escaneá para abrir
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{fullUrl}</p>
            <div className="mt-6 flex items-center justify-center rounded-2xl bg-white p-4">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  fullUrl,
                )}`}
                alt="QR de la campaña"
                width={240}
                height={240}
                unoptimized
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
