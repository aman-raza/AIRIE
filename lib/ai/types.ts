export type FitRecommendation = "Strong Fit" | "Moderate" | "Weak";

export interface ResumeScoreReport {
  score: number;
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: FitRecommendation;
  reason: string;
}

export interface SkillGapReport {
  missing_skills: string[];
  recommended_learning: string[];
  estimated_weeks_to_learn: number;
}

export interface InterviewQuestionSet {
  technical: string[];
  behavioral: string[];
  scenario: string[];
}

export interface CandidateRankingInput {
  candidateId: string;
  aiScore: number;
  yearsExperience: number;
  resumeSkills: string[];
}

export interface RankedCandidate extends CandidateRankingInput {
  finalScore: number;
  explanation: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  threshold: number;
}
