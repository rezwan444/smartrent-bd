export interface ReviewSubRatings {
  cleanliness?: number; // 1-5
  landlordBehavior?: number; // 1-5
  safety?: number; // 1-5
  facilities?: number; // 1-5 (wifi, gas, water)
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number; // 1 to 5 integer
  title?: string;
  comment: string;
  subRatings?: ReviewSubRatings;
  createdAt: string; // ISO date string
  isVerifiedTenant: boolean; // Must be true for genuine tenant reviews
  tenancyStatus?: "active" | "completed";
  tenancyDetails?: string; // e.g. "Active Resident • Room 4B" or "Past Tenant • 2025–2026"
}

export interface TenancyRecord {
  id: string;
  tenantId: string; // matches auth user id (e.g. "demo-student-01") or email
  tenantEmail: string;
  tenantName: string;
  propertyId: string;
  status: "active" | "completed" | "terminated"; // Only "active" or "completed" qualify
  startDate: string;
  endDate?: string;
  roomOrUnit?: string;
  agreementRef?: string;
}

export interface TenantEligibilityResult {
  isEligible: boolean;
  isLoggedIn: boolean;
  isOwnerOrAdmin: boolean;
  hasAlreadyReviewed: boolean;
  existingReview?: PropertyReview;
  tenancyRecord?: TenancyRecord;
  reason: string;
}

export interface PropertyRatingSummary {
  propertyId: string;
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  subRatingAverages?: {
    cleanliness: number;
    landlordBehavior: number;
    safety: number;
    facilities: number;
  };
}

export interface SubmitReviewInput {
  propertyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userRole?: string;
  rating: number;
  title?: string;
  comment: string;
  subRatings?: ReviewSubRatings;
}
