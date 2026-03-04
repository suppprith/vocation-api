import mongoose, { Schema } from "mongoose";

// Sub-document schemas (embedded, not separate collections)
const educationEntrySchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    year: { type: String, required: true },
  },
  { _id: true },
);

const experienceEntrySchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: true },
);

export interface IResumeData {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  rawText: string | null;
  resumeFileUrl: string | null;
  updatedAt: Date;
}

const resumeDataSchema = new Schema<IResumeData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [educationEntrySchema],
      default: [],
    },
    experience: {
      type: [experienceEntrySchema],
      default: [],
    },
    rawText: {
      type: String,
      default: null,
    },
    resumeFileUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Clean up sub-document IDs for education/experience
        if (ret.education) {
          ret.education = ret.education.map((e: any) => {
            const { _id, __v, ...rest } = e;
            return rest;
          });
        }
        if (ret.experience) {
          ret.experience = ret.experience.map((e: any) => {
            const { _id, __v, ...rest } = e;
            return rest;
          });
        }
        return ret;
      },
    },
  },
);

export const ResumeData = mongoose.model<IResumeData>(
  "ResumeData",
  resumeDataSchema,
);
