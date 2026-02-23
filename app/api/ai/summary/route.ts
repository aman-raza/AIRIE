import { summarizeResume } from "../../../../lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json();
  const summary = await summarizeResume(body.resume);

  return Response.json(summary);
}
