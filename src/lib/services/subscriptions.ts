/**
 * Subscription service for FashionTech AI.
 *
 * Handles all subscription-related database operations with RLS-aware queries.
 * Users can only access their own subscription records.
 */

import { createClient } from "@/lib/supabase";
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
} from "@/types/database";

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
 * Fetches the authenticated user's subscription.
 */
export async function getSubscription() {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResult("Not authenticated", "not_authenticated");
  }
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to fetch subscription",
      "supabase_error",
      error
    );
  }
  return successResult(data as Subscription | null);
}

/**
 * Creates a new subscription for the authenticated user.
 */
export async function createSubscription(subscription: SubscriptionInsert) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(subscription)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to create subscription",
      "supabase_error",
      error
    );
  }
  return successResult(data as Subscription | null);
}

/**
 * Updates the authenticated user's subscription.
 */
export async function updateSubscription(updates: SubscriptionUpdate) {
  const supabase = await getClient();
  if (!supabase) {
    return errorResult("Supabase not configured", "supabase_not_configured");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return errorResult("Not authenticated", "not_authenticated");
  }
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) {
    return errorResult(
      error instanceof Error ? error.message : "Failed to update subscription",
      "supabase_error",
      error
    );
  }
  return successResult(data as Subscription | null);
}
