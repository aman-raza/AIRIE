import { draftRecruiterEmail } from "../../../../lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json();
  const email = await draftRecruiterEmail({
    purpose: body.purpose,
    tone: body.tone,
    name: body.name,
    role: body.role,
    extra: body.extra,
  });

  return Response.json(email);
}
