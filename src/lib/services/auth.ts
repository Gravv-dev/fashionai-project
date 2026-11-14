/**
 * Authentication service for FashionTech AI.
 *
 * Handles signup, login, logout, password recovery, and profile
 * synchronization with Supabase Auth. Uses RLS-aware database
 * operations through the profiles service.
 */

import { createClient } from "@/lib/supabase";
import type { ProfileInsert } from "@/types/database";
import { upsertProfile } from "@/lib/services/profiles";

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
 * Sign up a new user with email and password.
 * Creates a matching profile record after successful auth signup.
 * Prevents duplicate profile creation via upsert.
 */
export async function signUp(data: {
  email: string;
  password: string;
  fullName: string;
  brandName?: string | null;
}) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        brand_name: data.brandName || null,
        role: "designer",
      },
    },
  });

  if (authError) {
    return errorResult(
      authError instanceof Error ? authError.message : "Sign up failed",
      "auth_error",
      authError
    );
  }

  // If email confirmation is not required, user is authenticated immediately
  // and we can create the profile. If confirmation is required, the profile
  // will be created when the user confirms their email and signs in.
  if (authData.user && !authData.user.email_confirmed_at) {
    // Email confirmation required - user needs to verify before profile creation
    return successResult({
      user: authData.user,
      requiresConfirmation: true,
    });
  }

  if (authData.user) {
    // Create profile for the new user (upsert prevents duplicates)
    const profileData: ProfileInsert = {
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      brand_name: data.brandName || null,
      role: "designer",
      sizing_system: "CM",
      size_range: "XS to XL",
    };

    const profileResult = await upsertProfile(profileData);
    if (!profileResult.success) {
      // Profile creation failed but auth succeeded - log and continue
      // The profile can be created later via the settings page
      return successResult({
        user: authData.user,
        requiresConfirmation: false,
        profileWarning: profileResult.error?.message,
      });
    }

    return successResult({
      user: authData.user,
      requiresConfirmation: false,
    });
  }

  return errorResult("Sign up completed but no user returned", "auth_error");
}

/**
 * Sign in a user with email and password.
 * On success, ensures a profile record exists for the user.
 */
export async function signIn(data: { email: string; password: string }) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (authError) {
    return errorResult(
      authError instanceof Error ? authError.message : "Sign in failed",
      "auth_error",
      authError
    );
  }

  if (authData.user) {
    // Ensure profile exists (upsert prevents duplicates)
    const profileResult = await upsertProfile({
      id: authData.user.id,
      email: authData.user.email ?? data.email,
      full_name: authData.user.user_metadata?.full_name || null,
      brand_name: authData.user.user_metadata?.brand_name || null,
      role: ((authData.user.user_metadata?.role as "designer" | "admin" | "viewer") || "designer"),
      sizing_system: "CM",
      size_range: "XS to XL",
    });

    if (!profileResult.success) {
      // Profile sync failed but auth succeeded
      return successResult({
        user: authData.user,
        profileWarning: profileResult.error?.message,
      });
    }

    return successResult({ user: authData.user });
  }

  return errorResult("Sign in completed but no user returned", "auth_error");
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Sign out failed",
      "auth_error",
      error
    );
  }

  return successResult(null);
}

/**
 * Request a password reset email.
 * Sends a recovery link to the user's email address.
 */
export async function requestPasswordReset(email: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || window.location.origin}/reset-password`,
  });

  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to send reset email",
      "auth_error",
      error
    );
  }

  return successResult({
    message:
      "If an account exists for this email, you will receive a password reset link.",
  });
}

/**
 * Reset the user's password using a recovery token from the URL.
 * Called from the reset-password page after email confirmation link click.
 */
export async function resetPassword(token: string, newPassword: string) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Password reset failed",
      "auth_error",
      error
    );
  }

  return successResult(null);
}

/**
 * Get the current authenticated user session.
 */
export async function getSession() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to get session",
      "auth_error",
      error
    );
  }

  return successResult(session);
}
