/**
 * Flat Sketch service for FashionTech AI.
 *
 * Handles all flat-sketch-related database operations with RLS-aware queries.
 * Users can only access flat sketches belonging to their own projects.
 */

import { createClient } from "@/lib/supabase";
import type { FlatSketch, FlatSketchInsert, FlatSketchUpdate } from "@/types/database";

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
 * Fetches all flat sketches for the authenticated user's projects.
 */
export async function getFlatSketches() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("flat_sketches")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch flat sketches",
      "supabase_error",
      error
    );
  }
  return successResult(data as FlatSketch[] | null);
}

/**
 * Fetches a single flat sketch by ID. RLS ensures project ownership.
 */
export async function getFlatSketch(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("flat_sketches")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch flat sketch",
      "supabase_error",
      error
    );
  }
  return successResult(data as FlatSketch | null);
}

/**
 * Creates a new flat sketch linked to a project the user owns.
 */
export async function createFlatSketch(flatSketch: FlatSketchInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("flat_sketches")
    .insert(flatSketch)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create flat sketch",
      "supabase_error",
      error
    );
  }
  return successResult(data as FlatSketch | null);
}

/**
 * Updates an existing flat sketch. RLS ensures project ownership.
 */
export async function updateFlatSketch(id: string, updates: FlatSketchUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("flat_sketches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update flat sketch",
      "supabase_error",
      error
    );
  }
  return successResult(data as FlatSketch | null);
}

/**
 * Deletes a flat sketch. RLS ensures project ownership.
 */
export async function deleteFlatSketch(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { error } = await supabase.from("flat_sketches").delete().eq("id", id);
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to delete flat sketch",
      "supabase_error",
      error
    );
  }
  return successResult(null);
}
