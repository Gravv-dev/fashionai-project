/**
 * Line Sheet service for FashionTech AI.
 *
 * Handles all line-sheet-related database operations with RLS-aware queries.
 * Users can only access line sheets belonging to their own projects.
 */

import { createClient } from "@/lib/supabase";
import type { LineSheet, LineSheetInsert, LineSheetUpdate } from "@/types/database";

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
 * Fetches all line sheets for the authenticated user's projects.
 */
export async function getLineSheets() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("line_sheets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch line sheets",
      "supabase_error",
      error
    );
  }
  return successResult(data as LineSheet[] | null);
}

/**
 * Fetches a single line sheet by ID. RLS ensures project ownership.
 */
export async function getLineSheet(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("line_sheets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch line sheet",
      "supabase_error",
      error
    );
  }
  return successResult(data as LineSheet | null);
}

/**
 * Creates a new line sheet linked to a project the user owns.
 */
export async function createLineSheet(lineSheet: LineSheetInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("line_sheets")
    .insert(lineSheet)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create line sheet",
      "supabase_error",
      error
    );
  }
  return successResult(data as LineSheet | null);
}

/**
 * Updates an existing line sheet. RLS ensures project ownership.
 */
export async function updateLineSheet(id: string, updates: LineSheetUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("line_sheets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update line sheet",
      "supabase_error",
      error
    );
  }
  return successResult(data as LineSheet | null);
}

/**
 * Deletes a line sheet. RLS ensures project ownership.
 */
export async function deleteLineSheet(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { error } = await supabase.from("line_sheets").delete().eq("id", id);
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to delete line sheet",
      "supabase_error",
      error
    );
  }
  return successResult(null);
}
