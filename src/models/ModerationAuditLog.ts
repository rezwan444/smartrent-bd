import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModerationAuditLogDocument extends Document {
  targetType: "listing" | "owner" | "scam_report";
  targetId: string;
  targetTitle: string;
  action: string;
  adminUser: string;
  adminUserId?: mongoose.Types.ObjectId;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModerationAuditLogSchema = new Schema<IModerationAuditLogDocument>(
  {
    targetType: {
      type: String,
      enum: ["listing", "owner", "scam_report"],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetTitle: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    adminUser: {
      type: String,
      required: true,
      trim: true,
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.ModerationAuditLog) {
  delete (mongoose.models as Record<string, unknown>).ModerationAuditLog;
}

export const ModerationAuditLog: Model<IModerationAuditLogDocument> =
  (mongoose.models.ModerationAuditLog as Model<IModerationAuditLogDocument>) ||
  mongoose.model<IModerationAuditLogDocument>("ModerationAuditLog", ModerationAuditLogSchema);

export default ModerationAuditLog;
