import mongoose, { Schema, Document, Model } from "mongoose";

export type VisitStatus = "pending" | "approved" | "declined" | "completed";

export interface IVisitRequestDocument extends Document {
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  studentId?: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail?: string;
  institution?: string;
  ownerId?: mongoose.Types.ObjectId;
  preferredDate: string;
  timeSlot: string;
  contactPhone: string;
  visitorCount: string;
  notes?: string;
  status: VisitStatus;
  createdAt: Date;
  updatedAt: Date;
}

const VisitRequestSchema = new Schema<IVisitRequestDocument>(
  {
    propertyId: { type: String, required: true, index: true },
    propertyTitle: { type: String, required: true },
    propertyAddress: { type: String },
    studentId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String },
    institution: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    preferredDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    contactPhone: { type: String, required: true },
    visitorCount: { type: String, default: "1" },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "completed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VisitRequest: Model<IVisitRequestDocument> =
  (mongoose.models.VisitRequest as Model<IVisitRequestDocument>) ||
  mongoose.model<IVisitRequestDocument>("VisitRequest", VisitRequestSchema);

export default VisitRequest;
