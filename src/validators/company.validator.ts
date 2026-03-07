import { z } from "zod";
import { INDUSTRIES, COMPANY_SIZES } from "../utils/constants.js";

const urlOrNull = z.string().url().nullable().optional();

export const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200).trim(),
  industry: z.enum(INDUSTRIES),
  companySize: z.enum(COMPANY_SIZES),
  description: z.string().min(1, "Description is required").max(5000),
  logoUrl: urlOrNull,
  websiteUrl: urlOrNull,
  location: z.string().min(1, "Location is required"),
  foundedYear: z.number().int().min(1800).max(2030).nullable().optional(),
  employeeCount: z.number().int().min(1).nullable().optional(),
  benefits: z.array(z.string().min(1)).default([]),
  techStack: z.array(z.string().min(1)).default([]),
  socialLinks: z
    .object({
      linkedin: urlOrNull,
      twitter: urlOrNull,
      github: urlOrNull,
    })
    .default({}),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
