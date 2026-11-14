/**
 * FashionTech AI - Supabase Client Configuration
 *
 * Provides browser and server Supabase clients with graceful degradation
 * when environment variables are not set. Service-role keys are never
 * exposed to frontend code.
 */

import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether Supabase is configured with real credentials.
 * Falls back to mock behavior in development without credentials.
 */
export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Creates a Supabase client for the browser or server.
 * Returns null when Supabase is not configured.
 */
export function createClient() {
  if (!isConfigured) {
    return null;
  }
  if (typeof window !== "undefined") {
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get() {
        return undefined;
      },
    },
  });
}

/**
 * Creates a Supabase server client with cookie handling for Next.js
 * Server Components and Route Handlers.
 */
export function createServerSupabaseClient(cookies: {
  get: (name: string) => string | undefined;
  set?: (name: string, value: string, options?: unknown) => void;
  remove?: (name: string, options?: unknown) => void;
}) {
  if (!isConfigured) {
    return null;
  }
  return createServerClient(supabaseUrl!, supabaseAnonKey!, { cookies });
}

/**
 * Creates a Supabase browser client for Client Components.
 */
export function createBrowserSupabaseClient() {
  if (!isConfigured || typeof window === "undefined") {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Validates that required Supabase environment variables are set.
 * Throws a descriptive error if missing.
 */
export function validateSupabaseConfig() {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(", ")}. ` +
        "Set these in .env.local or your deployment environment."
    );
  }
}
