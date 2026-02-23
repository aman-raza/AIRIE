import { detectDuplicateCandidate, embed } from "../../../../lib/ai/embeddings";

export async function POST(request: Request) {
  const body = await request.json();
  const currentEmbedding = await embed(body.resumeText ?? "");

  const report = detectDuplicateCandidate(
    currentEmbedding,
    body.existingEmbeddings ?? [],
    body.threshold ?? 0.92,
  );

  return Response.json(report);
}
