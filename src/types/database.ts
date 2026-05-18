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
  | "admin"
  | "admin_super"
  | "admin_operador_campanas"
  | "admin_atencion"
  | "admin_local";

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

export type OrderStatus =
  | "pendiente_pago"
  | "pagada"
  | "en_proceso"
  | "enviada"
  | "entregada"
  | "cancelada"
  | "reembolsada";

export type OrderItemType =
  | "campaign_reservation"
  | "inventory_item"
  | "marketplace_listing";

export type PaymentMethod =
  | "mercado_pago"
  | "transferencia"
  | "abitab"
  | "redpagos"
  | "credito_cuenta"
  | "manual";

export type PaymentStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "reembolsado"
  | "expirado";

export type CreditMovementType =
  | "ajuste_precio_campana"
  | "devolucion_sena_campana_fallida"
  | "bonus_campana_fallida"
  | "reembolso"
  | "uso_en_compra"
  | "regalo"
  | "ajuste_manual";

export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp";

export type CampaignUpdateType =
  | "pedido_confirmado_proveedor"
  | "producto_despachado_origen"
  | "en_transito"
  | "llego_aduana"
  | "despacho_aduanero"
  | "llego_deposito"
  | "listo_entrega"
  | "mensaje_general";

export type ClaimType =
  | "defectuoso"
  | "no_llego"
  | "llego_equivocado"
  | "faltante"
  | "no_corresponde_descripcion"
  | "otro";

export type ClaimStatus =
  | "abierto"
  | "en_revision"
  | "resuelto_a_favor_usuario"
  | "resuelto_a_favor_vendedor"
  | "apelado"
  | "cerrado";

export type ProposalStatus =
  | "abierta"
  | "en_revision"
  | "aprobada"
  | "rechazada"
  | "convertida";

export type ListingStatus = "activa" | "pausada" | "agotada" | "eliminada";

export type MarketplaceOrderStatus =
  | "pagada"
  | "despachada"
  | "entregada"
  | "cancelada"
  | "reembolsada";

export type CatalogSaleStatus =
  | "pendiente"
  | "consolidada"
  | "pagada"
  | "descartada";

export type ReviewStatus = "visible" | "oculto_admin" | "reportado";

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
          phone_verified_at: string | null;
          birth_date: string | null;
          avatar_url: string | null;
          status: UserStatus;
          last_active_at: string | null;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          phone_verified_at?: string | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          status?: UserStatus;
          last_active_at?: string | null;
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };

      campaign_status_updates: {
        Row: {
          id: string;
          campaign_id: string;
          type: CampaignUpdateType;
          description: string;
          photo_url: string | null;
          visible_to_users: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          type: CampaignUpdateType;
          description: string;
          photo_url?: string | null;
          visible_to_users?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_status_updates"]["Insert"]>;
        Relationships: [];
      };

      inventory_items: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          quantity_available: number;
          quantity_reserved: number;
          location: string;
          unit_price_cents_usd: number;
          cost_cents_usd: number | null;
          source_campaign_id: string | null;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          quantity_available?: number;
          quantity_reserved?: number;
          location?: string;
          unit_price_cents_usd: number;
          cost_cents_usd?: number | null;
          source_campaign_id?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_items"]["Insert"]>;
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          user_id: string;
          total_cents_usd: number;
          currency: string;
          status: OrderStatus;
          shipping_address_id: string | null;
          shipping_method: string | null;
          attributed_seller_id: string | null;
          share_referral_code: string | null;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_cents_usd: number;
          currency?: string;
          status?: OrderStatus;
          shipping_address_id?: string | null;
          shipping_method?: string | null;
          attributed_seller_id?: string | null;
          share_referral_code?: string | null;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_type: OrderItemType;
          reference_id: string;
          quantity: number;
          unit_price_cents_usd: number;
          subtotal_cents_usd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_type: OrderItemType;
          reference_id: string;
          quantity: number;
          unit_price_cents_usd: number;
          subtotal_cents_usd: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };

      payments: {
        Row: {
          id: string;
          order_id: string | null;
          reservation_id: string | null;
          amount_cents: number;
          currency: string;
          method: PaymentMethod;
          status: PaymentStatus;
          external_id: string | null;
          external_status: string | null;
          raw_payload: Json | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          reservation_id?: string | null;
          amount_cents: number;
          currency?: string;
          method: PaymentMethod;
          status?: PaymentStatus;
          external_id?: string | null;
          external_status?: string | null;
          raw_payload?: Json | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };

      user_credits: {
        Row: {
          user_id: string;
          available_cents_usd: number;
          reserved_cents_usd: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          available_cents_usd?: number;
          reserved_cents_usd?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_credits"]["Insert"]>;
        Relationships: [];
      };

      credit_movements: {
        Row: {
          id: string;
          user_id: string;
          amount_cents_usd: number;
          type: CreditMovementType;
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_cents_usd: number;
          type: CreditMovementType;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_movements"]["Insert"]>;
        Relationships: [];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          context_data: Json;
          read_at: string | null;
          sent_at: string;
          channel: NotificationChannel;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          context_data?: Json;
          read_at?: string | null;
          sent_at?: string;
          channel?: NotificationChannel;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };

      settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          value_type: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          value_type?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };

      seller_profiles: {
        Row: {
          user_id: string;
          display_name: string;
          slug: string;
          bio: string | null;
          public_avatar_url: string | null;
          rating_avg: number;
          total_sales: number;
          payout_method: string | null;
          payout_data: Json | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          slug: string;
          bio?: string | null;
          public_avatar_url?: string | null;
          rating_avg?: number;
          total_sales?: number;
          payout_method?: string | null;
          payout_data?: Json | null;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seller_profiles"]["Insert"]>;
        Relationships: [];
      };

      catalog_links: {
        Row: {
          id: string;
          seller_id: string;
          slug: string;
          internal_name: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          slug: string;
          internal_name?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_links"]["Insert"]>;
        Relationships: [];
      };

      catalog_sales: {
        Row: {
          id: string;
          seller_id: string;
          order_id: string | null;
          reservation_id: string | null;
          attributable_cents_usd: number;
          commission_pct: number;
          commission_cents_usd: number;
          status: CatalogSaleStatus;
          consolidated_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          order_id?: string | null;
          reservation_id?: string | null;
          attributable_cents_usd: number;
          commission_pct: number;
          commission_cents_usd: number;
          status?: CatalogSaleStatus;
          consolidated_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_sales"]["Insert"]>;
        Relationships: [];
      };

      marketplace_listings: {
        Row: {
          id: string;
          seller_id: string;
          product_id: string;
          variant_id: string | null;
          quantity_available: number;
          quantity_total: number;
          price_cents_usd: number;
          additional_image_urls: string[];
          description: string | null;
          status: ListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity_available: number;
          quantity_total: number;
          price_cents_usd: number;
          additional_image_urls?: string[];
          description?: string | null;
          status?: ListingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketplace_listings"]["Insert"]>;
        Relationships: [];
      };

      marketplace_orders: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          quantity: number;
          unit_price_cents_usd: number;
          total_cents_usd: number;
          commission_cents_usd: number;
          seller_amount_cents_usd: number;
          status: MarketplaceOrderStatus;
          paid_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          tracking_code: string | null;
          shipping_address: Json | null;
          shipping_method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          quantity: number;
          unit_price_cents_usd: number;
          total_cents_usd: number;
          commission_cents_usd?: number;
          seller_amount_cents_usd: number;
          status?: MarketplaceOrderStatus;
          paid_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          tracking_code?: string | null;
          shipping_address?: Json | null;
          shipping_method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketplace_orders"]["Insert"]>;
        Relationships: [];
      };

      marketplace_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          attachments: Json;
          sent_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          attachments?: Json;
          sent_at?: string;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["marketplace_messages"]["Insert"]>;
        Relationships: [];
      };

      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          photos: string[];
          status: ReviewStatus;
          admin_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          order_id?: string | null;
          rating: number;
          title?: string | null;
          body?: string | null;
          photos?: string[];
          status?: ReviewStatus;
          admin_response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };

      marketplace_listing_reviews: {
        Row: {
          id: string;
          listing_id: string | null;
          order_id: string | null;
          user_id: string;
          rating: number;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          order_id?: string | null;
          user_id: string;
          rating: number;
          body?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["marketplace_listing_reviews"]["Insert"]>;
        Relationships: [];
      };

      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          notify_price_drop: boolean;
          notify_back_in_stock: boolean;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          notify_price_drop?: boolean;
          notify_back_in_stock?: boolean;
          added_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Insert"]>;
        Relationships: [];
      };

      claims: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          item_reference: string | null;
          type: ClaimType;
          description: string;
          photos: string[];
          status: ClaimStatus;
          resolution: string | null;
          refund_amount_cents_usd: number | null;
          resolution_notes: string | null;
          resolved_at: string | null;
          appealed_at: string | null;
          appeal_reason: string | null;
          opened_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id?: string | null;
          item_reference?: string | null;
          type: ClaimType;
          description: string;
          photos?: string[];
          status?: ClaimStatus;
          resolution?: string | null;
          refund_amount_cents_usd?: number | null;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          appealed_at?: string | null;
          appeal_reason?: string | null;
          opened_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["claims"]["Insert"]>;
        Relationships: [];
      };

      product_proposals: {
        Row: {
          id: string;
          proposed_by: string;
          title: string;
          description: string | null;
          reference_url: string | null;
          photo_url: string | null;
          category_id: string | null;
          my_quantity: number | null;
          max_price_cents_usd: number | null;
          status: ProposalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          proposed_by: string;
          title: string;
          description?: string | null;
          reference_url?: string | null;
          photo_url?: string | null;
          category_id?: string | null;
          my_quantity?: number | null;
          max_price_cents_usd?: number | null;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_proposals"]["Insert"]>;
        Relationships: [];
      };

      product_proposal_interests: {
        Row: {
          id: string;
          proposal_id: string;
          user_id: string;
          quantity: number;
          max_price_cents_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          user_id: string;
          quantity: number;
          max_price_cents_usd?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_proposal_interests"]["Insert"]>;
        Relationships: [];
      };

      admin_actions_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          before_state: Json | null;
          after_state: Json | null;
          ip_address: string | null;
          performed_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          before_state?: Json | null;
          after_state?: Json | null;
          ip_address?: string | null;
          performed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_actions_log"]["Insert"]>;
        Relationships: [];
      };

      phone_verification_codes: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["phone_verification_codes"]["Insert"]
        >;
        Relationships: [];
      };

      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_user_id: string;
          status: string;
          reward_cents_usd: number;
          consolidated_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_user_id: string;
          status?: string;
          reward_cents_usd?: number;
          consolidated_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referrals"]["Insert"]>;
        Relationships: [];
      };

      commission_payouts: {
        Row: {
          id: string;
          seller_id: string;
          period_month: string;
          total_cents_usd: number;
          method: string | null;
          requested_at: string;
          paid_at: string | null;
          proof_url: string | null;
          status: "solicitado" | "pagado" | "rechazado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          period_month: string;
          total_cents_usd: number;
          method?: string | null;
          requested_at?: string;
          paid_at?: string | null;
          proof_url?: string | null;
          status?: "solicitado" | "pagado" | "rechazado";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["commission_payouts"]["Insert"]>;
        Relationships: [];
      };

      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          category: string | null;
          body: string;
          status: "abierto" | "en_proceso" | "cerrado";
          priority: "baja" | "normal" | "alta" | "urgente";
          assigned_to: string | null;
          opened_at: string;
          closed_at: string | null;
          satisfaction_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          category?: string | null;
          body: string;
          status?: "abierto" | "en_proceso" | "cerrado";
          priority?: "baja" | "normal" | "alta" | "urgente";
          assigned_to?: string | null;
          opened_at?: string;
          closed_at?: string | null;
          satisfaction_rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>;
        Relationships: [];
      };

      notification_preferences: {
        Row: {
          user_id: string;
          notification_type: string;
          channels: NotificationChannel[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          notification_type: string;
          channels?: NotificationChannel[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_preferences"]["Insert"]>;
        Relationships: [];
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
        Relationships: [];
      };

      user_stats_view: {
        Row: {
          user_id: string | null;
          email: string | null;
          active_reservations: number | null;
          marketplace_orders: number | null;
          credit_cents_usd: number | null;
          unread_notifications: number | null;
        };
        Relationships: [];
      };

      seller_dashboard_view: {
        Row: {
          seller_id: string | null;
          user_id: string | null;
          display_name: string | null;
          slug: string | null;
          total_sales: number | null;
          rating_avg: number | null;
          pending_commission_cents: number | null;
          paid_commission_cents: number | null;
          pending_attributions: number | null;
        };
        Relationships: [];
      };
    };

    Functions: {
      has_role: {
        Args: { check_user_id: string; check_role: UserRole };
        Returns: boolean;
      };
      close_campaign: {
        Args: { p_campaign_id: string };
        Returns: Json;
      };
      release_marketplace_escrow: {
        Args: { p_order_id: string };
        Returns: Json;
      };
      auto_release_marketplace_escrow: {
        Args: Record<string, never>;
        Returns: { order_id: string; result: string }[];
      };
      pay_campaign_balance: {
        Args: {
          p_reservation_id: string;
          p_method?: PaymentMethod;
        };
        Returns: Json;
      };
      refund_failed_campaign_reservation: {
        Args: {
          p_reservation_id: string;
          p_mode?: string;
        };
        Returns: Json;
      };
      extend_campaign: {
        Args: {
          p_campaign_id: string;
          p_new_closes_at: string;
        };
        Returns: Json;
      };
      appeal_claim: {
        Args: {
          p_claim_id: string;
          p_reason: string;
        };
        Returns: Json;
      };
      compute_seller_monthly_bonus_pct: {
        Args: {
          p_seller_id: string;
          p_month_start: string;
        };
        Returns: number;
      };
      auto_close_expired_campaigns: {
        Args: Record<string, never>;
        Returns: Json;
      };
      process_monthly_seller_payouts: {
        Args: { p_min_amount_cents?: number };
        Returns: Json;
      };
      reservation_balance_cents: {
        Args: { p_reservation_id: string };
        Returns: number;
      };
      purchase_inventory_item: {
        Args: {
          p_item_id: string;
          p_quantity: number;
          p_shipping_address_id: string;
          p_method?: PaymentMethod;
        };
        Returns: Json;
      };
    };

    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      verification_type: VerificationType;
      verification_status: VerificationStatus;
      campaign_status: CampaignStatus;
      reservation_status: ReservationStatus;
      order_status: OrderStatus;
      order_item_type: OrderItemType;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      credit_movement_type: CreditMovementType;
      notification_channel: NotificationChannel;
      campaign_update_type: CampaignUpdateType;
      claim_type: ClaimType;
      claim_status: ClaimStatus;
      proposal_status: ProposalStatus;
      listing_status: ListingStatus;
      marketplace_order_status: MarketplaceOrderStatus;
      catalog_sale_status: CatalogSaleStatus;
      review_status: ReviewStatus;
    };

    CompositeTypes: Record<string, never>;
  };
}
