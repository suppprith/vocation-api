import mongoose, { Schema } from "mongoose";

export interface IPortfolioLinks {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  design: string | null;
  blog: string | null;
  other: string | null;
}

const portfolioLinksSchema = new Schema<IPortfolioLinks>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    linkedin: { type: String, default: null },
    github: { type: String, default: null },
    portfolio: { type: String, default: null },
    design: { type: String, default: null },
    blog: { type: String, default: null },
    other: { type: String, default: null },
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

export const PortfolioLinks = mongoose.model<IPortfolioLinks>(
  "PortfolioLinks",
  portfolioLinksSchema,
);
