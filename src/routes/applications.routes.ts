import { Hono } from "hono";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { Application, isValidTransition } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { AppError } from "../utils/errors.js";
import {
  createApplicationSchema,
  updateStatusSchema,
} from "../validators/application.validator.js";
import { APPLICATION_STATUSES } from "../utils/constants.js";

const applications = new Hono();

// All routes require auth + job_seeker role
applications.use("*", authMiddleware, requireRole("job_seeker"));

// ── POST /api/applications — Apply to / save a job ───────────────────

applications.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = createApplicationSchema.parse(body);

  // Verify job exists
  if (!mongoose.Types.ObjectId.isValid(data.jobId)) {
    throw new AppError(404, "NOT_FOUND", "Job not found");
  }
  const job = await Job.findById(data.jobId);
  if (!job || !job.isActive) {
    throw new AppError(404, "NOT_FOUND", "Job not found");
  }

  // Check for duplicate
  const existing = await Application.findOne({ userId, jobId: data.jobId });
  if (existing) {
    throw new AppError(
      409,
      "DUPLICATE_APPLICATION",
      "You have already applied to this job",
    );
  }

  const application = await Application.create({
    userId,
    jobId: data.jobId,
    status: data.status,
    notes: data.notes ?? null,
    appliedAt: new Date(),
    statusHistory: [{ from: null, to: data.status, changedAt: new Date() }],
  });

  return c.json({ application: application.toJSON() }, 201);
});

// ── GET /api/applications — List user's applications ─────────────────

applications.get("/", async (c) => {
  const userId = c.get("userId");
  const status = c.req.query("status") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(c.req.query("limit") || "20", 10)),
  );

  const filter: Record<string, any> = { userId };
  if (status && APPLICATION_STATUSES.includes(status as any)) {
    filter.status = status;
  }

  const [apps, total] = await Promise.all([
    Application.find(filter)
      .populate("jobId")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  return c.json({
    applications: apps.map(formatApplicationResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// ── GET /api/applications/tracker — Grouped by status ────────────────

applications.get("/tracker", async (c) => {
  const userId = c.get("userId");

  const apps = await Application.find({ userId })
    .populate("jobId")
    .sort({ updatedAt: -1 });

  const tracker: Record<string, any[]> = {
    saved: [],
    applied: [],
    interviewing: [],
    offer: [],
    rejected: [],
  };

  for (const app of apps) {
    const formatted = formatApplicationResponse(app);
    if (tracker[app.status]) {
      tracker[app.status].push(formatted);
    }
  }

  return c.json({ tracker });
});

// ── GET /api/applications/:id — Single application detail ────────────

applications.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  const app = await Application.findOne({ _id: id, userId }).populate("jobId");
  if (!app) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  return c.json({ application: formatApplicationResponse(app) });
});

// ── PATCH /api/applications/:id/status — Update status ───────────────

applications.patch("/:id/status", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json();
  const data = updateStatusSchema.parse(body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  const app = await Application.findOne({ _id: id, userId });
  if (!app) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  // Validate transition
  if (!isValidTransition(app.status, data.status)) {
    throw new AppError(
      400,
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from "${app.status}" to "${data.status}". Allowed: ${getValidNextStatuses(app.status).join(", ") || "none (terminal status)"}`,
    );
  }

  // Apply transition
  const previousStatus = app.status;
  app.status = data.status;
  if (data.notes !== undefined) {
    app.notes = data.notes ?? null;
  }
  app.statusHistory.push({
    from: previousStatus,
    to: data.status,
    changedAt: new Date(),
  });

  await app.save();

  return c.json({ application: app.toJSON() });
});

// ── DELETE /api/applications/:id — Withdraw / delete ─────────────────

applications.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  const app = await Application.findOneAndDelete({ _id: id, userId });
  if (!app) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  return c.json({ success: true });
});

// ── Helpers ──────────────────────────────────────────────────────────

function getValidNextStatuses(current: string): string[] {
  const transitions: Record<string, string[]> = {
    saved: ["applied"],
    applied: ["interviewing", "rejected"],
    interviewing: ["offer", "rejected"],
    offer: [],
    rejected: [],
  };
  return transitions[current] ?? [];
}

function formatApplicationResponse(app: any): any {
  const obj = typeof app.toJSON === "function" ? app.toJSON() : app;
  const job = obj.jobId;

  return {
    id: obj.id || obj._id,
    status: obj.status,
    notes: obj.notes,
    interviewDate: obj.interviewDate,
    appliedAt: obj.appliedAt,
    statusHistory: obj.statusHistory,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    job: job
      ? {
          id: job.id || job._id,
          title: job.title,
          company: job.company,
          companyLogo: job.companyLogo,
          location: job.location,
          workArrangement: job.workArrangement,
          employmentType: job.employmentType,
          industry: job.industry,
          salaryRange: job.salaryRange,
        }
      : null,
  };
}

export default applications;
