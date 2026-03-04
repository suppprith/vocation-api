import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/require-role.js";
import { ResumeData } from "../models/resume-data.model.js";
import { HolisticProfile } from "../models/holistic-profile.model.js";
import { CareerPreferences } from "../models/career-preferences.model.js";
import { PortfolioLinks } from "../models/portfolio-links.model.js";
import {
  resumeDataSchema,
  workStyleSchema,
  careerPreferencesSchema,
  portfolioLinksSchema,
} from "../validators/profile.validator.js";

const profile = new Hono();

// All profile routes require auth + job_seeker role
profile.use("*", authMiddleware, requireRole("job_seeker"));

// GET /api/profile — full profile (all 4 sections)
profile.get("/", async (c) => {
  const userId = c.get("userId");

  const [resumeData, holisticProfile, careerPreferences, portfolioLinks] =
    await Promise.all([
      ResumeData.findOne({ userId }),
      HolisticProfile.findOne({ userId }),
      CareerPreferences.findOne({ userId }),
      PortfolioLinks.findOne({ userId }),
    ]);

  return c.json({
    resumeData: resumeData
      ? {
          skills: resumeData.skills,
          education: resumeData.education,
          experience: resumeData.experience,
          resumeFileUrl: resumeData.resumeFileUrl,
        }
      : null,
    holisticProfile: holisticProfile
      ? {
          workStyle: {
            collaboration: holisticProfile.collaboration,
            structure: holisticProfile.structure,
            riskTolerance: holisticProfile.riskTolerance,
          },
          passions: holisticProfile.passions,
        }
      : null,
    careerPreferences: careerPreferences
      ? {
          targetRoles: careerPreferences.targetRoles,
          preferredIndustries: careerPreferences.preferredIndustries,
          workArrangement: careerPreferences.workArrangement,
          employmentType: careerPreferences.employmentType,
          companySize: careerPreferences.companySize,
          salaryMin: careerPreferences.salaryMin,
          salaryMax: careerPreferences.salaryMax,
          willingToRelocate: careerPreferences.willingToRelocate,
          availableToStart: careerPreferences.availableToStart,
        }
      : null,
    portfolioLinks: portfolioLinks
      ? {
          linkedin: portfolioLinks.linkedin,
          github: portfolioLinks.github,
          portfolio: portfolioLinks.portfolio,
          design: portfolioLinks.design,
          blog: portfolioLinks.blog,
          other: portfolioLinks.other,
        }
      : null,
  });
});

// PUT /api/profile/resume
profile.put("/resume", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = resumeDataSchema.parse(body);

  await ResumeData.findOneAndUpdate(
    { userId },
    {
      skills: data.skills,
      education: data.education,
      experience: data.experience,
    },
    { upsert: true, new: true },
  );

  return c.json({ success: true });
});

// PUT /api/profile/work-style
profile.put("/work-style", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = workStyleSchema.parse(body);

  await HolisticProfile.findOneAndUpdate(
    { userId },
    {
      collaboration: data.workStyle.collaboration,
      structure: data.workStyle.structure,
      riskTolerance: data.workStyle.riskTolerance,
      passions: data.passions,
    },
    { upsert: true, new: true },
  );

  return c.json({ success: true });
});

// PUT /api/profile/career-preferences
profile.put("/career-preferences", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = careerPreferencesSchema.parse(body);

  await CareerPreferences.findOneAndUpdate(
    { userId },
    {
      targetRoles: data.targetRoles,
      preferredIndustries: data.preferredIndustries,
      workArrangement: data.workArrangement,
      employmentType: data.employmentType,
      companySize: data.companySize,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      willingToRelocate: data.willingToRelocate,
      availableToStart: data.availableToStart,
    },
    { upsert: true, new: true },
  );

  return c.json({ success: true });
});

// PUT /api/profile/portfolio-links
profile.put("/portfolio-links", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const data = portfolioLinksSchema.parse(body);

  await PortfolioLinks.findOneAndUpdate(
    { userId },
    {
      linkedin: data.linkedin ?? null,
      github: data.github ?? null,
      portfolio: data.portfolio ?? null,
      design: data.design ?? null,
      blog: data.blog ?? null,
      other: data.other ?? null,
    },
    { upsert: true, new: true },
  );

  return c.json({ success: true });
});

export default profile;
