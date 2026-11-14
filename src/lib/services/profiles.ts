/**
 * Profile service for FashionTech AI.
 *
 * Handles all profile-related database operations with RLS-aware queries.
 * Users can only access their own profiles.
 */

import { createClient } from "@/lib/supabase";
import type { Profile, ProfileInsert, ProfileUpdate } from "@/types/database";

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
 * Fetches the authenticated user's profile.
 * Requires an authenticated Supabase session (RLS enforces ownership).
 */
export async function getProfile() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResult("Not authenticated", "not_authenticated");
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch profile",
      "supabase_error",
      error
    );
  }
  return successResult(data as Profile | null);
}

/**
 * Creates a new profile for the authenticated user.
 * Called after successful sign-up.
 */
export async function createProfile(profile: ProfileInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create profile",
      "supabase_error",
      error
    );
  }
  return successResult(data as Profile | null);
}

/**
 * Updates the authenticated user's profile.
 */
export async function updateProfile(updates: ProfileUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResult("Not authenticated", "not_authenticated");
  }
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update profile",
      "supabase_error",
      error
    );
  }
  return successResult(data as Profile | null);
}

/**
 * Upserts a profile (create or update). Useful after auth sign-up
 * to ensure a profile row exists.
 */
export async function upsertProfile(profile: ProfileInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to upsert profile",
      "supabase_error",
      error
    );
  }
  return successResult(data as Profile | null);
}
