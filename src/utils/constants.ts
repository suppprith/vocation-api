// Passion values (20)
export const PASSIONS = [
  "Gaming",
  "Writing",
  "Hiking",
  "Design",
  "Technology",
  "Education",
  "Music",
  "Sports",
  "Photography",
  "Cooking",
  "Travel",
  "Art",
  "Science",
  "Finance",
  "Health & Wellness",
  "Social Impact",
  "Film & Media",
  "Robotics",
  "Environment",
  "Fashion",
] as const;

// Industry values (15)
export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Entertainment",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media",
  "Gaming",
  "Cybersecurity",
  "AI & Machine Learning",
  "Climate Tech",
  "SaaS",
  "Fintech",
] as const;

// Enum arrays
export const WORK_ARRANGEMENTS = ["remote", "hybrid", "onsite"] as const;
export const EMPLOYMENT_TYPES = [
  "full-time",
  "contract",
  "internship",
  "part-time",
] as const;
export const COMPANY_SIZES = [
  "startup",
  "small",
  "medium",
  "large",
  "enterprise",
] as const;
export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;
export const JOB_POSTING_STATUSES = [
  "draft",
  "active",
  "paused",
  "closed",
] as const;
export const EXPERIENCE_LEVELS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
] as const;
export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD"] as const;

// Type exports
export type Passion = (typeof PASSIONS)[number];
export type Industry = (typeof INDUSTRIES)[number];
export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type CompanySize = (typeof COMPANY_SIZES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type JobPostingStatus = (typeof JOB_POSTING_STATUSES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Currency = (typeof CURRENCIES)[number];
