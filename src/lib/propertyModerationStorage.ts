import type { IProperty } from "../types/property";
import type {
  ModeratedPropertyItem,
  ModerationStore,
  OwnerVerificationSubmission,
  ScamReport,
  ModerationAuditLog,
} from "../types/moderation";
import { MOCK_PROPERTIES } from "../data/mockProperties.ts";

const STORAGE_KEY = "smartrent_moderation_store_v2";

// 1. Initial Curated Seed Properties
const SEED_PROPERTIES: ModeratedPropertyItem[] = [
  ...MOCK_PROPERTIES.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    location: `${p.location.neighborhood}, ${p.location.city}`,
    rent: `৳ ${p.rent.toLocaleString()} / mo`,
    ownerName: p.owner?.name || "Landlord",
    ownerPhone: p.owner?.phone || "+880 1700-000000",
    nidStatus: (p.owner?.isVerified ? "Verified" : "Submitted (Pending)") as
      | "Verified"
      | "Submitted (Pending)"
      | "Not Submitted",
    status: (p.isVerified ? "verified" : "pending") as
      | "pending"
      | "verified"
      | "rejected"
      | "suspended",
    isHiddenFromSearch: false,
    submittedAt: p.createdAt || "2026-10-15T08:00:00Z",
    rawProperty: p,
  })),
  // Additional pending submissions awaiting admin inspection
  {
    id: "ver-pend-01",
    title: "Quiet Study Flat Share for University Students",
    type: "mess",
    location: "Nilkhet Katabon, Dhaka",
    rent: "৳ 6,500 / seat",
    ownerName: "Rahim Chowdhury",
    ownerPhone: "+880 1711-223344",
    nidStatus: "Verified",
    status: "pending",
    isHiddenFromSearch: true,
    submittedAt: "2026-10-22T14:30:00Z",
  },
  {
    id: "ver-pend-02",
    title: "Furnished Mess Seat near Bogura Govt College",
    type: "mess",
    location: "Joleshwaritola, Bogura",
    rent: "৳ 3,200 / seat",
    ownerName: "Abdul Matin",
    ownerPhone: "+880 1819-556677",
    nidStatus: "Submitted (Pending)",
    status: "pending",
    isHiddenFromSearch: true,
    submittedAt: "2026-10-23T09:15:00Z",
  },
  {
    id: "ver-pend-03",
    title: "Spacious Master Bed in Mirpur 10",
    type: "room",
    location: "Mirpur 10, Dhaka",
    rent: "৳ 11,000 / mo",
    ownerName: "Kabir Hossain",
    ownerPhone: "+880 1812-987654",
    nidStatus: "Verified",
    status: "pending",
    isHiddenFromSearch: true,
    submittedAt: "2026-10-23T11:45:00Z",
  },
];

// 2. Pre-seeded Owner Identity Submissions
const SEED_OWNER_VERIFICATIONS: OwnerVerificationSubmission[] = [
  {
    id: "nid-sub-01",
    ownerId: "own-01",
    ownerName: "Kabir Hossain",
    ownerPhone: "+880 1812-987654",
    ownerEmail: "owner@smartrentbd.com",
    nidNumber: "1985-2692-4401-29",
    holdingTaxNumber: "DNCC-HOLD-84920",
    propertyLocation: "Mirpur 2, Dhaka",
    submittedAt: "2026-10-21T10:00:00Z",
    status: "approved",
    reviewedAt: "2026-10-22T09:00:00Z",
    adminNotes: "Govt NID verified against Election Commission database. Holding tax receipt authentic.",
  },
  {
    id: "nid-sub-02",
    ownerId: "own-02",
    ownerName: "Abdul Matin",
    ownerPhone: "+880 1819-556677",
    ownerEmail: "abdul.matin@bogura-rent.com",
    nidNumber: "1978-1092-3381-45",
    holdingTaxNumber: "BOG-MUN-5521",
    propertyLocation: "Joleshwaritola, Bogura",
    submittedAt: "2026-10-23T11:20:00Z",
    status: "pending",
  },
  {
    id: "nid-sub-03",
    ownerId: "own-03",
    ownerName: "Kamrul Islam",
    ownerPhone: "+880 1912-334455",
    ownerEmail: "kamrul@gmail.com",
    nidNumber: "1990-4829-1029-77",
    holdingTaxNumber: "DSCC-HOLD-10293",
    propertyLocation: "Farmgate, Dhaka",
    submittedAt: "2026-10-24T08:30:00Z",
    status: "pending",
  },
];

// 3. Pre-seeded Scam Reports (Track C3 Requirement: Reported listings hidden until reviewed)
const SEED_SCAM_REPORTS: ScamReport[] = [
  {
    id: "SR-REP-104921",
    propertyId: "prop-03",
    propertyTitle: "Fully furnished studio apartment in Dhanmondi",
    propertyLocation: "Dhanmondi, Dhaka",
    reportedBy: "Tanvir Hasan (DU CSE)",
    reason: "Host asked for advance bKash / Nagad money before visit",
    details: "Host called and demanded ৳ 2,000 token advance via personal bKash number before scheduling a physical room visit.",
    contactInfo: "+880 1711-223344",
    status: "awaiting_review",
    reportedAt: "2026-10-24T12:00:00Z",
    actionTaken: "hidden_from_search",
  },
  {
    id: "SR-REP-104882",
    propertyId: "prop-fake-02",
    propertyTitle: "Luxury Duplex Mess Seat in Uttara Sector 11",
    propertyLocation: "Sector 11, Uttara, Dhaka",
    reportedBy: "Nafis Fuad (BUET EEE)",
    reason: "Images copied from an Indian real estate portal",
    details: "Watermark of foreign website visible. The street number does not exist on Sector 11 map.",
    contactInfo: "nafis@buet.ac.bd",
    status: "investigating",
    reportedAt: "2026-10-23T16:30:00Z",
    actionTaken: "hidden_from_search",
    adminNotes: "Inspector dispatched to check premises on Road 12.",
  },
];

// Mark reported listings as hidden initially
SEED_PROPERTIES.forEach((p) => {
  if (SEED_SCAM_REPORTS.some((r) => r.propertyId === p.id && r.status !== "dismissed")) {
    p.isHiddenFromSearch = true;
  }
});

const SEED_AUDIT_LOGS: ModerationAuditLog[] = [
  {
    id: "log-01",
    timestamp: "2026-10-24T12:01:00Z",
    targetType: "scam_report",
    targetId: "SR-REP-104921",
    targetTitle: "Fully furnished studio apartment in Dhanmondi",
    action: "Listing Automatically Suppressed",
    adminUser: "System Automated Safety Policy",
    notes: "Listing hidden from public search immediately upon receiving qualifying scam report.",
  },
  {
    id: "log-02",
    timestamp: "2026-10-22T09:00:00Z",
    targetType: "owner",
    targetId: "nid-sub-01",
    targetTitle: "Kabir Hossain (NID Verified)",
    action: "Owner Identity Approved",
    adminUser: "Staff Admin (staff@smartrentbd.com)",
    notes: "NID and holding tax documents authenticated.",
  },
];

export const INITIAL_MODERATION_STORE: ModerationStore = {
  properties: SEED_PROPERTIES,
  scamReports: SEED_SCAM_REPORTS,
  ownerVerifications: SEED_OWNER_VERIFICATIONS,
  auditLogs: SEED_AUDIT_LOGS,
};

let inMemoryStore: ModerationStore = JSON.parse(JSON.stringify(INITIAL_MODERATION_STORE));

/**
 * Loads the current ModerationStore from localStorage (browser) or memory (server/tests).
 */
export function getModerationStore(): ModerationStore {
  if (typeof window === "undefined") {
    return inMemoryStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = JSON.parse(JSON.stringify(INITIAL_MODERATION_STORE));
      saveModerationStore(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.properties) && Array.isArray(parsed.scamReports)) {
      return parsed;
    }
    return INITIAL_MODERATION_STORE;
  } catch (err) {
    console.error("Failed to load moderation store", err);
    return INITIAL_MODERATION_STORE;
  }
}

/**
 * Persists updated ModerationStore to localStorage (browser) and inMemoryStore.
 */
export function saveModerationStore(store: ModerationStore): void {
  inMemoryStore = store;
  if (typeof window === "undefined" || !store) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("smartrent_moderation_updated"));
  } catch (err) {
    console.error("Failed to save moderation store", err);
  }
}

/**
 * Returns public property listings: strictly excludes hidden (scam-reported) and unverified/rejected listings.
 */
export function getAllPublicProperties(): IProperty[] {
  const store = getModerationStore();
  const hiddenIds = new Set(
    store.properties.filter((p) => p.isHiddenFromSearch).map((p) => p.id)
  );
  // Also any active scam report suppresses the listing
  store.scamReports.forEach((r) => {
    if (r.status === "awaiting_review" || r.status === "investigating" || r.status === "confirmed_fraud") {
      hiddenIds.add(r.propertyId);
    }
  });

  return MOCK_PROPERTIES.filter((p) => {
    if (hiddenIds.has(p.id)) return false;
    const match = store.properties.find((item) => item.id === p.id);
    if (match && match.status === "rejected") return false;
    return true;
  });
}

/**
 * Submits a new scam report: immediately suppresses the listing from public search.
 */
export function submitScamReport(input: {
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  reason: string;
  details?: string;
  contactInfo?: string;
  reportedBy?: string;
}): ScamReport {
  const store = getModerationStore();
  const reportId = `SR-REP-${Date.now().toString().slice(-6)}`;

  const newReport: ScamReport = {
    id: reportId,
    propertyId: input.propertyId,
    propertyTitle: input.propertyTitle,
    propertyLocation: input.propertyLocation || "Dhaka, Bangladesh",
    reportedBy: input.reportedBy || "Verified Tenant",
    reason: input.reason,
    details: input.details,
    contactInfo: input.contactInfo,
    status: "awaiting_review",
    reportedAt: new Date().toISOString(),
    actionTaken: "hidden_from_search",
  };

  // Suppress matching property in store
  const updatedProperties = store.properties.map((p) =>
    p.id === input.propertyId ? { ...p, isHiddenFromSearch: true } : p
  );

  const newLog: ModerationAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    targetType: "scam_report",
    targetId: reportId,
    targetTitle: input.propertyTitle,
    action: "Listing Automatically Hidden",
    adminUser: "Automated Safety Policy (Track C3 Rule 8)",
    notes: `Report reason: "${input.reason}". Listing suppressed from public search awaiting admin investigation.`,
  };

  const updatedStore: ModerationStore = {
    ...store,
    properties: updatedProperties,
    scamReports: [newReport, ...store.scamReports],
    auditLogs: [newLog, ...store.auditLogs],
  };

  saveModerationStore(updatedStore);
  return newReport;
}

/**
 * Moderates a scam report: admin can investigate, dismiss (restore to search), or confirm fraud (de-list).
 */
export function moderateScamReport(
  reportId: string,
  action: "dismiss" | "confirm_fraud" | "investigate",
  adminNotes: string,
  adminUser = "Admin Staff"
): ModerationStore {
  const store = getModerationStore();
  const targetReport = store.scamReports.find((r) => r.id === reportId);
  if (!targetReport) return store;

  const now = new Date().toISOString();
  let updatedReportStatus: ScamReport["status"] = "awaiting_review";
  let shouldUnhide = false;
  let shouldSuspend = false;
  let actionLabel = "";

  if (action === "dismiss") {
    updatedReportStatus = "dismissed";
    shouldUnhide = true;
    actionLabel = "Report Dismissed & Listing Restored";
  } else if (action === "confirm_fraud") {
    updatedReportStatus = "confirmed_fraud";
    shouldSuspend = true;
    actionLabel = "Scam Confirmed & Listing Permanently De-listed";
  } else {
    updatedReportStatus = "investigating";
    actionLabel = "Marked for On-site Inspection";
  }

  const updatedReports = store.scamReports.map((r) =>
    r.id === reportId
      ? {
          ...r,
          status: updatedReportStatus,
          resolvedAt: now,
          adminNotes,
          actionTaken: shouldUnhide ? ("restored" as const) : ("delisted" as const),
        }
      : r
  );

  const updatedProperties = store.properties.map((p) => {
    if (p.id === targetReport.propertyId) {
      if (shouldUnhide) {
        return { ...p, isHiddenFromSearch: false, status: "verified" as const };
      }
      if (shouldSuspend) {
        return {
          ...p,
          isHiddenFromSearch: true,
          status: "suspended" as const,
          adminNotes,
        };
      }
    }
    return p;
  });

  const newLog: ModerationAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now,
    targetType: "scam_report",
    targetId: reportId,
    targetTitle: targetReport.propertyTitle,
    action: actionLabel,
    adminUser,
    notes: adminNotes || "No additional comments provided.",
  };

  const updatedStore: ModerationStore = {
    ...store,
    properties: updatedProperties,
    scamReports: updatedReports,
    auditLogs: [newLog, ...store.auditLogs],
  };

  saveModerationStore(updatedStore);
  return updatedStore;
}

/**
 * Reviews a property listing: approve (with Verified trust badge) or reject (with feedback notes).
 */
export function verifyListing(
  listingId: string,
  decision: "approve" | "reject",
  adminNotes: string,
  adminUser = "Admin Staff"
): ModerationStore {
  const store = getModerationStore();
  const target = store.properties.find((p) => p.id === listingId);
  if (!target) return store;

  const now = new Date().toISOString();
  const isApproved = decision === "approve";

  const updatedProperties = store.properties.map((p) =>
    p.id === listingId
      ? {
          ...p,
          status: isApproved ? ("verified" as const) : ("rejected" as const),
          isHiddenFromSearch: !isApproved,
          reviewedAt: now,
          adminNotes,
        }
      : p
  );

  const newLog: ModerationAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now,
    targetType: "listing",
    targetId: listingId,
    targetTitle: target.title,
    action: isApproved ? "Listing Approved & Verified" : "Listing Rejected",
    adminUser,
    notes: adminNotes || (isApproved ? "Inspected & Verified." : "Does not meet safety/quality standard."),
  };

  const updatedStore: ModerationStore = {
    ...store,
    properties: updatedProperties,
    auditLogs: [newLog, ...store.auditLogs],
  };

  saveModerationStore(updatedStore);
  return updatedStore;
}

/**
 * Reviews an owner NID identity submission: approve or reject.
 */
export function verifyOwnerNid(
  submissionId: string,
  decision: "approve" | "reject",
  adminNotes: string,
  adminUser = "Admin Staff"
): ModerationStore {
  const store = getModerationStore();
  const target = store.ownerVerifications.find((s) => s.id === submissionId);
  if (!target) return store;

  const now = new Date().toISOString();
  const isApproved = decision === "approve";

  const updatedSubmissions = store.ownerVerifications.map((s) =>
    s.id === submissionId
      ? {
          ...s,
          status: isApproved ? ("approved" as const) : ("rejected" as const),
          reviewedAt: now,
          adminNotes,
        }
      : s
  );

  // If approved, mark the owner's properties as having Verified NID
  const updatedProperties = store.properties.map((p) => {
    if (p.ownerName === target.ownerName || p.ownerPhone === target.ownerPhone) {
      return {
        ...p,
        nidStatus: isApproved ? ("Verified" as const) : ("Not Submitted" as const),
      };
    }
    return p;
  });

  const newLog: ModerationAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: now,
    targetType: "owner",
    targetId: submissionId,
    targetTitle: `${target.ownerName} (NID: ${target.nidNumber})`,
    action: isApproved ? "Owner NID Verified" : "Owner NID Rejected",
    adminUser,
    notes: adminNotes || (isApproved ? "Identity verified." : "Documents failed verification."),
  };

  const updatedStore: ModerationStore = {
    ...store,
    properties: updatedProperties,
    ownerVerifications: updatedSubmissions,
    auditLogs: [newLog, ...store.auditLogs],
  };

  saveModerationStore(updatedStore);
  return updatedStore;
}

/**
 * Returns an owner's listings with live verification, rejection notes, and moderation status.
 */
export function getOwnerProperties(ownerName = "Kabir Hossain"): ModeratedPropertyItem[] {
  const store = getModerationStore();
  const normalized = ownerName.trim().toLowerCase();
  return store.properties.filter((p) =>
    p.ownerName.toLowerCase().includes(normalized) ||
    normalized.includes(p.ownerName.toLowerCase())
  );
}

/**
 * Resets the entire moderation store to initial demo state.
 */
export function resetModerationStore(): ModerationStore {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      saveModerationStore(INITIAL_MODERATION_STORE);
    } catch (e) {
      console.error("Error resetting moderation store", e);
    }
  }
  return INITIAL_MODERATION_STORE;
}
