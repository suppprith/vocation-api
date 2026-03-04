import mongoose, { Schema } from "mongoose";
import {
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  COMPANY_SIZES,
  INDUSTRIES,
} from "../utils/constants.js";

export interface ICareerPreferences {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetRoles: string[];
  preferredIndustries: string[];
  workArrangement: string[];
  employmentType: string[];
  companySize: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  willingToRelocate: boolean;
  availableToStart: string;
}

const careerPreferencesSchema = new Schema<ICareerPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetRoles: {
      type: [String],
      default: [],
    },
    preferredIndustries: {
      type: [String],
      enum: INDUSTRIES,
      default: [],
    },
    workArrangement: {
      type: [String],
      enum: WORK_ARRANGEMENTS,
      default: [],
    },
    employmentType: {
      type: [String],
      enum: EMPLOYMENT_TYPES,
      default: [],
    },
    companySize: {
      type: [String],
      enum: COMPANY_SIZES,
      default: [],
    },
    salaryMin: {
      type: Number,
      default: null,
      min: 0,
    },
    salaryMax: {
      type: Number,
      default: null,
    },
    willingToRelocate: {
      type: Boolean,
      default: false,
    },
    availableToStart: {
      type: String,
      default: "",
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

export const CareerPreferences = mongoose.model<ICareerPreferences>(
  "CareerPreferences",
  careerPreferencesSchema,
);
