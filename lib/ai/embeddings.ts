import OpenAI from "openai";
import { getEnvVar } from "../env";
import { sanitizeText } from "./validation";
import { DuplicateCheckResult } from "./types";

function getClient() {
  const apiKey = getEnvVar("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

export async function embed(text: string): Promise<number[]> {
  const client = getClient();
  const response = await client.embeddings.create({
    model: getEnvVar("AI_EMBEDDING_MODEL") ?? "text-embedding-3-small",
    input: sanitizeText(text),
  });

  return response.data[0]?.embedding ?? [];
}

export function cosineSimilarity(vec1: number[], vec2: number[]) {
  if (!vec1.length || !vec2.length || vec1.length !== vec2.length) {
    return 0;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vec1.length; i += 1) {
    dot += vec1[i] * vec2[i];
    magnitudeA += vec1[i] * vec1[i];
    magnitudeB += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (!denominator) {
    return 0;
  }

  return dot / denominator;
}

export function detectDuplicateCandidate(
  embedding: number[],
  existingEmbeddings: number[][],
  threshold = 0.92,
): DuplicateCheckResult {
  const bestSimilarity = existingEmbeddings.reduce((best, current) => {
    return Math.max(best, cosineSimilarity(embedding, current));
  }, 0);

  return {
    isDuplicate: bestSimilarity > threshold,
    similarity: Math.round(bestSimilarity * 10000) / 10000,
    threshold,
  };
}
