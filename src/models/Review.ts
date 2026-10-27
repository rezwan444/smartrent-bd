import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewDocument extends Document {
  propertyId: string;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  subRatings?: {
    cleanliness: number;
    landlordBehavior: number;
    safety: number;
    facilities: number;
  };
  isVerifiedTenant: boolean;
  tenancyStatus?: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    propertyId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    userRole: { type: String, default: "Student Resident" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true, minlength: 10 },
    subRatings: {
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      landlordBehavior: { type: Number, min: 1, max: 5, default: 5 },
      safety: { type: Number, min: 1, max: 5, default: 5 },
      facilities: { type: Number, min: 1, max: 5, default: 5 },
    },
    isVerifiedTenant: { type: Boolean, default: true },
    tenancyStatus: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Review: Model<IReviewDocument> =
  (mongoose.models.Review as Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>("Review", ReviewSchema);

export default Review;
