import { Hono } from "hono";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { Job } from "../models/job.model.js";
import { CompanyProfile } from "../models/company-profile.model.js";
import { AppError } from "../utils/errors.js";
import {
  createJobPostingSchema,
  updateJobPostingSchema,
} from "../validators/job-posting.validator.js";
import { JOB_POSTING_STATUSES } from "../utils/constants.js";

const employerJobs = new Hono();

// All routes require auth + employer role
employerJobs.use("*", authMiddleware, requireRole("employer"));

// ── POST /api/employer/jobs — Create a job posting ───────────────────

employerJobs.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = createJobPostingSchema.parse(body);

  // Get company info for auto-fill
  const companyProfile = await CompanyProfile.findOne({ userId });
  if (!companyProfile) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "You must create a company profile before posting jobs.",
    );
  }

  const job = await Job.create({
    ...data,
    company: companyProfile.companyName,
    companyLogo: companyProfile.logoUrl,
    employerUserId: userId,
    postingStatus: "draft",
    isActive: false, // draft = not visible to seekers
    postedDate: new Date(),
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  });

  return c.json({ jobPosting: job.toJSON() }, 201);
});

// ── GET /api/employer/jobs — List employer's job postings ────────────

employerJobs.get("/", async (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(c.req.query("limit") || "20", 10)),
  );

  const filter: Record<string, any> = { employerUserId: userId };
  if (status && JOB_POSTING_STATUSES.includes(status as any)) {
    filter.postingStatus = status;
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  return c.json({
    jobPostings: jobs.map((j) => j.toJSON()),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// ── GET /api/employer/jobs/:id — Single posting detail ───────────────

employerJobs.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  const job = await Job.findOne({ _id: id, employerUserId: userId });
  if (!job) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  return c.json({ jobPosting: job.toJSON() });
});

// ── PUT /api/employer/jobs/:id — Update posting ──────────────────────

employerJobs.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = updateJobPostingSchema.parse(body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  const updateData: Record<string, any> = { ...data };
  if (data.expiresAt) {
    updateData.expiresAt = new Date(data.expiresAt);
  }

  const job = await Job.findOneAndUpdate(
    { _id: id, employerUserId: userId },
    updateData,
    { new: true },
  );

  if (!job) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  return c.json({ jobPosting: job.toJSON() });
});

// ── PATCH /api/employer/jobs/:id/status — Change posting status ──────

employerJobs.patch("/:id/status", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!JOB_POSTING_STATUSES.includes(status)) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `Invalid status. Allowed: ${JOB_POSTING_STATUSES.join(", ")}`,
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  const job = await Job.findOne({ _id: id, employerUserId: userId });
  if (!job) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  // Validate transitions
  const validTransitions: Record<string, string[]> = {
    draft: ["active"],
    active: ["paused", "closed"],
    paused: ["active", "closed"],
    closed: [], // terminal
  };

  const allowed = validTransitions[job.postingStatus] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from "${job.postingStatus}" to "${status}". Allowed: ${allowed.join(", ") || "none (terminal)"}`,
    );
  }

  job.postingStatus = status;
  // Sync isActive: only 'active' postings are visible to job seekers
  job.isActive = status === "active";
  if (status === "active" && !job.postedDate) {
    job.postedDate = new Date();
  }
  await job.save();

  return c.json({ jobPosting: job.toJSON() });
});

// ── DELETE /api/employer/jobs/:id — Delete posting ───────────────────

employerJobs.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  const job = await Job.findOneAndDelete({ _id: id, employerUserId: userId });
  if (!job) {
    throw new AppError(404, "NOT_FOUND", "Job posting not found");
  }

  return c.json({ success: true });
});

export default employerJobs;
