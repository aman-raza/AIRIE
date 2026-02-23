import { runAI } from "./engine";
import {
  buildEmailDraftPrompt,
  buildInterviewQuestionsPrompt,
  buildResumeScoringPrompt,
  buildSkillGapPrompt,
  buildSummaryPrompt,
} from "./prompts";
import {
  EmailDraft,
  InterviewQuestionSet,
  ResumeScoreReport,
  SkillGapReport,
} from "./types";
import { safeJSONParse } from "./validation";

export async function scoreResume(params: { resume: unknown; job: unknown }) {
  const prompt = buildResumeScoringPrompt(params);
  const raw = await runAI(prompt, {
    cacheKey: `score:${JSON.stringify(params)}`,
    fallbackResponse: JSON.stringify({
      score: null,
      matching_skills: [],
      missing_skills: [],
      strengths: [],
      weaknesses: [],
      recommendation: "Weak",
      reason: "AI unavailable",
    }),
  });

  return safeJSONParse<ResumeScoreReport>(raw, {
    score: 0,
    matching_skills: [],
    missing_skills: [],
    strengths: [],
    weaknesses: [],
    recommendation: "Weak",
    reason: "AI parsing failed",
  });
}

export async function generateInterviewQuestions(params: {
  role: string;
  level: string;
  skills: string[];
}) {
  const raw = await runAI(buildInterviewQuestionsPrompt(params), {
    cacheKey: `questions:${JSON.stringify(params)}`,
    fallbackResponse: JSON.stringify({ technical: [], behavioral: [], scenario: [] }),
  });

  return safeJSONParse<InterviewQuestionSet>(raw, {
    technical: [],
    behavioral: [],
    scenario: [],
  });
}

export async function summarizeResume(resume: unknown) {
  const raw = await runAI(buildSummaryPrompt(resume), {
    cacheKey: `summary:${JSON.stringify(resume)}`,
    fallbackResponse: JSON.stringify({ summary_bullets: ["AI unavailable"] }),
  });

  return safeJSONParse<{ summary_bullets: string[] }>(raw, {
    summary_bullets: ["AI parsing failed"],
  });
}

export async function draftRecruiterEmail(params: {
  purpose: string;
  tone: "formal" | "casual" | "friendly";
  name: string;
  role: string;
  extra?: string;
}) {
  const raw = await runAI(buildEmailDraftPrompt(params), {
    cacheKey: `email:${JSON.stringify(params)}`,
    fallbackResponse: JSON.stringify({
      subject: "AI unavailable",
      body: "Unable to draft email. Please try again.",
    }),
  });

  return safeJSONParse<EmailDraft>(raw, {
    subject: "AI parsing failed",
    body: "Unable to parse email draft",
  });
}

export async function analyzeSkillGap(params: {
  candidateSkills: string[];
  jobRequirements: string[];
}) {
  const raw = await runAI(buildSkillGapPrompt(params), {
    cacheKey: `skill-gap:${JSON.stringify(params)}`,
    fallbackResponse: JSON.stringify({
      missing_skills: [],
      recommended_learning: [],
      estimated_weeks_to_learn: 0,
    }),
  });

  return safeJSONParse<SkillGapReport>(raw, {
    missing_skills: [],
    recommended_learning: [],
    estimated_weeks_to_learn: 0,
  });
}
