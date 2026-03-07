import mongoose, { Schema } from "mongoose";
import { APPLICATION_STATUSES } from "../utils/constants.js";

export interface IStatusHistoryEntry {
  from: string | null;
  to: string;
  changedAt: Date;
}

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  status: string;
  notes: string | null;
  interviewDate: Date | null;
  appliedAt: Date;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "saved",
    },
    notes: { type: String, default: null },
    interviewDate: { type: Date, default: null },
    appliedAt: { type: Date, default: Date.now },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound unique index — one application per user per job
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Index for listing by user + status
applicationSchema.index({ userId: 1, status: 1 });

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema,
);

// ── Status transition rules ──────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  saved: ["applied"],
  applied: ["interviewing", "rejected"],
  interviewing: ["offer", "rejected"],
  offer: [], // terminal
  rejected: [], // terminal
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}
