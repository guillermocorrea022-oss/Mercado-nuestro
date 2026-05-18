// Tipos generados automáticamente por el CLI de Supabase.
// Stub temporal hasta que tengamos el proyecto Supabase creado.
//
// Para regenerar:
//   npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/types/database.ts
//
// O contra DB local:
//   npx supabase gen types typescript --local > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
