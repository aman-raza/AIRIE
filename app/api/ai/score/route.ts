import { scoreResume } from "../../../../lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json();
  const report = await scoreResume({ resume: body.resume, job: body.job });

  return Response.json(report);
}
