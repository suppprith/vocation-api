import { z } from "zod";
import { APPLICATION_STATUSES } from "../utils/constants.js";

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "jobId is required"),
  status: z.enum(APPLICATION_STATUSES).default("saved"),
  notes: z.string().nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  notes: z.string().nullable().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
