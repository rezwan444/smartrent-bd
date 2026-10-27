import type {
  PropertyReview,
  TenancyRecord,
  TenantEligibilityResult,
  PropertyRatingSummary,
  SubmitReviewInput,
} from "../types/review.ts";
import {
  INITIAL_CONFIRMED_TENANCIES,
  INITIAL_PROPERTY_REVIEWS,
} from "../data/mockReviews.ts";

const STORAGE_KEY_REVIEWS = "smartrent_property_reviews_v1";
const STORAGE_KEY_TENANCIES = "smartrent_confirmed_tenancies_v1";
export const REVIEWS_UPDATED_EVENT = "smartrent_reviews_updated";

// In-memory cache for SSR and Node.js unit tests
let inMemoryReviews: PropertyReview[] = JSON.parse(
  JSON.stringify(INITIAL_PROPERTY_REVIEWS)
);
let inMemoryTenancies: TenancyRecord[] = JSON.parse(
  JSON.stringify(INITIAL_CONFIRMED_TENANCIES)
);

/**
 * Loads all reviews or reviews filtered by propertyId.
 */
export function loadPropertyReviews(propertyId?: string): PropertyReview[] {
  if (typeof window === "undefined") {
    return propertyId
      ? inMemoryReviews.filter((r) => r.propertyId === propertyId)
      : inMemoryReviews;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_REVIEWS,
        JSON.stringify(INITIAL_PROPERTY_REVIEWS)
      );
      inMemoryReviews = JSON.parse(JSON.stringify(INITIAL_PROPERTY_REVIEWS));
      return propertyId
        ? inMemoryReviews.filter((r) => r.propertyId === propertyId)
        : inMemoryReviews;
    }
    const parsed: PropertyReview[] = JSON.parse(raw);
    const reviews = Array.isArray(parsed) ? parsed : INITIAL_PROPERTY_REVIEWS;
    inMemoryReviews = reviews;
    return propertyId ? reviews.filter((r) => r.propertyId === propertyId) : reviews;
  } catch (err) {
    console.error("Failed to load property reviews from localStorage", err);
    return propertyId
      ? inMemoryReviews.filter((r) => r.propertyId === propertyId)
      : inMemoryReviews;
  }
}

/**
 * Saves all reviews to localStorage and in-memory cache, notifying listeners.
 */
function saveReviews(reviews: PropertyReview[]): void {
  inMemoryReviews = reviews;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new Event(REVIEWS_UPDATED_EVENT));
  } catch (err) {
    console.error("Failed to save property reviews", err);
  }
}

/**
 * Loads confirmed tenancy records (used for verifying tenant eligibility).
 */
export function loadConfirmedTenancies(): TenancyRecord[] {
  if (typeof window === "undefined") {
    return inMemoryTenancies;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TENANCIES);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_TENANCIES,
        JSON.stringify(INITIAL_CONFIRMED_TENANCIES)
      );
      inMemoryTenancies = JSON.parse(JSON.stringify(INITIAL_CONFIRMED_TENANCIES));
      return inMemoryTenancies;
    }
    const parsed: TenancyRecord[] = JSON.parse(raw);
    const tenancies = Array.isArray(parsed) ? parsed : INITIAL_CONFIRMED_TENANCIES;
    inMemoryTenancies = tenancies;
    return tenancies;
  } catch (err) {
    console.error("Failed to load confirmed tenancies", err);
    return inMemoryTenancies;
  }
}

/**
 * Calculates rating summary, average score, star distribution, and sub-ratings.
 */
export function getPropertyRatingSummary(propertyId: string): PropertyRatingSummary {
  const reviews = loadPropertyReviews(propertyId);
  const totalReviews = reviews.length;

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (totalReviews === 0) {
    return {
      propertyId,
      averageRating: 0,
      totalReviews: 0,
      distribution,
      subRatingAverages: {
        cleanliness: 0,
        landlordBehavior: 0,
        safety: 0,
        facilities: 0,
      },
    };
  }

  let totalScore = 0;
  let cleanlinessTotal = 0;
  let cleanlinessCount = 0;
  let landlordTotal = 0;
  let landlordCount = 0;
  let safetyTotal = 0;
  let safetyCount = 0;
  let facilitiesTotal = 0;
  let facilitiesCount = 0;

  for (const review of reviews) {
    totalScore += review.rating;
    const roundedStar = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[roundedStar] = (distribution[roundedStar] || 0) + 1;

    if (review.subRatings) {
      if (typeof review.subRatings.cleanliness === "number" && review.subRatings.cleanliness > 0) {
        cleanlinessTotal += review.subRatings.cleanliness;
        cleanlinessCount++;
      }
      if (typeof review.subRatings.landlordBehavior === "number" && review.subRatings.landlordBehavior > 0) {
        landlordTotal += review.subRatings.landlordBehavior;
        landlordCount++;
      }
      if (typeof review.subRatings.safety === "number" && review.subRatings.safety > 0) {
        safetyTotal += review.subRatings.safety;
        safetyCount++;
      }
      if (typeof review.subRatings.facilities === "number" && review.subRatings.facilities > 0) {
        facilitiesTotal += review.subRatings.facilities;
        facilitiesCount++;
      }
    }
  }

  const averageRating = Number((totalScore / totalReviews).toFixed(1));

  return {
    propertyId,
    averageRating,
    totalReviews,
    distribution,
    subRatingAverages: {
      cleanliness: cleanlinessCount > 0 ? Number((cleanlinessTotal / cleanlinessCount).toFixed(1)) : averageRating,
      landlordBehavior: landlordCount > 0 ? Number((landlordTotal / landlordCount).toFixed(1)) : averageRating,
      safety: safetyCount > 0 ? Number((safetyTotal / safetyCount).toFixed(1)) : averageRating,
      facilities: facilitiesCount > 0 ? Number((facilitiesTotal / facilitiesCount).toFixed(1)) : averageRating,
    },
  };
}

/**
 * Checks whether a user is an eligible verified tenant for a given property.
 *
 * Rules (Track C3 Feature 7):
 * 1. User must be signed in.
 * 2. Owners and Administrators cannot post tenant reviews.
 * 3. User must NOT have already submitted a review for this property (duplicate prevention).
 * 4. User must have an active or completed rental agreement recorded for this property.
 *    - A visit request alone is NOT proof of tenancy.
 */
export function checkTenantEligibility(
  user: {
    id?: string;
    email?: string;
    role?: string;
  } | null,
  propertyId: string
): TenantEligibilityResult {
  if (!user || (!user.id && !user.email)) {
    return {
      isEligible: false,
      isLoggedIn: false,
      isOwnerOrAdmin: false,
      hasAlreadyReviewed: false,
      reason: "Please sign in with your student account to verify review eligibility.",
    };
  }

  const userRole = (user.role || "").toUpperCase();
  if (userRole === "OWNER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "STAFF") {
    return {
      isEligible: false,
      isLoggedIn: true,
      isOwnerOrAdmin: true,
      hasAlreadyReviewed: false,
      reason: "Property owners and administrators cannot submit tenant reviews.",
    };
  }

  const allReviews = loadPropertyReviews(propertyId);
  const normalizedUserEmail = (user.email || "").trim().toLowerCase();

  const existingReview = allReviews.find((r) => {
    if (user.id && r.userId === user.id) return true;
    if (normalizedUserEmail && r.userEmail.toLowerCase() === normalizedUserEmail) return true;
    return false;
  });

  if (existingReview) {
    return {
      isEligible: false,
      isLoggedIn: true,
      isOwnerOrAdmin: false,
      hasAlreadyReviewed: true,
      existingReview,
      reason: "You have already submitted a review for this accommodation. Thank you for contributing to tenant transparency!",
    };
  }

  const tenancies = loadConfirmedTenancies();
  const tenancyRecord = tenancies.find((t) => {
    if (t.propertyId !== propertyId) return false;
    if (t.status !== "active" && t.status !== "completed") return false;

    if (user.id && t.tenantId === user.id) return true;
    if (normalizedUserEmail && t.tenantEmail.toLowerCase() === normalizedUserEmail) return true;
    return false;
  });

  if (!tenancyRecord) {
    return {
      isEligible: false,
      isLoggedIn: true,
      isOwnerOrAdmin: false,
      hasAlreadyReviewed: false,
      reason:
        "Verified Tenant Eligibility Required: You do not have an active or completed tenancy agreement recorded for this property. In-person visit requests alone do not confer review eligibility.",
    };
  }

  return {
    isEligible: true,
    isLoggedIn: true,
    isOwnerOrAdmin: false,
    hasAlreadyReviewed: false,
    tenancyRecord,
    reason: "Verified Tenant Confirmed: You have a verified rental agreement for this accommodation.",
  };
}

/**
 * Validates and submits a new verified tenant review.
 */
export function submitPropertyReview(input: SubmitReviewInput): {
  success: boolean;
  review?: PropertyReview;
  error?: string;
} {
  const { propertyId, userId, userName, userEmail, userAvatar, userRole, rating, title, comment, subRatings } = input;

  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Valid property ID is required." };
  }

  // 1. Validate rating
  if (
    typeof rating !== "number" ||
    isNaN(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return {
      success: false,
      error: "Rating must be an integer between 1 and 5 stars.",
    };
  }

  // 2. Validate comment
  const trimmedComment = (comment || "").trim();
  if (trimmedComment.length < 10) {
    return {
      success: false,
      error: "Review feedback must be at least 10 characters long to provide helpful details for other students.",
    };
  }

  // 3. Verify tenant eligibility and duplicate prevention
  const eligibility = checkTenantEligibility(
    { id: userId, email: userEmail, role: userRole },
    propertyId
  );

  if (!eligibility.isEligible) {
    return {
      success: false,
      error: eligibility.reason,
    };
  }

  const tenancyRecord = eligibility.tenancyRecord!;
  const tenancyStatus = tenancyRecord.status === "active" ? "active" : "completed";
  const tenancyDetails =
    tenancyStatus === "active"
      ? `Active Resident • ${tenancyRecord.roomOrUnit || "Verified Seat"}`
      : `Past Tenant (${tenancyRecord.startDate.slice(0, 4)}–${tenancyRecord.endDate ? tenancyRecord.endDate.slice(0, 4) : "2026"}) • ${tenancyRecord.roomOrUnit || "Verified"}`;

  const newReview: PropertyReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    propertyId,
    userId,
    userName: userName.trim() || "Verified Student Tenant",
    userEmail: userEmail.trim().toLowerCase(),
    userAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || "Student")}`,
    rating,
    title: (title || "").trim() || undefined,
    comment: trimmedComment,
    subRatings: subRatings
      ? {
          cleanliness: subRatings.cleanliness ? Math.min(5, Math.max(1, Math.round(subRatings.cleanliness))) : undefined,
          landlordBehavior: subRatings.landlordBehavior ? Math.min(5, Math.max(1, Math.round(subRatings.landlordBehavior))) : undefined,
          safety: subRatings.safety ? Math.min(5, Math.max(1, Math.round(subRatings.safety))) : undefined,
          facilities: subRatings.facilities ? Math.min(5, Math.max(1, Math.round(subRatings.facilities))) : undefined,
        }
      : undefined,
    createdAt: new Date().toISOString(),
    isVerifiedTenant: true,
    tenancyStatus,
    tenancyDetails,
  };

  const allReviews = loadPropertyReviews();
  const updatedReviews = [newReview, ...allReviews];
  saveReviews(updatedReviews);

  return {
    success: true,
    review: newReview,
  };
}

/**
 * Resets reviews and tenancies to original mock state.
 */
export function resetPropertyReviews(): void {
  inMemoryReviews = JSON.parse(JSON.stringify(INITIAL_PROPERTY_REVIEWS));
  inMemoryTenancies = JSON.parse(JSON.stringify(INITIAL_CONFIRMED_TENANCIES));
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_REVIEWS);
    localStorage.removeItem(STORAGE_KEY_TENANCIES);
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_PROPERTY_REVIEWS));
    localStorage.setItem(STORAGE_KEY_TENANCIES, JSON.stringify(INITIAL_CONFIRMED_TENANCIES));
    window.dispatchEvent(new Event(REVIEWS_UPDATED_EVENT));
  } catch (err) {
    console.error("Failed to reset property reviews", err);
  }
}
