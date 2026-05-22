"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Flame, ShoppingCart } from "lucide-react";

import { AppContainer } from "@/components/layout/AppContainer";

import { AddToCartDialog } from "./AddToCartDialog";

// ─── FlashDeals ───────────────────────────────────────────────────────────────
// Carrusel de ofertas relámpago con countdown timer. Estilo "Ofertas del día"
// de Mercado Libre / Temu. Cada card muestra producto + precio tachado +
// precio actual + % descuento.
//
// El timer cuenta hasta el final del día (00:00 hs del día siguiente). Cada
// card tiene una barra de progreso indicando cuánto stock queda.
//
// NOTA: En MVP recibe datos mock como prop. Cuando esté la BD conectada,
// pasar productos reales con campo `original_price_cents` para calcular
// el descuento.

export type FlashDealItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Precio original (sin descuento), en centavos USD. */
  originalPriceCents: number;
  /** Precio con descuento, en centavos USD. */
  priceCents: number;
  /** Porcentaje de stock vendido (0-100). 100 = agotado. */
  stockProgressPct?: number;
};

interface FlashDealsProps {
  items: FlashDealItem[];
}

export function FlashDeals({ items }: FlashDealsProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>(() => calculateTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      id="imperdibles"
      className="relative scroll-mt-[180px] overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-dark py-12 text-white sm:py-16"
    >
      {/* Decoración: orbe yellow blur en esquina */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand-yellow/15 blur-3xl"
      />

      <AppContainer className="relative">
        {/* Encabezado con timer */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
              <Flame className="size-4" aria-hidden />
              Ofertas del día
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Imperdibles que duran poco
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-white/70">
              Termina en
            </span>
            <CountdownDigits {...timeLeft} />
            <Link
              href="/app/marketplace?sort=ofertas"
              className="hidden whitespace-nowrap rounded-full border border-white/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10 sm:inline-flex"
            >
              Ver todas
              <ArrowUpRight className="ml-1 size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Carrusel horizontal de cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pb-0">
          {items.slice(0, 4).map((item) => (
            <FlashDealCard key={item.id} item={item} />
          ))}
        </div>
      </AppContainer>
    </section>
  );
}

function FlashDealCard({ item }: { item: FlashDealItem }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const discount = Math.round(
    ((item.originalPriceCents - item.priceCents) / item.originalPriceCents) * 100,
  );
  const stock = item.stockProgressPct ?? 0;

  return (
    <>
      <article className="group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-neutral-gray-700 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl lg:w-auto">
        {/* La imagen + título son clickeables → llevan al detalle del producto.
            El botón "Agregar al carrito" es SEPARADO (abre el modal). */}
        <Link
          href={`/app/marketplace/${item.slug}`}
          className="relative block aspect-square overflow-hidden bg-neutral-gray-50"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 260px, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badge descuento */}
          <span className="absolute left-3 top-3 rounded-full bg-brand-yellow px-2.5 py-1 text-xs font-extrabold text-neutral-gray-700">
            {discount}% OFF
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <Link
            href={`/app/marketplace/${item.slug}`}
            className="transition-colors hover:text-brand-blue"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {item.name}
            </h3>
          </Link>

          <div className="mt-auto">
            <p className="text-xs text-neutral-gray-700/50 line-through">
              {formatPrice(item.originalPriceCents)}
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-brand-blue">
              {formatPrice(item.priceCents)}
            </p>
          </div>

          {/* Barra de progreso de stock */}
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-gray-50">
              <div
                className="h-full rounded-full bg-brand-yellow transition-all"
                style={{ width: `${Math.min(stock, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-neutral-gray-700/60">
              {stock >= 90
                ? "¡Últimas unidades!"
                : stock >= 60
                  ? "Se está agotando"
                  : "Stock disponible"}
            </p>
          </div>

          {/* Botón agregar al carrito — abre modal de cantidad */}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark"
          >
            <ShoppingCart className="size-4" aria-hidden />
            Agregar al carrito
          </button>
        </div>
      </article>

      {/* Modal de cantidad — componente reusable */}
      <AddToCartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        item={{
          id: item.id,
          name: item.name,
          image: item.image,
          priceCents: item.priceCents,
        }}
      />
    </>
  );
}

function CountdownDigits({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div className="flex items-center gap-1 font-mono text-sm font-bold">
      <DigitBox value={hours} label="hs" />
      <span className="text-white/40">:</span>
      <DigitBox value={minutes} label="min" />
      <span className="text-white/40">:</span>
      <DigitBox value={seconds} label="seg" />
    </div>
  );
}

function DigitBox({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="inline-flex flex-col items-center rounded-md bg-white/10 px-2 py-1 backdrop-blur"
      aria-label={`${value} ${label}`}
    >
      <span className="text-sm leading-none">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
    </span>
  );
}

function calculateTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
