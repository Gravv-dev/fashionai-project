/**
 * FashionTech AI - AI Type Definitions
 *
 * Shared TypeScript types for the AI generation layer.
 * Defines provider interfaces, AI-generated tech pack structures,
 * and error types used across the AI service layer.
 */

// -------------------------------------------------------------------
// Provider Types
// -------------------------------------------------------------------

export type AIProviderName = "openai" | "anthropic" | "google" | "custom";

export interface AIProviderConfig {
  provider: AIProviderName;
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: "text" | "json_object" };
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  finish_reason?: string;
}

export interface AIProvider {
  name: AIProviderName;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
}

// -------------------------------------------------------------------
// Tech Pack AI Types
// -------------------------------------------------------------------

export type AIGenerationStatus = "pending" | "generating" | "completed" | "failed";

export interface AIGarmentOverview {
  garment_category: string;
  garment_type: string;
  gender_category?: string;
  description: string;
  style_characteristics: string[];
}

export interface AIVisualDetails {
  collar?: string;
  sleeves?: string;
  neckline?: string;
  pockets?: string;
  closures?: string;
  seams?: string;
  hem?: string;
  visible_design_details?: string[];
}

export interface AIMaterials {
  suggested_fabric?: string;
  suggested_composition?: string;
  suggested_trims?: string[];
  suggested_accessories?: string[];
}

export interface AIMeasurement {
  measurement_point: string;
  suggested_value: string;
  unit: string;
  confidence: number;
  estimated_or_user_confirmed: "estimated" | "user_confirmed";
}

export interface AIBOMItem {
  item: string;
  material: string;
  suggested_quantity: string;
  unit: string;
  notes?: string;
}

export interface AIConstructionDetails {
  stitching_suggestions?: string[];
  seam_suggestions?: string[];
  finishing_suggestions?: string[];
}

export interface AIGeneratedTechPack {
  garment_overview: AIGarmentOverview;
  visual_details: AIVisualDetails;
  materials: AIMaterials;
  measurements: AIMeasurement[];
  bill_of_materials: AIBOMItem[];
  construction_details: AIConstructionDetails;
  confidence_score: number;
}

export interface AIServiceConfig {
  provider: AIProvider;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface AIServiceError {
  code: "ai_not_configured" | "authentication_error" | "rate_limit_error" |
    "timeout_error" | "invalid_response" | "validation_error" | "unknown_error";
  message: string;
  details?: unknown;
  retryable: boolean;
}

// -------------------------------------------------------------------
// Tech Pack AI Database Extension Types
// -------------------------------------------------------------------

export interface AITechPackGeneration {
  id: string;
  project_id: string;
  garment_type: string | null;
  garment_category: string | null;
  gender_category: string | null;
  description: string | null;
  style_characteristics: Json | null;
  visual_details: Json | null;
  materials: Json | null;
  measurements: Json | null;
  bill_of_materials: Json | null;
  construction_details: Json | null;
  confidence_score: number | null;
  ai_model_used: string | null;
  ai_status: string | null;
  ai_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------------
// Image Analysis Types
// -------------------------------------------------------------------

export interface ImageAnalysisRequest {
  imageUrl: string;
  imagePath: string;
  userId: string;
  projectId: string;
  garmentReference: boolean;
}

export interface ImageAnalysisResult {
  garmentType: string | null;
  garmentCategory: string | null;
  genderCategory: string | null;
  description: string | null;
  styleCharacteristics: string[];
  visualDetails: AIVisualDetails;
  materials: AIMaterials;
  measurements: AIMeasurement[];
  billOfMaterials: AIBOMItem[];
  constructionDetails: AIConstructionDetails;
  confidenceScore: number;
}

// -------------------------------------------------------------------
// JSON type for database compatibility
// -------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
