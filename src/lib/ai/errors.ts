/**
 * FashionTech AI - AI Error Types
 *
 * Standardized error types for AI service operations.
 * Provides consistent error handling across providers and services.
 */

export interface AIServiceError {
  code:
    | "ai_not_configured"
    | "authentication_error"
    | "rate_limit_error"
    | "timeout_error"
    | "invalid_response"
    | "validation_error"
    | "unknown_error";
  message: string;
  details?: unknown;
  retryable: boolean;
}

export interface AIErrorContext {
  provider?: string;
  model?: string;
  operation?: string;
  userId?: string;
  projectId?: string;
  timestamp: string;
}

export class AIError extends Error {
  public readonly code: AIServiceError["code"];
  public readonly details?: unknown;
  public readonly retryable: boolean;
  public readonly context?: AIErrorContext;

  constructor(
    code: AIServiceError["code"],
    message: string,
    options?: { details?: unknown; retryable?: boolean; context?: AIErrorContext }
  ) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.details = options?.details;
    this.retryable = options?.retryable ?? false;
    this.context = options?.context;
  }

  toServiceError(): AIServiceError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      retryable: this.retryable,
    };
  }
}

export class AIConfigurationError extends AIError {
  constructor(message: string, details?: unknown) {
    super("ai_not_configured", message, { details, retryable: false });
  }
}

export class AIAuthenticationError extends AIError {
  constructor(message: string, details?: unknown) {
    super("authentication_error", message, { details, retryable: false });
  }
}

export class AIRateLimitError extends AIError {
  constructor(message: string, details?: unknown, retryable = true) {
    super("rate_limit_error", message, { details, retryable });
  }
}

export class AITimeoutError extends AIError {
  constructor(message: string, details?: unknown) {
    super("timeout_error", message, { details, retryable: true });
  }
}

export class AIInvalidResponseError extends AIError {
  constructor(message: string, details?: unknown) {
    super("invalid_response", message, { details, retryable: false });
  }
}

export class AIValidationError extends AIError {
  constructor(message: string, details?: unknown) {
    super("validation_error", message, { details, retryable: false });
  }
}

export function isAIError(error: unknown): error is AIError {
  return error instanceof AIError;
}

export function extractAIError(error: unknown): AIServiceError {
  if (isAIError(error)) {
    return error.toServiceError();
  }
  if (error instanceof Error) {
    return {
      code: "unknown_error",
      message: error.message,
      details: undefined,
      retryable: false,
    };
  }
  return {
    code: "unknown_error",
    message: "An unknown error occurred",
    details: undefined,
    retryable: false,
  };
}
