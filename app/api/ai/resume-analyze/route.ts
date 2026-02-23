import { scoreResume, summarizeResume } from "../../../../lib/ai/service";
import { sanitizeText } from "../../../../lib/ai/validation";
import { extractResumeText } from "../../../../lib/resume-extractor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (!(file instanceof File)) {
      return Response.json({ error: "Missing resume file." }, { status: 400 });
    }

    const text = await extractResumeText(file);
    const cleanText = sanitizeText(text);

    const [summary, score] = await Promise.all([
      summarizeResume(cleanText),
      typeof jobDescription === "string" && jobDescription.trim()
        ? scoreResume({ resume: cleanText, job: jobDescription })
        : Promise.resolve(null),
    ]);

    return Response.json({
      fileName: file.name,
      extractedText: cleanText,
      summary,
      score,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze the uploaded resume.";
    return Response.json({ error: message }, { status: 500 });
  }
}
