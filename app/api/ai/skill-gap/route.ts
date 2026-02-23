import { analyzeSkillGap } from "../../../../lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json();
  const report = await analyzeSkillGap({
    candidateSkills: body.candidateSkills ?? [],
    jobRequirements: body.jobRequirements ?? [],
  });

  return Response.json(report);
}
