import OpenAI from "openai";
import { getEnvVar } from "../env";

export interface AIRunOptions {
  cacheKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  fallbackResponse?: string;
}

const cache = new Map<string, string>();

function getClient() {
  const apiKey = getEnvVar("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export async function runAI(prompt: string, options: AIRunOptions = {}): Promise<string> {
  if (options.cacheKey && cache.has(options.cacheKey)) {
    return cache.get(options.cacheKey)!;
  }

  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: options.model ?? getEnvVar("AI_MODEL") ?? "gpt-4o-mini",
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const output = response.choices[0]?.message?.content?.trim();
    if (!output) {
      throw new Error("Empty AI response");
    }

    if (options.cacheKey) {
      cache.set(options.cacheKey, output);
    }

    return output;
  } catch (error) {
    if (options.fallbackResponse) {
      return options.fallbackResponse;
    }

    throw error;
  }
}

export function clearAICache() {
  cache.clear();
}
