/**
 * FashionTech AI - Tech Pack Zod Schemas
 *
 * Zod schemas for validating structured AI-generated tech pack output.
 * All schemas are designed to validate AI responses and ensure type safety
 * before storing in the database or displaying to users.
 */

import { z } from "zod";

// -------------------------------------------------------------------
// Garment Overview Schema
// -------------------------------------------------------------------

export const AIGarmentOverviewSchema = z.object({
  garment_category: z.string().min(1, "Garment category is required"),
  garment_type: z.string().min(1, "Garment type is required"),
  gender_category: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  style_characteristics: z.array(z.string()).default([]),
});

export type AIGarmentOverview = z.infer<typeof AIGarmentOverviewSchema>;

// -------------------------------------------------------------------
// Visual Details Schema
// -------------------------------------------------------------------

export const AIVisualDetailsSchema = z.object({
  collar: z.string().optional(),
  sleeves: z.string().optional(),
  neckline: z.string().optional(),
  pockets: z.string().optional(),
  closures: z.string().optional(),
  seams: z.string().optional(),
  hem: z.string().optional(),
  visible_design_details: z.array(z.string()).default([]),
});

export type AIVisualDetails = z.infer<typeof AIVisualDetailsSchema>;

// -------------------------------------------------------------------
// Materials Schema
// -------------------------------------------------------------------

export const AIMaterialsSchema = z.object({
  suggested_fabric: z.string().optional(),
  suggested_composition: z.string().optional(),
  suggested_trims: z.array(z.string()).default([]),
  suggested_accessories: z.array(z.string()).default([]),
});

export type AIMaterials = z.infer<typeof AIMaterialsSchema>;

// -------------------------------------------------------------------
// Measurement Schema
// -------------------------------------------------------------------

export const AIMeasurementSchema = z.object({
  measurement_point: z.string().min(1, "Measurement point is required"),
  suggested_value: z.string().min(1, "Suggested value is required"),
  unit: z.string().min(1, "Unit is required"),
  confidence: z.number().min(0).max(100).default(50),
  estimated_or_user_confirmed: z.enum(["estimated", "user_confirmed"]).default("estimated"),
});

export type AIMeasurement = z.infer<typeof AIMeasurementSchema>;

// -------------------------------------------------------------------
// Bill of Materials Item Schema
// -------------------------------------------------------------------

export const AIBOMItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  material: z.string().min(1, "Material is required"),
  suggested_quantity: z.string().min(1, "Suggested quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().optional(),
});

export type AIBOMItem = z.infer<typeof AIBOMItemSchema>;

// -------------------------------------------------------------------
// Construction Details Schema
// -------------------------------------------------------------------

export const AIConstructionDetailsSchema = z.object({
  stitching_suggestions: z.array(z.string()).default([]),
  seam_suggestions: z.array(z.string()).default([]),
  finishing_suggestions: z.array(z.string()).default([]),
});

export type AIConstructionDetails = z.infer<typeof AIConstructionDetailsSchema>;

// -------------------------------------------------------------------
// Complete Tech Pack Schema
// -------------------------------------------------------------------

export const AIGeneratedTechPackSchema = z.object({
  garment_overview: AIGarmentOverviewSchema,
  visual_details: AIVisualDetailsSchema,
  materials: AIMaterialsSchema,
  measurements: z.array(AIMeasurementSchema).default([]),
  bill_of_materials: z.array(AIBOMItemSchema).default([]),
  construction_details: AIConstructionDetailsSchema,
  confidence_score: z.number().min(0).max(100).default(0),
});

export type AIGeneratedTechPack = z.infer<typeof AIGeneratedTechPackSchema>;

// -------------------------------------------------------------------
// Validation Helpers
// -------------------------------------------------------------------

/**
 * Validates raw AI output against the tech pack schema.
 * Returns the parsed and validated tech pack data.
 *
 * @param rawOutput - Raw JSON string or object from AI provider
 * @returns Validated AIGeneratedTechPack object
 * @throws AIValidationError if validation fails
 */
export function validateTechPackOutput(rawOutput: unknown): AIGeneratedTechPack {
  try {
    const parsed = typeof rawOutput === "string" ? JSON.parse(rawOutput) : rawOutput;
    return AIGeneratedTechPackSchema.parse(parsed);
  } catch (error) {
    throw new Error(
      `AI output validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates a single measurement object.
 */
export function validateMeasurement(rawOutput: unknown): AIMeasurement {
  return AIMeasurementSchema.parse(rawOutput);
}

/**
 * Validates a single BOM item object.
 */
export function validateBOMItem(rawOutput: unknown): AIBOMItem {
  return AIBOMItemSchema.parse(rawOutput);
}

/**
 * Validates garment overview object.
 */
export function validateGarmentOverview(rawOutput: unknown): AIGarmentOverview {
  return AIGarmentOverviewSchema.parse(rawOutput);
}

/**
 * Validates visual details object.
 */
export function validateVisualDetails(rawOutput: unknown): AIVisualDetails {
  return AIVisualDetailsSchema.parse(rawOutput);
}

/**
 * Validates materials object.
 */
export function validateMaterials(rawOutput: unknown): AIMaterials {
  return AIMaterialsSchema.parse(rawOutput);
}

/**
 * Validates construction details object.
 */
export function validateConstructionDetails(rawOutput: unknown): AIConstructionDetails {
  return AIConstructionDetailsSchema.parse(rawOutput);
}
