"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Form inline en el home — equivalente al "Reservar" del FUN Parque.
// No abre ticket: arma un /registro?ref=home&email=... y manda al user
// directo al alta para que sigan el flujo natural.
export function QuickStartForm() {
  const router = useRouter();
  const [interest, setInterest] = useState("campanas");
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;

    setPending(true);
    const params = new URLSearchParams({
      email,
      ref: "home",
      interest,
    });
    router.push(`/registro?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="qs-name">Nombre y apellido</Label>
          <Input
            id="qs-name"
            name="name"
            required
            placeholder="María Pérez"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="qs-email">Email</Label>
          <Input
            id="qs-email"
            name="email"
            type="email"
            required
            placeholder="hola@ejemplo.uy"
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label>¿Qué te interesa?</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { v: "campanas", label: "Sumarme a campañas" },
            { v: "marketplace", label: "Comprar en marketplace" },
            { v: "vender", label: "Vender por catálogo" },
            { v: "importar", label: "Ser importador" },
          ].map((opt) => (
            <label
              key={opt.v}
              className={cn(
                "cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors",
                interest === opt.v
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="interest"
                value={opt.v}
                checked={interest === opt.v}
                onChange={(e) => setInterest(e.target.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 w-full text-base shadow-glow sm:w-auto sm:self-start",
        )}
      >
        {pending ? "Procesando..." : "Empezar gratis"}
        <ArrowRight className="size-4" aria-hidden />
      </button>

      <p className="text-xs text-muted-foreground">
        Crear cuenta es gratis y no te compromete a nada. Podés mirar todo
        antes de reservar.
      </p>
    </form>
  );
}
