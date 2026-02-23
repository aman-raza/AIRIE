import { generateInterviewQuestions } from "../../../../lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json();
  const questions = await generateInterviewQuestions({
    role: body.role,
    level: body.level,
    skills: body.skills ?? [],
  });

  return Response.json(questions);
}
