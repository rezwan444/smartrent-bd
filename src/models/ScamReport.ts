import mongoose, { Schema, Document, Model } from "mongoose";
import type { ScamReportStatus } from "../types/moderation.ts";

export interface IScamReportDocument extends Document {
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  reportedByUserId?: string;
  reportedByName?: string;
  reportedByEmail?: string;
  reportedByPhone?: string;
  reason: string;
  details?: string;
  contactInfo?: string;
  status: ScamReportStatus;
  adminNotes?: string;
  actionTaken?: "hidden_from_search" | "restored" | "delisted" | "under_investigation";
  resolvedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScamReportSchema = new Schema<IScamReportDocument>(
  {
    propertyId: {
      type: String,
      required: [true, "Property identifier is required"],
      index: true,
    },
    propertyTitle: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    propertyLocation: {
      type: String,
      trim: true,
      default: "Dhaka, Bangladesh",
    },
    reportedByUserId: {
      type: String,
      index: true,
    },
    reportedByName: {
      type: String,
      trim: true,
      default: "Tenant",
    },
    reportedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    reportedByPhone: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    contactInfo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["awaiting_review", "investigating", "confirmed_fraud", "dismissed"],
      default: "awaiting_review",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    actionTaken: {
      type: String,
      enum: ["hidden_from_search", "restored", "delisted", "under_investigation"],
      default: "hidden_from_search",
    },
    resolvedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent stale cached models in Next.js development hot-reload
if (process.env.NODE_ENV !== "production" && mongoose.models.ScamReport) {
  delete (mongoose.models as Record<string, unknown>).ScamReport;
}

export const ScamReport: Model<IScamReportDocument> =
  (mongoose.models.ScamReport as Model<IScamReportDocument>) ||
  mongoose.model<IScamReportDocument>("ScamReport", ScamReportSchema);

export default ScamReport;
