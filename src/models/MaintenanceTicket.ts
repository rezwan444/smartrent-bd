import mongoose, { Schema, Document, Model } from "mongoose";

export type MaintenanceUrgency = "Low" | "Medium" | "High" | "Emergency";
export type TicketStatus = "pending" | "in_progress" | "resolved";

export interface IMaintenanceTicketDocument extends Document {
  propertyId: string;
  propertyTitle: string;
  tenantId?: mongoose.Types.ObjectId;
  tenantName: string;
  tenantPhone?: string;
  ownerId?: mongoose.Types.ObjectId;
  issue: string;
  description?: string;
  category: "plumbing" | "electrical" | "wifi" | "structural" | "appliance" | "other";
  urgency: MaintenanceUrgency;
  status: TicketStatus;
  technicianNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceTicketSchema = new Schema<IMaintenanceTicketDocument>(
  {
    propertyId: { type: String, required: true, index: true },
    propertyTitle: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    tenantName: { type: String, required: true },
    tenantPhone: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    issue: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "wifi", "structural", "appliance", "other"],
      default: "other",
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
      index: true,
    },
    technicianNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceTicket: Model<IMaintenanceTicketDocument> =
  (mongoose.models.MaintenanceTicket as Model<IMaintenanceTicketDocument>) ||
  mongoose.model<IMaintenanceTicketDocument>("MaintenanceTicket", MaintenanceTicketSchema);

export default MaintenanceTicket;
