import { z } from "zod";
import {
  INDUSTRIES,
  COMPANY_SIZES,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
} from "../utils/constants.js";

export const createJobPostingSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200).trim(),
    description: z.string().min(1, "Description is required").max(10000),
    location: z.string().min(1, "Location is required"),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    workArrangement: z.enum(WORK_ARRANGEMENTS),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    companySize: z.enum(COMPANY_SIZES),
    industry: z.enum(INDUSTRIES),
    skills: z.array(z.string().min(1)).default([]),
    salaryRange: z.string().nullable().optional(),
    salaryMin: z.number().int().min(0).nullable().optional(),
    salaryMax: z.number().int().min(0).nullable().optional(),
    applyUrl: z.string().url("Must be a valid URL"),
    expiresAt: z.string().datetime().nullable().optional(),
    experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  })
  .refine(
    (data) => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    { message: "salaryMax must be >= salaryMin", path: ["salaryMax"] },
  );

export const updateJobPostingSchema = createJobPostingSchema.partial();

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
