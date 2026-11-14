/**
 * FashionTech AI - Tech Pack AI Service
 *
 * Service for generating tech pack specifications from garment reference images
 * using AI. Handles image analysis, structured output generation, and database
 * persistence with full RLS and ownership verification.
 */

import { createClient } from "@/lib/supabase";
import { getSignedFileUrl } from "@/lib/services/storage";
import {
  createAIProvider,
  createAIProviderFromEnv,
  isAIConfigured,
} from "@/lib/ai/providers/factory";
import {
  AIProvider,
  AIGeneratedTechPack,
  AIGarmentOverview,
  AIVisualDetails,
  AIMaterials,
  AIMeasurement,
  AIBOMItem,
  AIConstructionDetails,
  ImageAnalysisResult,
} from "@/lib/ai/types";
import {
  validateTechPackOutput,
} from "@/lib/ai/schemas/techpack";
import { AIError, AIConfigurationError, extractAIError } from "@/lib/ai/errors";
import type { TechPack, Json } from "@/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

async function getClient(): Promise<SupabaseClient | null> {
  return createClient();
}

function errorResult(message: string, code?: string, details?: unknown) {
  return {
    data: null,
    error: { message, code: code ?? "unknown_error", details },
    success: false,
  } as const;
}

function successResult<T>(data: T) {
  return { data, error: null, success: true } as const;
}

// -------------------------------------------------------------------
// AI Provider Initialization
// -------------------------------------------------------------------

let aiProvider: AIProvider | null = null;
let aiProviderInitialized = false;

function getAIProvider(): AIProvider | null {
  if (aiProviderInitialized) {
    return aiProvider;
  }

  aiProvider = createAIProviderFromEnv();
  aiProviderInitialized = true;
  return aiProvider;
}

function isAIAvailable(): boolean {
  return isAIConfigured() && getAIProvider() !== null;
}

// -------------------------------------------------------------------
// Image Analysis Service
// -------------------------------------------------------------------

/**
 * Analyzes a garment reference image using AI vision model.
 * Returns structured analysis of garment details.
 */
export async function analyzeGarmentImage(
  imagePath: string,
  userId: string,
  projectId: string
): Promise<{
  data: ImageAnalysisResult | null;
  error: { message: string; code: string } | null;
  success: boolean;
}> {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return errorResult("Not authenticated or unauthorized", "not_authenticated");
  }

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return errorResult("Project not found or unauthorized", "not_found");
  }

  // Get signed URL for the image
  const urlResult = await getSignedFileUrl("garment-references", imagePath, 300);
  if (!urlResult.success || !urlResult.data?.url) {
    return errorResult("Failed to access image", "image_access_error");
  }

  const aiProvider = getAIProvider();
  if (!aiProvider) {
    return errorResult("AI provider not configured", "ai_not_configured");
  }

  try {
    const systemPrompt = `You are an expert fashion designer and technical illustrator. Analyze the garment reference image and extract detailed technical specifications for a tech pack. Return ONLY valid JSON matching the requested schema. Do not include markdown formatting, explanations, or any text outside the JSON object.

Analyze the image carefully and provide:
1. garment_overview: garment_category, garment_type, gender_category, description, style_characteristics
2. visual_details: collar, sleeves, neckline, pockets, closures, seams, hem, visible_design_details
3. materials: suggested_fabric, suggested_composition, suggested_trims, suggested_accessories
4. measurements: array of measurement_point, suggested_value, unit, confidence (0-100), estimated_or_user_confirmed ("estimated" or "user_confirmed")
5. bill_of_materials: array of item, material, suggested_quantity, unit, notes
6. construction_details: stitching_suggestions, seam_suggestions, finishing_suggestions
7. confidence_score: 0-100 overall confidence

Be precise and use standard fashion industry terminology. Mark uncertain values with lower confidence.`;

    const completion = await aiProvider.complete({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analyze this garment reference image and extract complete tech pack specifications. Image: ${urlResult.data.url}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const parsed = validateTechPackOutput(completion.content);

    return successResult({
      garmentType: parsed.garment_overview.garment_type,
      garmentCategory: parsed.garment_overview.garment_category,
      genderCategory: parsed.garment_overview.gender_category || null,
      description: parsed.garment_overview.description,
      styleCharacteristics: parsed.garment_overview.style_characteristics,
      visualDetails: parsed.visual_details,
      materials: parsed.materials,
      measurements: parsed.measurements,
      billOfMaterials: parsed.bill_of_materials,
      constructionDetails: parsed.construction_details,
      confidenceScore: parsed.confidence_score,
    });
  } catch (err) {
    const aiError = extractAIError(err);
    return errorResult(aiError.message, aiError.code ?? "unknown_error", aiError.details);
  }
}

// -------------------------------------------------------------------
// Tech Pack AI Generation Service
// -------------------------------------------------------------------

/**
 * Generates a complete tech pack draft from a garment reference image.
 * Creates a tech pack record with AI-generated specifications.
 */
export async function generateTechPackFromImage(
  imagePath: string,
  projectId: string,
  userId: string
): Promise<{
  data: TechPack | null;
  error: { message: string; code: string } | null;
  success: boolean;
}> {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return errorResult("Not authenticated or unauthorized", "not_authenticated");
  }

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return errorResult("Project not found or unauthorized", "not_found");
  }

  // Check if tech pack already exists for this project
  const { data: existingTechPack } = await supabase
    .from("tech_packs")
    .select("id")
    .eq("project_id", projectId)
    .single();

  if (existingTechPack) {
    return errorResult("Tech pack already exists for this project", "already_exists");
  }

  // Analyze the garment image
  const analysisResult = await analyzeGarmentImage(imagePath, userId, projectId);
  if (!analysisResult.success || !analysisResult.data) {
    return errorResult(
      analysisResult.error?.message || "Image analysis failed",
      analysisResult.error?.code || "analysis_failed"
    );
  }

  const analysis = analysisResult.data;

  // Create the tech pack record with AI-generated data
  const { data: techPack, error: tpError } = await supabase
    .from("tech_packs")
    .insert({
      project_id: projectId,
      garment_type: analysis.garmentType,
      size_range: null,
      measurements: analysis.measurements as unknown as Record<string, unknown>,
      bom: analysis.billOfMaterials as unknown as Record<string, unknown>,
      construction_notes:
        analysis.constructionDetails?.stitching_suggestions?.join(". ") ||
        analysis.constructionDetails?.finishing_suggestions?.join(". ") ||
        null,
      flat_sketch_url: null,
      reference_image_url: imagePath,
      ai_garment_type: analysis.garmentType,
      ai_garment_category: analysis.garmentCategory,
      ai_gender_category: analysis.genderCategory,
      ai_description: analysis.description,
      ai_style_characteristics: analysis.styleCharacteristics as unknown as Json,
      ai_visual_details: analysis.visualDetails as unknown as Json,
      ai_materials: analysis.materials as unknown as Json,
      ai_measurements: analysis.measurements as unknown as Json,
      ai_bill_of_materials: analysis.billOfMaterials as unknown as Json,
      ai_construction_details: analysis.constructionDetails as unknown as Json,
      ai_confidence_score: analysis.confidenceScore,
      ai_model_used: "gpt-4o-mini",
      ai_status: "completed",
      ai_generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (tpError) {
    return errorResult(tpError.message || "Failed to create tech pack", "supabase_error");
  }

  return successResult(techPack as TechPack);
}

/**
 * Updates a tech pack with AI-generated refinements.
 * Allows users to refine specific sections of the tech pack.
 */
export async function refineTechPack(
  techPackId: string,
  projectId: string,
  userId: string,
  refinementPrompt: string
): Promise<{
  data: TechPack | null;
  error: { message: string; code: string } | null;
  success: boolean;
}> {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  // Verify user owns the tech pack via project
  const { data: techPack, error: tpError } = await supabase
    .from("tech_packs")
    .select("*, projects!inner(user_id)")
    .eq("id", techPackId)
    .eq("projects.user_id", userId)
    .single();

  if (tpError || !techPack) {
    return errorResult("Tech pack not found or unauthorized", "not_found");
  }

  const aiProvider = getAIProvider();
  if (!aiProvider) {
    return errorResult("AI provider not configured", "ai_not_configured");
  }

  try {
    const refinementPromptText = `
You are refining a tech pack based on user feedback. Here is the current tech pack data:
${JSON.stringify(techPack, null, 2)}

User refinement request: ${refinementPrompt}

Return updated tech pack data as valid JSON with the same structure as the original.
Only modify fields relevant to the user's request. Keep all other fields unchanged.
Return ONLY the JSON object, no markdown or explanations.
`;

    const completion = await aiProvider.complete({
      messages: [
        {
          role: "system",
          content: "You are an expert fashion designer refining tech packs based on user feedback.",
        },
        {
          role: "user",
          content: refinementPromptText,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const parsed = validateTechPackOutput(completion.content);

    const { data: updatedTechPack, error: updateError } = await supabase
      .from("tech_packs")
      .update({
        garment_type: parsed.garment_overview.garment_type,
        measurements: parsed.measurements as unknown as Record<string, unknown>,
        bom: parsed.bill_of_materials as unknown as Record<string, unknown>,
        construction_notes:
          parsed.construction_details?.stitching_suggestions?.join(". ") ||
          parsed.construction_details?.finishing_suggestions?.join(". ") ||
          null,
      })
      .eq("id", techPackId)
      .select()
      .single();

    if (updateError) {
      return errorResult(updateError.message || "Failed to update tech pack", "supabase_error");
    }

    return successResult(updatedTechPack as TechPack);
  } catch (err) {
    const aiError = extractAIError(err);
    return errorResult(aiError.message, aiError.code ?? "unknown_error", aiError.details);
  }
}

/**
 * Validates AI-generated tech pack data against Zod schemas.
 * Returns validation result with any errors.
 */
export function validateTechPackOutputSafe(
  rawOutput: unknown
): {
  valid: boolean;
  data: AIGeneratedTechPack | null;
  error: string | null;
} {
  try {
    const parsed = validateTechPackOutput(rawOutput);
    return { valid: true, data: parsed, error: null };
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}

export { getAIProvider, isAIConfigured, isAIAvailable, AIConfigurationError };
