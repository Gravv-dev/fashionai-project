/**
 * TypeScript database types for FashionTech AI Supabase schema.
 *
 * These types mirror the SQL migrations in supabase/migrations/001_initial_schema.sql.
 * They are used for type-safe database queries across the application.
 */

export type UserRole = "designer" | "admin" | "viewer";
export type ProjectType = "tech_pack" | "flat_sketch" | "line_sheet";
export type ProjectStatus = "draft" | "generating" | "ready" | "exported";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete";
export type SubscriptionPlan = "starter" | "professional" | "enterprise";
export type SizingSystem = "CM" | "IN";
export type SketchView = "front" | "back" | "both";
export type StorageBucket = "garment-references" | "flat-sketches" | "line-sheet-assets";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          brand_name: string | null;
          brand_contact: string | null;
          sizing_system: SizingSystem;
          size_range: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          brand_name?: string | null;
          brand_contact?: string | null;
          sizing_system?: SizingSystem;
          size_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          brand_name?: string | null;
          brand_contact?: string | null;
          sizing_system?: SizingSystem;
          size_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          type: ProjectType;
          status: ProjectStatus;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          type: ProjectType;
          status?: ProjectStatus;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          type?: ProjectType;
          status?: ProjectStatus;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tech_packs: {
        Row: {
          id: string;
          project_id: string;
          garment_type: string | null;
          size_range: string | null;
          measurements: Json | null;
          bom: Json | null;
          construction_notes: string | null;
          flat_sketch_url: string | null;
          reference_image_url: string | null;
          ai_garment_type: string | null;
          ai_garment_category: string | null;
          ai_gender_category: string | null;
          ai_description: string | null;
          ai_style_characteristics: Json | null;
          ai_visual_details: Json | null;
          ai_materials: Json | null;
          ai_measurements: Json | null;
          ai_bill_of_materials: Json | null;
          ai_construction_details: Json | null;
          ai_confidence_score: number | null;
          ai_model_used: string | null;
          ai_status: string | null;
          ai_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          garment_type?: string | null;
          size_range?: string | null;
          measurements?: Json | null;
          bom?: Json | null;
          construction_notes?: string | null;
          flat_sketch_url?: string | null;
          reference_image_url?: string | null;
          ai_garment_type?: string | null;
          ai_garment_category?: string | null;
          ai_gender_category?: string | null;
          ai_description?: string | null;
          ai_style_characteristics?: Json | null;
          ai_visual_details?: Json | null;
          ai_materials?: Json | null;
          ai_measurements?: Json | null;
          ai_bill_of_materials?: Json | null;
          ai_construction_details?: Json | null;
          ai_confidence_score?: number | null;
          ai_model_used?: string | null;
          ai_status?: string | null;
          ai_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          garment_type?: string | null;
          size_range?: string | null;
          measurements?: Json | null;
          bom?: Json | null;
          construction_notes?: string | null;
          flat_sketch_url?: string | null;
          reference_image_url?: string | null;
          ai_garment_type?: string | null;
          ai_garment_category?: string | null;
          ai_gender_category?: string | null;
          ai_description?: string | null;
          ai_style_characteristics?: Json | null;
          ai_visual_details?: Json | null;
          ai_materials?: Json | null;
          ai_measurements?: Json | null;
          ai_bill_of_materials?: Json | null;
          ai_construction_details?: Json | null;
          ai_confidence_score?: number | null;
          ai_model_used?: string | null;
          ai_status?: string | null;
          ai_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flat_sketches: {
        Row: {
          id: string;
          project_id: string;
          source_image_url: string | null;
          generated_sketch_url: string | null;
          svg_url: string | null;
          view: SketchView;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_image_url?: string | null;
          generated_sketch_url?: string | null;
          svg_url?: string | null;
          view?: SketchView;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_image_url?: string | null;
          generated_sketch_url?: string | null;
          svg_url?: string | null;
          view?: SketchView;
          created_at?: string;
          updated_at?: string;
        };
      };
      line_sheets: {
        Row: {
          id: string;
          project_id: string;
          collection_title: string | null;
          season: string | null;
          styles: Json | null;
          pdf_url: string | null;
          product_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          collection_title?: string | null;
          season?: string | null;
          styles?: Json | null;
          pdf_url?: string | null;
          product_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          collection_title?: string | null;
          season?: string | null;
          styles?: Json | null;
          pdf_url?: string | null;
          product_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: SubscriptionPlan;
          status: SubscriptionStatus;
          credits: number;
          monthly_price_cents: number | null;
          annual_price_cents: number | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: SubscriptionPlan;
          status?: SubscriptionStatus;
          credits?: number;
          monthly_price_cents?: number | null;
          annual_price_cents?: number | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: SubscriptionPlan;
          status?: SubscriptionStatus;
          credits?: number;
          monthly_price_cents?: number | null;
          annual_price_cents?: number | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

// Convenience types for common row/insert/update shapes
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type TechPack = Database["public"]["Tables"]["tech_packs"]["Row"];
export type TechPackInsert = Database["public"]["Tables"]["tech_packs"]["Insert"];
export type TechPackUpdate = Database["public"]["Tables"]["tech_packs"]["Update"];

export type FlatSketch = Database["public"]["Tables"]["flat_sketches"]["Row"];
export type FlatSketchInsert = Database["public"]["Tables"]["flat_sketches"]["Insert"];
export type FlatSketchUpdate = Database["public"]["Tables"]["flat_sketches"]["Update"];

export type LineSheet = Database["public"]["Tables"]["line_sheets"]["Row"];
export type LineSheetInsert = Database["public"]["Tables"]["line_sheets"]["Insert"];
export type LineSheetUpdate = Database["public"]["Tables"]["line_sheets"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];
