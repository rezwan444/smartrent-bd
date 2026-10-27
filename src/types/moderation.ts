import { IProperty, PropertyType } from "./property";

export type PropertyVerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export type OwnerVerificationStatus =
  | "unverified"
  | "pending_nid"
  | "verified"
  | "rejected";

export type ScamReportStatus =
  | "awaiting_review"
  | "investigating"
  | "dismissed"
  | "confirmed_fraud";

export interface ScamReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  reportedBy: string;
  reason: string;
  details?: string;
  contactInfo?: string;
  status: ScamReportStatus;
  reportedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  actionTaken?: "hidden_from_search" | "restored" | "delisted" | "under_investigation";
}

export interface OwnerVerificationSubmission {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  nidNumber: string;
  dob?: string;
  documentUrl?: string;
  holdingTaxNumber: string;
  propertyLocation: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: string;
  adminNotes?: string;
}

export interface ModeratedPropertyItem {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  rent: string;
  ownerName: string;
  ownerPhone: string;
  nidStatus: "Verified" | "Submitted (Pending)" | "Not Submitted";
  status: PropertyVerificationStatus;
  isHiddenFromSearch: boolean;
  submittedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
  rawProperty?: IProperty;
}

export interface ModerationAuditLog {
  id: string;
  timestamp: string;
  targetType: "listing" | "owner" | "scam_report";
  targetId: string;
  targetTitle: string;
  action: string;
  adminUser: string;
  notes: string;
}

export interface ModerationStore {
  properties: ModeratedPropertyItem[];
  scamReports: ScamReport[];
  ownerVerifications: OwnerVerificationSubmission[];
  auditLogs: ModerationAuditLog[];
}
