export type UserRole = "designer" | "admin" | "viewer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  brand_name: string | null;
  brand_contact: string | null;
  sizing_system: "CM" | "IN";
  size_range: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: "tech_pack" | "flat_sketch" | "line_sheet";
  status: "draft" | "generating" | "ready" | "exported";
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TechPack {
  id: string;
  project_id: string;
  garment_type: string | null;
  size_range: string | null;
  measurements: Record<string, unknown> | null;
  bom: Record<string, unknown> | null;
  construction_notes: string | null;
  flat_sketch_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlatSketch {
  id: string;
  project_id: string;
  source_image_url: string | null;
  generated_sketch_url: string | null;
  svg_url: string | null;
  view: "front" | "back" | "both";
  created_at: string;
  updated_at: string;
}

export interface LineSheet {
  id: string;
  project_id: string;
  collection_title: string | null;
  season: string | null;
  styles: Record<string, unknown> | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: "starter" | "professional" | "enterprise";
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
  credits?: number;
}
