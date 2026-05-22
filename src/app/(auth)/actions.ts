"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  resetPasswordRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";

import type { FormState } from "./state";

// Origen del request (para construir el redirect del email de confirmación
// y del reset de password). En dev es http://localhost:3000.
async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// ----------------------------------------------------------------------------
// Sign up
// ----------------------------------------------------------------------------

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/perfil`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    },
  });

  if (error) {
    return { status: "error", message: traduceErrorAuth(error.message) };
  }

  // Si la confirmación de email está desactivada en Supabase, signUp devuelve
  // sesión inmediata. Si está activa, devuelve user sin sesión y manda el mail.
  const requiresEmailConfirm = data.session === null;

  // Actualizamos nombre/apellido en el profile (el trigger ya creó la fila).
  // Cast manual porque nuestro tipo Database no incluye Relationships y
  // supabase-js no infiere el shape del Update sin eso.
  if (data.user) {
    type ProfileUpdate =
      import("@/types/database").Database["public"]["Tables"]["profiles"]["Update"];
    const update: ProfileUpdate = {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    };
    await supabase
      .from("profiles")
      .update(update as never)
      .eq("id", data.user.id);
  }

  if (requiresEmailConfirm) {
    redirect(`/registro/verifica-email?email=${encodeURIComponent(parsed.data.email)}`);
  }

  revalidatePath("/", "layout");
  redirect("/perfil");
}

// ----------------------------------------------------------------------------
// Sign in
// ----------------------------------------------------------------------------

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: traduceErrorAuth(error.message) };
  }

  // `next` permite volver a donde el usuario venía (ej: /app/campanas/x desde el
  // botón de reservar). Validamos que sea un path interno por seguridad.
  const nextRaw = formData.get("next");
  const next =
    typeof nextRaw === "string" && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/perfil";

  revalidatePath("/", "layout");
  redirect(next);
}

// ----------------------------------------------------------------------------
// Sign out
// ----------------------------------------------------------------------------

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ----------------------------------------------------------------------------
// Reset password (paso 1: pedir email)
// ----------------------------------------------------------------------------

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/actualizar-password`,
  });

  // Siempre devolvemos éxito para no filtrar si el email existe o no.
  if (error) {
    console.error("Reset password error:", error);
  }

  return {
    status: "success",
    message: "Si tu email está registrado, te mandamos un link para crear una contraseña nueva.",
  };
}

// ----------------------------------------------------------------------------
// Update password (paso 2: después del link del email)
// ----------------------------------------------------------------------------

export async function updatePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: traduceErrorAuth(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/perfil");
}

// ----------------------------------------------------------------------------
// Traduce los mensajes en inglés de Supabase a algo más amable.
// ----------------------------------------------------------------------------

function traduceErrorAuth(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Tenés que confirmar el email antes de entrar. Revisá tu casilla.";
  }
  if (lower.includes("user already registered") || lower.includes("already exists")) {
    return "Ya hay una cuenta con ese email. Probá iniciar sesión.";
  }
  if (lower.includes("password should be at least")) {
    return "La contraseña tiene que tener al menos 8 caracteres.";
  }
  if (lower.includes("rate limit")) {
    return "Demasiados intentos. Esperá unos minutos y volvé a probar.";
  }
  return msg;
}
