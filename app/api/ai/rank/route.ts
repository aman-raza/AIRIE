import { rankCandidates } from "../../../../lib/ai/ranking";

export async function POST(request: Request) {
  const body = await request.json();
  const ranked = rankCandidates({
    candidates: body.candidates ?? [],
    jobSkills: body.jobSkills ?? [],
    preferredYears: body.preferredYears ?? 0,
  });

  return Response.json({ candidates: ranked });
}
