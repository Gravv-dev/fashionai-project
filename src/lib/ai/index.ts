/**
 * FashionTech AI - AI Module Index
 *
 * Re-exports all AI module components for convenient importing.
 */

// Types
export type {
  AIProvider,
  AIProviderName,
  AIProviderConfig,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
  AIGeneratedTechPack,
  AIGarmentOverview,
  AIVisualDetails,
  AIMaterials,
  AIMeasurement,
  AIBOMItem,
  AIConstructionDetails,
  AIGenerationStatus,
  AIServiceConfig,
  AIServiceError,
  ImageAnalysisRequest,
  ImageAnalysisResult,
} from "@/lib/ai/types";

// Errors
export {
  AIError,
  AIConfigurationError,
  AIAuthenticationError,
  AIRateLimitError,
  AITimeoutError,
  AIInvalidResponseError,
  AIValidationError,
  isAIError,
  extractAIError,
} from "@/lib/ai/errors";

// Providers
export {
  createAIProvider,
  createAIProviderFromEnv,
  isAIConfigured,
} from "@/lib/ai/providers/factory";

// Services
export * from "@/lib/ai/services";

// Schemas
export * from "@/lib/ai/schemas/techpack";
