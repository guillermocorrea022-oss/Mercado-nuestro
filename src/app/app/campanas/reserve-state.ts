// Estado inicial del form de reserva. Vive separado de actions.ts porque
// "use server" files solo pueden exportar funciones async en Next 16.

export type ReserveFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export const initialReserveState: ReserveFormState = { status: "idle" };
