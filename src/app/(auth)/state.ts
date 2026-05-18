// Estado inicial compartido por los forms de auth.
// Vive en archivo separado porque "use server" files (actions.ts) sólo pueden
// exportar funciones async en Next 16.

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export const initialState: FormState = { status: "idle" };
