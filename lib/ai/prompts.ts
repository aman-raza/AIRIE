import { sanitizeText } from "./validation";

export function buildResumeScoringPrompt(input: { resume: unknown; job: unknown }) {
  const safeResume = sanitizeText(JSON.stringify(input.resume));
  const safeJob = sanitizeText(JSON.stringify(input.job));

  return `You are an ATS evaluator.

Compare candidate resume and job description.

Return JSON only:
{
  "score": number,
  "matching_skills": string[],
  "missing_skills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "recommendation": "Strong Fit" | "Moderate" | "Weak",
  "reason": string
}

Resume:
${safeResume}

Job:
${safeJob}`;
}

export function buildInterviewQuestionsPrompt(input: {
  role: string;
  level: string;
  skills: string[];
}) {
  return `Generate 7 interview questions.

Role: ${sanitizeText(input.role)}
Difficulty: ${sanitizeText(input.level)}
Skills: ${sanitizeText(input.skills.join(", "))}

Return JSON:
{
  "technical": string[],
  "behavioral": string[],
  "scenario": string[]
}`;
}

export function buildSummaryPrompt(resume: unknown) {
  return `Summarize candidate resume for recruiter.

Rules:
- Max 5 bullet points
- Highlight strongest skills first
- Include experience years
- Include best achievement
- Avoid fluff

Resume:
${sanitizeText(JSON.stringify(resume))}

Return JSON only:
{
  "summary_bullets": string[]
}`;
}

export function buildEmailDraftPrompt(input: {
  purpose: string;
  tone: "formal" | "casual" | "friendly";
  name: string;
  role: string;
  extra?: string;
}) {
  return `Write professional email.

Purpose: ${sanitizeText(input.purpose)}
Tone: ${sanitizeText(input.tone)}
Candidate Name: ${sanitizeText(input.name)}
Role: ${sanitizeText(input.role)}
Details: ${sanitizeText(input.extra ?? "")}

Return JSON only:
{
  "subject": string,
  "body": string
}`;
}

export function buildSkillGapPrompt(input: { candidateSkills: string[]; jobRequirements: string[] }) {
  return `Compare candidate skills with job requirements.

Candidate skills: ${sanitizeText(input.candidateSkills.join(", "))}
Job requirements: ${sanitizeText(input.jobRequirements.join(", "))}

Return JSON only:
{
  "missing_skills": string[],
  "recommended_learning": string[],
  "estimated_weeks_to_learn": number
}`;
}
