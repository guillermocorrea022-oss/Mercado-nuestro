import { z } from "zod";

// Validaciones Zod para los formularios de auth.
// Mensajes en español rioplatense, amables y específicos (§9 CLAUDE.md).

const emailSchema = z
  .string({ error: "Ingresá tu email" })
  .trim()
  .min(1, "Ingresá tu email")
  .email("El email no parece válido");

const passwordSchema = z
  .string({ error: "Ingresá una contraseña" })
  .min(8, "La contraseña tiene que tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga");

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Ingresá tu nombre")
      .max(80, "El nombre es demasiado largo"),
    lastName: z
      .string()
      .trim()
      .min(1, "Ingresá tu apellido")
      .max(80, "El apellido es demasiado largo"),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Las contraseñas no coinciden",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Las contraseñas no coinciden",
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
