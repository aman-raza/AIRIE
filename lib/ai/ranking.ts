import { CandidateRankingInput, RankedCandidate } from "./types";
import { clampScore } from "./validation";

export function calculateSkillOverlap(resumeSkills: string[], jobSkills: string[]) {
  if (jobSkills.length === 0) {
    return 0;
  }

  const normalizedResume = new Set(resumeSkills.map((skill) => skill.toLowerCase().trim()));
  const overlapCount = jobSkills.reduce((count, skill) => {
    return normalizedResume.has(skill.toLowerCase().trim()) ? count + 1 : count;
  }, 0);

  return overlapCount / jobSkills.length;
}

export function calculateExperienceScore(yearsExperience: number, preferredYears: number) {
  if (preferredYears <= 0) {
    return 100;
  }

  const ratio = Math.min(yearsExperience / preferredYears, 1);
  return Math.round(ratio * 100);
}

export function rankCandidates(input: {
  candidates: CandidateRankingInput[];
  jobSkills: string[];
  preferredYears: number;
}): RankedCandidate[] {
  return input.candidates
    .map((candidate) => {
      const experienceScore = calculateExperienceScore(candidate.yearsExperience, input.preferredYears);
      const skillOverlap = calculateSkillOverlap(candidate.resumeSkills, input.jobSkills) * 100;
      const finalScore =
        candidate.aiScore * 0.5 +
        experienceScore * 0.2 +
        skillOverlap * 0.3;

      const roundedFinalScore = Math.round(clampScore(finalScore) * 100) / 100;

      return {
        ...candidate,
        finalScore: roundedFinalScore,
        explanation: `AI score (${candidate.aiScore}) * 0.5 + experience (${experienceScore}) * 0.2 + skill overlap (${Math.round(
          skillOverlap,
        )}) * 0.3`,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}
