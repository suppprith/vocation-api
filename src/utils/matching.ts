import type { IJob } from "../models/job.model.js";
import type { IResumeData } from "../models/resume-data.model.js";
import type { IHolisticProfile } from "../models/holistic-profile.model.js";
import type { ICareerPreferences } from "../models/career-preferences.model.js";

export interface MatchResult {
  matchScore: number; // 0–100
  matchReason: string; // 1–2 sentence explanation
}

interface UserProfile {
  resumeData: IResumeData | null;
  holisticProfile: IHolisticProfile | null;
  careerPreferences: ICareerPreferences | null;
}

// ── Sub-score calculators ────────────────────────────────────────────

function skillOverlapScore(userSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0) return 0.5; // No skills listed → neutral
  const userLower = userSkills.map((s) => s.toLowerCase());
  const matches = jobSkills.filter((s) => userLower.includes(s.toLowerCase()));
  return matches.length / jobSkills.length;
}

function roleRelevanceScore(targetRoles: string[], jobTitle: string): number {
  if (targetRoles.length === 0) return 0;
  const titleLower = jobTitle.toLowerCase();
  for (const role of targetRoles) {
    const roleLower = role.toLowerCase();
    // Check if any words from the target role appear in the job title
    const words = roleLower.split(/\s+/);
    const matchCount = words.filter((w) => titleLower.includes(w)).length;
    if (matchCount / words.length >= 0.5) return 1.0;
  }
  return 0;
}

function exactMatchScore(userValues: string[], jobValue: string): number {
  if (userValues.length === 0) return 0.5; // No pref → neutral
  return userValues.includes(jobValue) ? 1.0 : 0;
}

function salaryFitScore(
  userMin: number | null,
  userMax: number | null,
  jobMin: number | null,
  jobMax: number | null,
): number {
  // If either side has no salary data, return neutral
  if (
    (userMin == null && userMax == null) ||
    (jobMin == null && jobMax == null)
  )
    return 0.5;

  const uMin = userMin ?? 0;
  const uMax = userMax ?? Infinity;
  const jMin = jobMin ?? 0;
  const jMax = jobMax ?? Infinity;

  // Check overlap
  const overlapStart = Math.max(uMin, jMin);
  const overlapEnd = Math.min(uMax, jMax);

  if (overlapStart > overlapEnd) return 0; // No overlap

  // Partial overlap → score proportionally
  const jobRange = (jMax === Infinity ? jMin * 2 : jMax) - jMin || 1;
  const overlap = overlapEnd - overlapStart;
  return Math.min(overlap / jobRange, 1.0);
}

function passionAlignmentScore(
  passions: string[],
  jobIndustry: string,
): number {
  if (passions.length === 0) return 0;
  const industryLower = jobIndustry.toLowerCase();
  // Direct match
  if (passions.some((p) => p.toLowerCase() === industryLower)) return 1.0;
  // Partial keyword match
  if (
    passions.some(
      (p) =>
        industryLower.includes(p.toLowerCase()) ||
        p.toLowerCase().includes(industryLower),
    )
  ) {
    return 0.6;
  }
  return 0;
}

// ── Main scoring function ────────────────────────────────────────────

export function computeMatchScore(
  job: IJob,
  profile: UserProfile,
): MatchResult {
  // If user has no profile data at all, return 0
  if (
    !profile.resumeData &&
    !profile.holisticProfile &&
    !profile.careerPreferences
  ) {
    return {
      matchScore: 0,
      matchReason: "Complete your profile to see personalized match scores.",
    };
  }

  const skills = profile.resumeData?.skills ?? [];
  const prefs = profile.careerPreferences;
  const holistic = profile.holisticProfile;

  // Calculate sub-scores
  const scores = {
    skillOverlap: skillOverlapScore(skills, job.skills),
    roleRelevance: roleRelevanceScore(prefs?.targetRoles ?? [], job.title),
    industryMatch: exactMatchScore(
      prefs?.preferredIndustries ?? [],
      job.industry,
    ),
    arrangementMatch: exactMatchScore(
      prefs?.workArrangement ?? [],
      job.workArrangement,
    ),
    employmentType: exactMatchScore(
      prefs?.employmentType ?? [],
      job.employmentType,
    ),
    companySize: exactMatchScore(prefs?.companySize ?? [], job.companySize),
    salaryFit: salaryFitScore(
      prefs?.salaryMin ?? null,
      prefs?.salaryMax ?? null,
      job.salaryMin,
      job.salaryMax,
    ),
    passionAlignment: passionAlignmentScore(
      holistic?.passions ?? [],
      job.industry,
    ),
    workStyle: 0.5, // Flat neutral — no job-side work style data yet
  };

  // Weighted total
  const matchScore = Math.round(
    (scores.skillOverlap * 0.3 +
      scores.roleRelevance * 0.15 +
      scores.industryMatch * 0.1 +
      scores.arrangementMatch * 0.1 +
      scores.employmentType * 0.05 +
      scores.companySize * 0.05 +
      scores.salaryFit * 0.1 +
      scores.passionAlignment * 0.1 +
      scores.workStyle * 0.05) *
      100,
  );

  // Generate match reason from top factors
  const matchReason = generateMatchReason(scores, job, profile);

  return { matchScore, matchReason };
}

// ── Match reason generator ───────────────────────────────────────────

function generateMatchReason(
  scores: Record<string, number>,
  job: IJob,
  profile: UserProfile,
): string {
  const reasons: { score: number; text: string }[] = [];

  if (scores.skillOverlap >= 0.6) {
    const userSkills = profile.resumeData?.skills ?? [];
    const matching = job.skills.filter((s) =>
      userSkills.some((us) => us.toLowerCase() === s.toLowerCase()),
    );
    if (matching.length > 0) {
      reasons.push({
        score: scores.skillOverlap,
        text: `Strong overlap with your ${matching.slice(0, 3).join(", ")} skills`,
      });
    }
  } else if (scores.skillOverlap > 0 && scores.skillOverlap < 0.6) {
    reasons.push({
      score: scores.skillOverlap,
      text: "Some skill match with your profile",
    });
  }

  if (scores.roleRelevance >= 0.8) {
    reasons.push({
      score: scores.roleRelevance,
      text: `Matches your target role preferences`,
    });
  }

  if (scores.industryMatch >= 0.8) {
    reasons.push({
      score: scores.industryMatch,
      text: `${job.industry} aligns with your preferred industries`,
    });
  }

  if (scores.arrangementMatch >= 0.8) {
    reasons.push({
      score: scores.arrangementMatch,
      text: `${job.workArrangement} matches your work arrangement preference`,
    });
  }

  if (scores.salaryFit >= 0.7) {
    reasons.push({
      score: scores.salaryFit,
      text: "Salary range aligns with your expectations",
    });
  }

  if (scores.passionAlignment >= 0.6) {
    reasons.push({
      score: scores.passionAlignment,
      text: `Aligns with your passion for ${job.industry}`,
    });
  }

  // Sort by score and pick top 2–3
  reasons.sort((a, b) => b.score - a.score);
  const topReasons = reasons.slice(0, 3);

  if (topReasons.length === 0) {
    return "This job has some potential alignment with your profile.";
  }

  return topReasons.map((r) => r.text).join(". ") + ".";
}

// ── Batch scoring helper ─────────────────────────────────────────────

export function scoreJobs(
  jobs: IJob[],
  profile: UserProfile,
): (IJob & { matchScore: number; matchReason: string })[] {
  return jobs.map((job) => {
    const { matchScore, matchReason } = computeMatchScore(job, profile);
    const jobObj =
      typeof (job as any).toJSON === "function" ? (job as any).toJSON() : job;
    return { ...jobObj, matchScore, matchReason };
  });
}
