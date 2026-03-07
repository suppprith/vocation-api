import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { CompanyProfile } from "../models/company-profile.model.js";
import { AppError } from "../utils/errors.js";
import { companyProfileSchema } from "../validators/company.validator.js";

const company = new Hono();

// All routes require auth + employer role
company.use("*", authMiddleware, requireRole("employer"));

// ── POST /api/company — Create company profile ──────────────────────

company.post("/", async (c) => {
  const userId = c.get("userId");

  // Check if profile already exists
  const existing = await CompanyProfile.findOne({ userId });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_EXISTS",
      "Company profile already exists. Use PUT to update.",
    );
  }

  const body = await c.req.json();
  const data = companyProfileSchema.parse(body);

  const profile = await CompanyProfile.create({
    userId,
    ...data,
    socialLinks: {
      linkedin: data.socialLinks?.linkedin ?? null,
      twitter: data.socialLinks?.twitter ?? null,
      github: data.socialLinks?.github ?? null,
    },
  });

  return c.json({ companyProfile: profile.toJSON() }, 201);
});

// ── GET /api/company — Get employer's company profile ────────────────

company.get("/", async (c) => {
  const userId = c.get("userId");
  const profile = await CompanyProfile.findOne({ userId });

  if (!profile) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Company profile not found. Create one first.",
    );
  }

  return c.json({ companyProfile: profile.toJSON() });
});

// ── PUT /api/company — Update company profile ───────────────────────

company.put("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = companyProfileSchema.parse(body);

  const profile = await CompanyProfile.findOneAndUpdate(
    { userId },
    {
      ...data,
      socialLinks: {
        linkedin: data.socialLinks?.linkedin ?? null,
        twitter: data.socialLinks?.twitter ?? null,
        github: data.socialLinks?.github ?? null,
      },
    },
    { new: true },
  );

  if (!profile) {
    throw new AppError(
      404,
      "NOT_FOUND",
      "Company profile not found. Create one first.",
    );
  }

  return c.json({ companyProfile: profile.toJSON() });
});

export default company;
