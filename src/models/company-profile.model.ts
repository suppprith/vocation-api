import mongoose, { Schema } from "mongoose";
import { INDUSTRIES, COMPANY_SIZES } from "../utils/constants.js";

export interface ICompanyProfile {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  location: string;
  foundedYear: number | null;
  employeeCount: number | null;
  benefits: string[];
  techStack: string[];
  socialLinks: {
    linkedin: string | null;
    twitter: string | null;
    github: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, enum: INDUSTRIES, required: true },
    companySize: { type: String, enum: COMPANY_SIZES, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String, default: null },
    websiteUrl: { type: String, default: null },
    location: { type: String, required: true },
    foundedYear: { type: Number, default: null },
    employeeCount: { type: Number, default: null },
    benefits: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      github: { type: String, default: null },
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

export const CompanyProfile = mongoose.model<ICompanyProfile>(
  "CompanyProfile",
  companyProfileSchema,
);
