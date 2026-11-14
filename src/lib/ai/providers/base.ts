/**
 * FashionTech AI - AI Provider Base
 *
 * Defines the AI provider interface and base class for AI generation.
 * Providers are responsible for making AI API calls and returning
 * structured responses. All providers must implement the AIProvider
 * interface.
 */

import { AIProvider, AICompletionRequest, AICompletionResponse, AIProviderName } from "@/lib/ai/types";
import { AIError, AITimeoutError, AIInvalidResponseError, AIAuthenticationError, AIRateLimitError } from "@/lib/ai/errors";

/**
 * Abstract base class for AI providers.
 * Handles common concerns like timeout, retries, and error normalization.
 */
export abstract class BaseAIProvider implements AIProvider {
  public readonly name: AIProviderName;
  protected readonly apiKey: string;
  protected readonly baseURL?: string;
  protected readonly model: string;
  protected readonly temperature?: number;
  protected readonly maxTokens?: number;
  protected readonly timeoutMs: number;
  protected readonly maxRetries: number;

  constructor(config: {
    name: AIProviderName;
    apiKey: string;
    baseURL?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    maxRetries?: number;
  }) {
    this.name = config.name;
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.timeoutMs = config.timeoutMs ?? 60000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Complete a chat completion request.
   * Subclasses must implement the actual API call.
   */
  abstract complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Make an HTTP request with timeout and retry logic.
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    retriesRemaining: number = this.maxRetries
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new AITimeoutError(
          `Request timed out after ${this.timeoutMs}ms`,
          { provider: this.name, model: this.model }
        );
      }

      // Retry on transient errors
      if (retriesRemaining > 0) {
        return this.fetchWithRetry(url, options, retriesRemaining - 1);
      }

      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle API response errors and convert to AIError.
   */
  protected handleResponseError(response: Response, context: { provider: string; model: string }): AIError {
    const status = response.status;

    if (status === 401 || status === 403) {
      return new AIAuthenticationError(
        "Authentication failed. Check your API key.",
        { provider: context.provider, model: context.model, status }
      );
    }

    if (status === 429) {
      return new AIRateLimitError(
        "Rate limit exceeded. Please try again later.",
        { provider: context.provider, model: context.model, status },
        true
      );
    }

    if (status >= 500) {
      return new AIError(
        "unknown_error",
        `Server error (${status}). Please try again later.`,
        { details: { provider: context.provider, model: context.model, status }, retryable: true }
      );
    }

    return new AIError(
      "unknown_error",
      `Request failed with status ${status}`,
      { details: { provider: context.provider, model: context.model, status }, retryable: false }
    );
  }

  /**
   * Parse and validate the AI response.
   */
  protected async parseResponse(response: Response): Promise<AICompletionResponse> {
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      throw this.handleResponseError(response, { provider: this.name, model: this.model });
    }

    if (!contentType.includes("application/json")) {
      throw new AIInvalidResponseError(
        "Unexpected response content type from AI provider",
        { provider: this.name, model: this.model, contentType }
      );
    }

    const data = await response.json();

    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new AIInvalidResponseError(
        "AI response missing choices array",
        { provider: this.name, model: this.model, response: data }
      );
    }

    const choice = data.choices[0];
    const content = choice.message?.content || choice.text || "";

    if (!content || typeof content !== "string") {
      throw new AIInvalidResponseError(
        "AI response missing content",
        { provider: this.name, model: this.model, choice }
      );
    }

    return {
      content,
      model: data.model || this.model,
      usage: data.usage,
      finish_reason: choice.finish_reason,
    };
  }
}
