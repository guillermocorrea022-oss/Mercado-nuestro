// Tipos del schema public de Supabase para Mercado Nuestro.
//
// Generado manualmente en base a supabase/migrations/20260518120000_initial_schema.sql.
// Cuando cambie el schema, actualizar acá Y la migración SQL en paralelo.
//
// En el futuro, cuando Docker esté disponible o se haga `npx supabase login`, se puede regenerar con:
//   npx supabase gen types typescript --project-id ujvzbyzxfllczvoiywap --schema public > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// Enums
// ============================================================================

export type UserRole =
  | "comprador"
  | "vendedor_catalogo"
  | "revendedor"
  | "importador_avanzado"
  | "admin";

export type UserStatus = "activa" | "suspendida" | "eliminada";

export type VerificationType = "cedula" | "rut" | "comprobante_domicilio";

export type VerificationStatus = "pendiente" | "aprobado" | "rechazado";

export type CampaignStatus =
  | "borrador"
  | "activa"
  | "cerrada_exitosa"
  | "cerrada_fallida"
  | "en_proceso"
  | "entregada"
  | "finalizada"
  | "cancelada";

export type ReservationStatus =
  | "activa"
  | "cancelada"
  | "confirmada"
  | "pagada_total"
  | "entregada";

// ============================================================================
// Database schema
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          birth_date: string | null;
          avatar_url: string | null;
          status: UserStatus;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          status?: UserStatus;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          assigned_at: string;
          assigned_by: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          assigned_at?: string;
          assigned_by?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };

      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          street: string;
          street_number: string | null;
          apartment: string | null;
          city: string;
          department: string;
          postal_code: string | null;
          instructions: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          street: string;
          street_number?: string | null;
          apartment?: string | null;
          city: string;
          department: string;
          postal_code?: string | null;
          instructions?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_addresses"]["Insert"]>;
      };

      user_verifications: {
        Row: {
          id: string;
          user_id: string;
          type: VerificationType;
          file_url: string;
          status: VerificationStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: VerificationType;
          file_url: string;
          status?: VerificationStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_verifications"]["Insert"]>;
      };

      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          icon: string | null;
          display_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          icon?: string | null;
          display_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };

      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          short_description: string | null;
          long_description: string | null;
          category_id: string | null;
          brand: string | null;
          main_image_url: string | null;
          additional_image_urls: string[];
          attributes: Json;
          weight_grams: number | null;
          dimensions: Json | null;
          supplier_reference: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          short_description?: string | null;
          long_description?: string | null;
          category_id?: string | null;
          brand?: string | null;
          main_image_url?: string | null;
          additional_image_urls?: string[];
          attributes?: Json;
          weight_grams?: number | null;
          dimensions?: Json | null;
          supplier_reference?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };

      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          attributes: Json;
          image_url: string | null;
          sku: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          attributes?: Json;
          image_url?: string | null;
          sku?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
      };

      campaigns: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          slug: string;
          description: string | null;
          hero_image_url: string | null;
          moq: number;
          max_quantity: number | null;
          deposit_percentage: number;
          opens_at: string;
          closes_at: string;
          actually_closed_at: string | null;
          estimated_arrival_at: string | null;
          status: CampaignStatus;
          return_policy: string | null;
          internal_notes: string | null;
          created_by: string;
          extended_once: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          slug: string;
          description?: string | null;
          hero_image_url?: string | null;
          moq: number;
          max_quantity?: number | null;
          deposit_percentage?: number;
          opens_at?: string;
          closes_at: string;
          actually_closed_at?: string | null;
          estimated_arrival_at?: string | null;
          status?: CampaignStatus;
          return_policy?: string | null;
          internal_notes?: string | null;
          created_by: string;
          extended_once?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
      };

      campaign_pricing_tiers: {
        Row: {
          id: string;
          campaign_id: string;
          tier_number: number;
          min_quantity: number;
          max_quantity: number | null;
          unit_price_cents_usd: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          tier_number: number;
          min_quantity: number;
          max_quantity?: number | null;
          unit_price_cents_usd: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_pricing_tiers"]["Insert"]>;
      };

      campaign_reservations: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          quantity: number;
          unit_price_at_reservation_cents_usd: number;
          expected_deposit_cents_usd: number;
          status: ReservationStatus;
          reserved_at: string;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          attributed_seller_id: string | null;
          share_referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          user_id: string;
          quantity: number;
          unit_price_at_reservation_cents_usd: number;
          expected_deposit_cents_usd: number;
          status?: ReservationStatus;
          reserved_at?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          attributed_seller_id?: string | null;
          share_referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_reservations"]["Insert"]>;
      };
    };

    Views: {
      campaign_progress_view: {
        Row: {
          campaign_id: string | null;
          title: string | null;
          slug: string | null;
          moq: number | null;
          max_quantity: number | null;
          opens_at: string | null;
          closes_at: string | null;
          status: CampaignStatus | null;
          reserved_quantity: number | null;
          unique_reservers: number | null;
          moq_progress_pct: number | null;
          seconds_until_close: number | null;
        };
      };
    };

    Functions: {
      has_role: {
        Args: { check_user_id: string; check_role: UserRole };
        Returns: boolean;
      };
    };

    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      verification_type: VerificationType;
      verification_status: VerificationStatus;
      campaign_status: CampaignStatus;
      reservation_status: ReservationStatus;
    };

    CompositeTypes: Record<string, never>;
  };
}
