/**
 * Tech Pack service for FashionTech AI.
 *
 * Handles all tech-pack-related database operations with RLS-aware queries.
 * Users can only access tech packs belonging to their own projects.
 */

import { createClient } from "@/lib/supabase";
import type { TechPack, TechPackInsert, TechPackUpdate } from "@/types/database";

type SupabaseClient = ReturnType<typeof createClient>;

async function getClient(): Promise<SupabaseClient | null> {
  return createClient();
}

function errorResult(message: string, code?: string, details?: unknown) {
  return {
    data: null,
    error: { message, code, details },
    success: false,
  } as const;
}

function successResult<T>(data: T) {
  return { data, error: null, success: true } as const;
}

/**
 * Fetches all tech packs for the authenticated user's projects.
 */
export async function getTechPacks() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("tech_packs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch tech packs",
      "supabase_error",
      error
    );
  }
  return successResult(data as TechPack[] | null);
}

/**
 * Fetches a single tech pack by ID. RLS ensures project ownership.
 */
export async function getTechPack(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("tech_packs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch tech pack",
      "supabase_error",
      error
    );
  }
  return successResult(data as TechPack | null);
}

/**
 * Creates a new tech pack linked to a project the user owns.
 */
export async function createTechPack(techPack: TechPackInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("tech_packs")
    .insert(techPack)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create tech pack",
      "supabase_error",
      error
    );
  }
  return successResult(data as TechPack | null);
}

/**
 * Updates an existing tech pack. RLS ensures project ownership.
 */
export async function updateTechPack(id: string, updates: TechPackUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("tech_packs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update tech pack",
      "supabase_error",
      error
    );
  }
  return successResult(data as TechPack | null);
}

/**
 * Deletes a tech pack. RLS ensures project ownership.
 */
export async function deleteTechPack(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { error } = await supabase.from("tech_packs").delete().eq("id", id);
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to delete tech pack",
      "supabase_error",
      error
    );
  }
  return successResult(null);
}
