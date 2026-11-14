/**
 * FashionTech AI - AI Provider Factory
 *
 * Factory for creating AI provider instances based on configuration.
 * Supports OpenAI provider with extensible architecture for additional
 * providers (Anthropic, Google, etc.).
 */

import { AIProvider } from "@/lib/ai/types";
import { BaseAIProvider } from "@/lib/ai/providers/base";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { AIConfigurationError } from "@/lib/ai/errors";

/**
 * Configuration for creating an AI provider.
 */
export interface AIProviderConfig {
  provider: "openai";
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Creates an AI provider instance based on configuration.
 *
 * @param config - Provider configuration
 * @returns Configured AI provider instance
 * @throws AIConfigurationError if provider type is unsupported or API key is missing
 */
export function createAIProvider(config: AIProviderConfig): AIProvider {
  if (!config.apiKey) {
    throw new AIConfigurationError(
      "AI provider API key is required. Set NEXT_PUBLIC_AI_API_KEY or AI_API_KEY environment variable."
    );
  }

  switch (config.provider) {
    case "openai":
      return new OpenAIProvider({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        timeoutMs: config.timeoutMs,
        maxRetries: config.maxRetries,
      });
    default:
      throw new AIConfigurationError(
        `Unsupported AI provider: ${config.provider as string}. Supported providers: openai`
      );
  }
}

/**
 * Creates an AI provider from environment variables.
 * Reads configuration from process.env.
 *
 * Environment variables:
 *   AI_PROVIDER - AI provider name (default: "openai")
 *   AI_API_KEY - API key for the AI provider
 *   AI_BASE_URL - Optional base URL for the API
 *   AI_MODEL - Model name (default: "gpt-4o-mini")
 *   AI_TEMPERATURE - Sampling temperature (default: 0.7)
 *   AI_MAX_TOKENS - Maximum tokens per response
 *   AI_TIMEOUT_MS - Request timeout in milliseconds (default: 60000)
 *   AI_MAX_RETRIES - Maximum retry attempts (default: 3)
 *
 * @returns Configured AI provider or null if not configured
 */
export function createAIProviderFromEnv(): AIProvider | null {
  const provider = (process.env.AI_PROVIDER as "openai" | undefined) || "openai";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return createAIProvider({
    provider,
    apiKey,
    baseURL: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL || "gpt-4o-mini",
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS, 10) : undefined,
    timeoutMs: process.env.AI_TIMEOUT_MS ? parseInt(process.env.AI_TIMEOUT_MS, 10) : 60000,
    maxRetries: process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES, 10) : 3,
  });
}

/**
 * Checks if AI is configured with valid environment variables.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}
