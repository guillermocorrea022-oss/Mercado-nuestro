"use client";

import { useFormStatus } from "react-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  className?: string;
}

// Botón de submit que se deshabilita y muestra texto distinto mientras
// la Server Action está en vuelo.
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
        buttonVariants({ size: "lg" }),
        "h-11 w-full text-base",
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
    <p className="mt-1.5 text-xs text-destructive" role="alert">
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
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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
      className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
    >
      {message}
    </div>
  );
}
