"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
}

// Botón de submit branded Mercado Nuestro. Azul oscuro con hover más oscuro,
// alto generoso (h-12) y radius full para feel friendly. Pending state
// muestra spinner-like con texto distinto.
export function SubmitButton({
  label,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-blue px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-blue-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? (pendingLabel ?? "Procesando...") : label}
    </button>
  );
}

interface FieldErrorProps {
  errors?: string[];
}

export function FieldError({ errors }: FieldErrorProps) {
  if (!errors || errors.length === 0) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
      {errors[0]}
    </p>
  );
}

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {message}
    </div>
  );
}

interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {message}
    </div>
  );
}
