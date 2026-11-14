/**
 * FashionTech AI - OpenAI Provider
 *
 * OpenAI-compatible AI provider implementation.
 * Supports OpenAI API and any OpenAI-compatible endpoint (Azure OpenAI,
 * local LLMs via llama.cpp, Ollama, etc.).
 */

import { BaseAIProvider } from "@/lib/ai/providers/base";
import { AIProvider, AICompletionRequest, AICompletionResponse } from "@/lib/ai/types";
import { AIAuthenticationError, AIRateLimitError, AITimeoutError, AIInvalidResponseError } from "@/lib/ai/errors";

export class OpenAIProvider extends BaseAIProvider implements AIProvider {
  public readonly name = "openai" as const;

  constructor(config: {
    apiKey: string;
    baseURL?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    maxRetries?: number;
  }) {
    super({
      name: "openai",
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://api.openai.com/v1",
      model: config.model || "gpt-4o-mini",
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeoutMs: config.timeoutMs,
      maxRetries: config.maxRetries,
    });
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const url = `${this.baseURL}/chat/completions`;

    const body: Record<string, unknown> = {
      model: request.model || this.model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: request.temperature ?? this.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? this.maxTokens ?? 2000,
      stream: request.stream ?? false,
    };

    if (request.response_format) {
      body.response_format = request.response_format;
    }

    const response = await this.fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    return this.parseResponse(response);
  }
}
