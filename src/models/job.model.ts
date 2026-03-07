import mongoose, { Schema } from "mongoose";

export interface IJob {
  _id: mongoose.Types.ObjectId;
  title: string;
  company: string;
  companyLogo: string | null;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  workArrangement: "remote" | "hybrid" | "onsite";
  employmentType: "full-time" | "contract" | "internship" | "part-time";
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  industry: string;
  skills: string[];
  salaryRange: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  applyUrl: string;
  postedDate: Date;
  expiresAt: Date | null;
  employerUserId: mongoose.Types.ObjectId | null;
  postingStatus: "draft" | "active" | "paused" | "closed";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String, default: null },
    description: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    workArrangement: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      required: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "contract", "internship", "part-time"],
      required: true,
    },
    companySize: {
      type: String,
      enum: ["startup", "small", "medium", "large", "enterprise"],
      required: true,
    },
    industry: { type: String, required: true },
    skills: { type: [String], default: [] },
    salaryRange: { type: String, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    applyUrl: { type: String, required: true },
    postedDate: { type: Date, required: true },
    expiresAt: { type: Date, default: null },
    employerUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    postingStatus: {
      type: String,
      enum: ["draft", "active", "paused", "closed"],
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
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

// Text index for search across title, company, description
jobSchema.index({ title: "text", company: "text", description: "text" });

// Index for filtering
jobSchema.index({
  isActive: 1,
  industry: 1,
  workArrangement: 1,
  employmentType: 1,
  companySize: 1,
});

// Index for geo queries
jobSchema.index({ latitude: 1, longitude: 1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
