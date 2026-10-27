/**
 * SmartRent BD — Shared Backend TypeScript Types
 * Track C3: PUB CSE Fest-26 Hackathon
 *
 * Organized into clearly labelled feature sections.
 */

// ============================================================================
// 1. API Responses & Common Utilities
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// 2. Authentication & Users
// ============================================================================

export type UserRole = "STUDENT" | "OWNER" | "ADMIN" | "SUPER_ADMIN" | "STAFF";

export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  nidVerified: boolean;
  avatar?: string;
  location?: string;
  isDemoUser?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  isDemoUser?: boolean;
  tokenVersion?: number;
  tokenType?: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthSessionResponse {
  user: Omit<IUser, "password">;
  accessToken?: string;
  refreshToken?: string;
  isDemoSession?: boolean;
}

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// 3. Properties & Listings
// ============================================================================

export type PropertyType = "room" | "flat" | "mess" | "hostel";

export type PropertyFacility =
  | "wifi"
  | "attached_bath"
  | "furnished"
  | "balcony"
  | "family_friendly"
  | "generator"
  | "lift"
  | "cctv"
  | "kitchen";

export type ListingModerationStatus = "pending" | "verified" | "rejected";

export interface IBackendProperty {
  _id: string;
  title: string;
  titleBangla?: string;
  slug: string;
  type: PropertyType;
  ownerId: string;
  location: {
    neighborhood: string;
    neighborhoodBangla?: string;
    city: string;
    cityBangla?: string;
    address?: string;
    addressBangla?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  rent: number; // In BDT
  serviceCharge?: number;
  securityDeposit?: number; // In BDT
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  sizeSqFt?: number;
  floor?: string;
  roomType?: "single" | "shared" | "master" | "entire_flat";
  seatsAvailable?: number;
  facilities: PropertyFacility[];
  availability: string;
  isVerified: boolean;
  status: ListingModerationStatus;
  moderationNotes?: string;
  isHiddenFromSearch: boolean;
  images: string[];
  featuredImage: string;
  genderPreference?: "any" | "male_only" | "female_only" | "family_only";
  tenantType?: "students" | "bachelors" | "job_holders" | "family" | "any";
  houseRules?: string[];
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PropertyFilterParams extends PaginationParams {
  query?: string;
  city?: string;
  neighborhood?: string;
  propertyType?: PropertyType | "all";
  minBudget?: number;
  maxBudget?: number;
  facilities?: PropertyFacility[];
  genderPreference?: "any" | "male_only" | "female_only" | "family_only";
  onlyVerified?: boolean;
  campusDistanceMaxKm?: number;
}

// ============================================================================
// 4. Roommates & Profiles
// ============================================================================

export interface IRoommateProfile {
  _id: string;
  userId: string;
  preferredLocations: string[];
  budgetMax: number;
  studyOrWork: string;
  institution?: string;
  sleepSchedule?: "early_bird" | "night_owl" | "flexible";
  smokingPreference?: "non_smoker" | "smoker" | "outside_only";
  guestPolicy?: "strict" | "moderate" | "free";
  bio?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// 5. Bookings & Visit Requests
// ============================================================================

export type VisitRequestStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface IVisitRequest {
  _id: string;
  propertyId: string;
  studentId: string;
  ownerId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  contactPhone: string;
  status: VisitRequestStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// 6. Reviews & Verified Ratings
// ============================================================================

export interface IBackendReview {
  _id: string;
  propertyId: string;
  userId: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  subRatings?: {
    cleanliness?: number;
    landlordBehavior?: number;
    safety?: number;
    facilities?: number;
  };
  isVerifiedTenant: boolean;
  tenancyStatus: "active" | "completed";
  tenancyAgreementRef?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// 7. Expenses & Mess Accounts
// ============================================================================

export type ExpenseCategory = "rent" | "utility" | "mess_grocery" | "cleaning" | "other";

export interface ISharedExpense {
  _id: string;
  flatId: string;
  month: string; // YYYY-MM
  category: ExpenseCategory;
  title: string;
  amount: number;
  paidByUserId: string;
  splitMethod: "equal" | "room_weighted" | "custom";
  isSettled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// 8. Maintenance & Alerts
// ============================================================================

export type MaintenancePriority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus = "reported" | "in_progress" | "resolved";

export interface IMaintenanceTicket {
  _id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "wifi" | "structural" | "appliance" | "other";
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// 9. Moderation & Scam Suppression
// ============================================================================

export type ScamReportStatus = "pending" | "investigating" | "dismissed" | "action_taken";

export interface IScamReport {
  _id: string;
  propertyId: string;
  reportedByUserId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
  status: ScamReportStatus;
  adminNotes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
