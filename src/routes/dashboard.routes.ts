import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { ResumeData } from "../models/resume-data.model.js";
import { HolisticProfile } from "../models/holistic-profile.model.js";
import { CareerPreferences } from "../models/career-preferences.model.js";
import { PortfolioLinks } from "../models/portfolio-links.model.js";
import { scoreJobs } from "../utils/matching.js";

const dashboard = new Hono();

dashboard.use("*", authMiddleware, requireRole("job_seeker"));

// ── GET /api/dashboard ───────────────────────────────────────────────

dashboard.get("/", async (c) => {
  const userId = c.get("userId");

  // Fetch everything in parallel
  const [
    applications,
    resumeData,
    holisticProfile,
    careerPreferences,
    portfolioLinks,
    totalActiveJobs,
    allJobs,
  ] = await Promise.all([
    Application.find({ userId }).populate("jobId").sort({ updatedAt: -1 }),
    ResumeData.findOne({ userId }),
    HolisticProfile.findOne({ userId }),
    CareerPreferences.findOne({ userId }),
    PortfolioLinks.findOne({ userId }),
    Job.countDocuments({ isActive: true }),
    Job.find({ isActive: true }).limit(20), // for recommended
  ]);

  // ── Application stats ──
  const statusCounts: Record<string, number> = {
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };
  for (const app of applications) {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  }

  // ── Recent applications (last 5) ──
  const recentApplications = applications.slice(0, 5).map((app) => {
    const obj = app.toJSON();
    const job = obj.jobId as any;
    return {
      id: obj._id,
      status: obj.status,
      appliedAt: obj.appliedAt,
      updatedAt: obj.updatedAt,
      job: job
        ? {
            id: job.id || job._id,
            title: job.title,
            company: job.company,
            companyLogo: job.companyLogo,
          }
        : null,
    };
  });

  // ── Profile completion ──
  const profileCompletion = computeProfileCompletion(
    resumeData,
    holisticProfile,
    careerPreferences,
    portfolioLinks,
  );

  // ── Top recommended jobs (4) ──
  const profile = { resumeData, holisticProfile, careerPreferences };
  const scoredJobs = scoreJobs(allJobs, profile);
  scoredJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
  const recommendedJobs = scoredJobs.slice(0, 4).map((job: any) => ({
    id: job.id || job._id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo,
    location: job.location,
    workArrangement: job.workArrangement,
    matchScore: job.matchScore,
    matchReason: job.matchReason,
    salaryRange: job.salaryRange,
  }));

  return c.json({
    stats: {
      totalApplications: applications.length,
      statusCounts,
      totalActiveJobs,
    },
    profileCompletion,
    recentApplications,
    recommendedJobs,
  });
});

// ── Profile completion calculator ────────────────────────────────────

function computeProfileCompletion(
  resumeData: any,
  holisticProfile: any,
  careerPreferences: any,
  portfolioLinks: any,
): { percentage: number; sections: Record<string, boolean> } {
  const sections: Record<string, boolean> = {
    resumeData: !!(
      resumeData &&
      (resumeData.skills.length > 0 ||
        resumeData.education.length > 0 ||
        resumeData.experience.length > 0)
    ),
    workStyle: !!(holisticProfile && holisticProfile.collaboration),
    careerPreferences: !!(
      careerPreferences &&
      (careerPreferences.targetRoles.length > 0 ||
        careerPreferences.preferredIndustries.length > 0)
    ),
    portfolioLinks: !!(
      portfolioLinks &&
      (portfolioLinks.linkedin ||
        portfolioLinks.github ||
        portfolioLinks.portfolio)
    ),
  };

  const completed = Object.values(sections).filter(Boolean).length;
  const total = Object.keys(sections).length;
  const percentage = Math.round((completed / total) * 100);

  return { percentage, sections };
}

export default dashboard;
