/**
 * Base database service utilities for FashionTech AI.
 *
 * Provides consistent result wrappers and error helpers for all
 * database service modules.
 */

export interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: unknown;
}

export function ok<T>(data: T | null): ServiceResult<T> {
  return { data, error: null, success: true };
}

export function fail<T>(
  message: string,
  code?: string,
  details?: unknown
): ServiceResult<T> {
  return {
    data: null as unknown as T,
    error: { message, code, details },
    success: false,
  };
}

/**
 * Wraps a Supabase async call that returns { data, error } into a ServiceResult.
 */
export async function safeCall<T>(
  call: () => Promise<{ data: T | null; error: unknown }>
): Promise<ServiceResult<T | null>> {
  try {
    const { data, error } = await call();
    if (error) {
      return fail<T | null>(
        error instanceof Error ? error.message : "Database operation failed",
        "supabase_error",
        error
      );
    }
    return ok(data);
  } catch (err) {
    return fail<T | null>(
      err instanceof Error ? err.message : "Unexpected error",
      "unexpected_error",
      err
    );
  }
}
