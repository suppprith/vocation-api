import mongoose, { Schema } from "mongoose";
import { PASSIONS } from "../utils/constants.js";

export interface IHolisticProfile {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  collaboration: number;
  structure: number;
  riskTolerance: number;
  passions: string[];
}

const holisticProfileSchema = new Schema<IHolisticProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    collaboration: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    structure: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    riskTolerance: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    passions: {
      type: [String],
      enum: PASSIONS,
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

export const HolisticProfile = mongoose.model<IHolisticProfile>(
  "HolisticProfile",
  holisticProfileSchema,
);
