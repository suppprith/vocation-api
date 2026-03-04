import { z } from "zod";
import {
  PASSIONS,
  INDUSTRIES,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  COMPANY_SIZES,
} from "../utils/constants.js";

// Resume data
const educationEntrySchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field is required"),
  year: z.string().min(1, "Year is required"),
});

const experienceEntrySchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().min(1, "Description is required"),
});

export const resumeDataSchema = z.object({
  skills: z.array(z.string().min(1)).default([]),
  education: z.array(educationEntrySchema).default([]),
  experience: z.array(experienceEntrySchema).default([]),
});

// Work style + passions
export const workStyleSchema = z.object({
  workStyle: z.object({
    collaboration: z.number().int().min(1).max(5),
    structure: z.number().int().min(1).max(5),
    riskTolerance: z.number().int().min(1).max(5),
  }),
  passions: z.array(z.enum(PASSIONS)).default([]),
});

// Career preferences
export const careerPreferencesSchema = z
  .object({
    targetRoles: z.array(z.string().min(1)).default([]),
    preferredIndustries: z.array(z.enum(INDUSTRIES)).default([]),
    workArrangement: z.array(z.enum(WORK_ARRANGEMENTS)).default([]),
    employmentType: z.array(z.enum(EMPLOYMENT_TYPES)).default([]),
    companySize: z.array(z.enum(COMPANY_SIZES)).default([]),
    salaryMin: z.number().int().min(0).nullable().optional(),
    salaryMax: z.number().int().min(0).nullable().optional(),
    willingToRelocate: z.boolean().default(false),
    availableToStart: z.string().default(""),
  })
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "salaryMax must be greater than or equal to salaryMin",
      path: ["salaryMax"],
    },
  );

// Portfolio links
const urlOrNull = z.string().url().nullable().optional();

export const portfolioLinksSchema = z.object({
  linkedin: urlOrNull,
  github: urlOrNull,
  portfolio: urlOrNull,
  design: urlOrNull,
  blog: urlOrNull,
  other: urlOrNull,
});

export type ResumeDataInput = z.infer<typeof resumeDataSchema>;
export type WorkStyleInput = z.infer<typeof workStyleSchema>;
export type CareerPreferencesInput = z.infer<typeof careerPreferencesSchema>;
export type PortfolioLinksInput = z.infer<typeof portfolioLinksSchema>;
