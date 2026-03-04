import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { Job } from "../models/job.model.js";
import { ResumeData } from "../models/resume-data.model.js";
import { HolisticProfile } from "../models/holistic-profile.model.js";
import { CareerPreferences } from "../models/career-preferences.model.js";
import { AppError } from "../utils/errors.js";
import { computeMatchScore, scoreJobs } from "../utils/matching.js";
import mongoose from "mongoose";

const jobs = new Hono();

// All job routes require auth + job_seeker role
jobs.use("*", authMiddleware, requireRole("job_seeker"));

// ── Helper: load user profile for matching ───────────────────────────

async function loadUserProfile(userId: string) {
  const [resumeData, holisticProfile, careerPreferences] = await Promise.all([
    ResumeData.findOne({ userId }),
    HolisticProfile.findOne({ userId }),
    CareerPreferences.findOne({ userId }),
  ]);
  return { resumeData, holisticProfile, careerPreferences };
}

// ── GET /api/jobs — Search & filter with pagination ──────────────────

jobs.get("/", async (c) => {
  const search = c.req.query("search") || "";
  const industry = c.req.query("industry") || "";
  const workArrangement = c.req.query("workArrangement") || "";
  const companySize = c.req.query("companySize") || "";
  const employmentType = c.req.query("employmentType") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(c.req.query("limit") || "20", 10)),
  );

  // Build filter
  const filter: Record<string, any> = { isActive: true };

  if (industry) filter.industry = industry;
  if (workArrangement) filter.workArrangement = workArrangement;
  if (companySize) filter.companySize = companySize;
  if (employmentType) filter.employmentType = employmentType;

  // Text search or regex fallback for search across title, company, description, skills
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { title: regex },
      { company: regex },
      { description: regex },
      { skills: { $elemMatch: { $regex: regex } } },
    ];
  }

  const [jobDocs, total] = await Promise.all([
    Job.find(filter)
      .sort({ postedDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  // Score jobs
  const userId = c.get("userId");
  const profile = await loadUserProfile(userId);
  const scoredJobs = scoreJobs(jobDocs, profile);

  return c.json({
    jobs: scoredJobs.map(formatJobResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// ── GET /api/jobs/recommended — Top N matched jobs ───────────────────

jobs.get("/recommended", async (c) => {
  const limit = Math.min(
    20,
    Math.max(1, parseInt(c.req.query("limit") || "4", 10)),
  );
  const userId = c.get("userId");

  const allJobs = await Job.find({ isActive: true });
  const profile = await loadUserProfile(userId);
  const scoredJobs = scoreJobs(allJobs, profile);

  // Sort by match score descending, take top N
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
  const topJobs = scoredJobs.slice(0, limit);

  return c.json({
    jobs: topJobs.map(formatJobResponse),
  });
});

// ── GET /api/jobs/matches — All jobs by match score, paginated ───────

jobs.get("/matches", async (c) => {
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(c.req.query("limit") || "20", 10)),
  );
  const userId = c.get("userId");

  const allJobs = await Job.find({ isActive: true });
  const profile = await loadUserProfile(userId);
  const scoredJobs = scoreJobs(allJobs, profile);

  // Sort by match score descending
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  const total = scoredJobs.length;
  const paginatedJobs = scoredJobs.slice((page - 1) * limit, page * limit);

  return c.json({
    jobs: paginatedJobs.map(formatJobResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// ── GET /api/jobs/map — Jobs with coordinates ────────────────────────

jobs.get("/map", async (c) => {
  const bounds = c.req.query("bounds"); // "swLat,swLng,neLat,neLng"
  const userId = c.get("userId");

  const filter: Record<string, any> = {
    isActive: true,
    latitude: { $ne: null },
    longitude: { $ne: null },
  };

  // Optional viewport filtering
  if (bounds) {
    const parts = bounds.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      const [swLat, swLng, neLat, neLng] = parts;
      filter.latitude = { $gte: swLat, $lte: neLat };
      filter.longitude = { $gte: swLng, $lte: neLng };
    }
  }

  const jobDocs = await Job.find(filter);
  const profile = await loadUserProfile(userId);
  const scoredJobs = scoreJobs(jobDocs, profile);

  return c.json({
    jobs: scoredJobs.map(formatJobResponse),
  });
});

// ── GET /api/jobs/:id — Single job detail ────────────────────────────

jobs.get("/:id", async (c) => {
  const id = c.req.param("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Job not found");
  }

  const job = await Job.findById(id);
  if (!job || !job.isActive) {
    throw new AppError(404, "NOT_FOUND", "Job not found");
  }

  const userId = c.get("userId");
  const profile = await loadUserProfile(userId);
  const { matchScore, matchReason } = computeMatchScore(job, profile);

  return c.json({
    job: {
      ...formatJobResponse({ ...job.toJSON(), matchScore, matchReason }),
    },
  });
});

// ── Response formatter ───────────────────────────────────────────────

function formatJobResponse(job: any) {
  return {
    id: job.id || job._id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo,
    description: job.description,
    location: job.location,
    coordinates:
      job.latitude != null && job.longitude != null
        ? { lat: job.latitude, lng: job.longitude }
        : null,
    workArrangement: job.workArrangement,
    employmentType: job.employmentType,
    companySize: job.companySize,
    industry: job.industry,
    skills: job.skills,
    salaryRange: job.salaryRange,
    applyUrl: job.applyUrl,
    matchScore: job.matchScore ?? 0,
    matchReason: job.matchReason ?? "",
    postedDate: job.postedDate,
  };
}

export default jobs;
