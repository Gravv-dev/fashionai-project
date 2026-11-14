/**
 * FashionTech AI - Server Actions for AI Tech Pack Generation
 *
 * All AI generation happens server-side to keep API keys secure.
 * Clients never see AI API keys.
 */

"use server";

import { createClient } from "@/lib/supabase";
import {
  generateTechPackFromImage,
  getAIProvider,
  isAIConfigured,
} from "@/lib/ai/services";
import { createAIProviderFromEnv } from "@/lib/ai/providers/factory";
import type { TechPack } from "@/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

async function getClient(): Promise<SupabaseClient | null> {
  return createClient();
}

/**
 * Generate a tech pack from a garment reference image using AI.
 *
 * This is a server action - all AI processing happens server-side.
 * API keys never reach the browser.
 */
export async function generateAITechPack(
  imagePath: string,
  projectId: string,
  userId: string
): Promise<{
  data: { techPackId: string; techPack: TechPack } | null;
  error: { message: string } | null;
  success: boolean;
}> {
  const supabase = await getClient();
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase not configured" },
      success: false,
    };
  }

  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return {
      data: null,
      error: { message: "Not authenticated" },
      success: false,
    };
  }

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return {
      data: null,
      error: { message: "Project not found or unauthorized" },
      success: false,
    };
  }

  // Call the AI service
  const result = await generateTechPackFromImage(imagePath, projectId, userId);

  if (!result.success || !result.data) {
    return {
      data: null,
      error: { message: result.error?.message || "AI generation failed" },
      success: false,
    };
  }

  return {
    data: {
      techPackId: result.data.id,
      techPack: result.data,
    },
    error: null,
    success: true,
  };
}

/**
 * Check if AI is configured and available.
 */
export async function isAIConfiguredAction(): Promise<{ configured: boolean }> {
  return { configured: isAIConfigured() };
}
