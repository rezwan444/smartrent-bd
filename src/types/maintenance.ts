export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "wifi"
  | "gas"
  | "structural"
  | "cleaning"
  | "other";

export type MaintenanceUrgency = "low" | "medium" | "high" | "emergency";

export type MaintenanceStatus =
  | "pending"
  | "in_progress"
  | "resolved"
  | "cancelled";

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyTitle: string;
  roomNumber?: string;
  category: MaintenanceCategory;
  urgency: MaintenanceUrgency;
  title: string;
  description: string;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  ownerNotes?: string;
  technicianName?: string;
  estimatedResolution?: string;
}
