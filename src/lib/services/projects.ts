/**
 * Project service for FashionTech AI.
 *
 * Handles all project-related database operations with RLS-aware queries.
 * Users can only access their own projects.
 */

import { createClient } from "@/lib/supabase";
import type { Project, ProjectInsert, ProjectUpdate } from "@/types/database";

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
 * Fetches all projects for the authenticated user, ordered by updated_at desc.
 */
export async function getProjects() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch projects",
      "supabase_error",
      error
    );
  }
  return successResult(data as Project[] | null);
}

/**
 * Fetches a single project by ID. RLS ensures the user owns it.
 */
export async function getProject(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch project",
      "supabase_error",
      error
    );
  }
  return successResult(data as Project | null);
}

/**
 * Creates a new project for the authenticated user.
 */
export async function createProject(project: ProjectInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create project",
      "supabase_error",
      error
    );
  }
  return successResult(data as Project | null);
}

/**
 * Updates an existing project. RLS ensures ownership.
 */
export async function updateProject(id: string, updates: ProjectUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update project",
      "supabase_error",
      error
    );
  }
  return successResult(data as Project | null);
}

/**
 * Deletes a project. RLS ensures ownership; cascades to related records.
 */
export async function deleteProject(id: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to delete project",
      "supabase_error",
      error
    );
  }
  return successResult(null);
}
