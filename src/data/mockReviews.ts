import type { PropertyReview, TenancyRecord } from "../types/review.ts";

/**
 * Confirmed tenancy agreements in the SmartRent BD prototype.
 *
 * In compliance with Track C3 Feature 7:
 * "Verified tenant eligibility is mandatory. A visit request alone is NOT proof of tenancy."
 * Only users who have an active or completed rental agreement recorded for a specific property
 * are granted verified tenant status to post ratings and reviews.
 */
export const INITIAL_CONFIRMED_TENANCIES: TenancyRecord[] = [
  {
    id: "ten-01",
    tenantId: "demo-student-01",
    tenantEmail: "student@smartrentbd.com",
    tenantName: "Rayhan Ahmed",
    propertyId: "prop-01",
    status: "active",
    startDate: "2026-02-01",
    roomOrUnit: "Master Bed (Att. Bath & Balcony)",
    agreementRef: "SRBD-AGR-2026-0041",
  },
  {
    id: "ten-02",
    tenantId: "mem-02",
    tenantEmail: "tanvir.du.cse@gmail.com",
    tenantName: "Tanvir Hasan",
    propertyId: "prop-01",
    status: "completed",
    startDate: "2025-07-01",
    endDate: "2026-06-30",
    roomOrUnit: "Bed 2 (South Facing)",
    agreementRef: "SRBD-AGR-2025-0189",
  },
  {
    id: "ten-03",
    tenantId: "mem-03",
    tenantEmail: "nafis.buet.eee@gmail.com",
    tenantName: "Nafis Fuad",
    propertyId: "prop-01",
    status: "active",
    startDate: "2026-01-15",
    roomOrUnit: "Bed 3 (Study Corner)",
    agreementRef: "SRBD-AGR-2026-0022",
  },
  {
    id: "ten-04",
    tenantId: "mem-04",
    tenantEmail: "sajjad.dmc@gmail.com",
    tenantName: "Sajjad Ali",
    propertyId: "prop-02",
    status: "active",
    startDate: "2026-03-01",
    roomOrUnit: "Room 102",
    agreementRef: "SRBD-AGR-2026-0077",
  },
];

/**
 * Pre-seeded genuine verified tenant reviews.
 */
export const INITIAL_PROPERTY_REVIEWS: PropertyReview[] = [
  {
    id: "rev-01",
    propertyId: "prop-01",
    userId: "mem-02",
    userName: "Tanvir Hasan",
    userEmail: "tanvir.du.cse@gmail.com",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Best accommodation for East West & nearby university students",
    comment:
      "Stayed here for nearly a full academic year. The 4-minute walk to East West University saved me hours of daily Dhaka traffic. Generator backup works reliably during load-shedding, and Landlord Rafiqul Islam is respectful of exam schedules.",
    subRatings: {
      cleanliness: 5,
      landlordBehavior: 5,
      safety: 5,
      facilities: 5,
    },
    createdAt: "2026-08-14T10:30:00Z",
    isVerifiedTenant: true,
    tenancyStatus: "completed",
    tenancyDetails: "Past Tenant (2025–2026 • Bed 2)",
  },
  {
    id: "rev-02",
    propertyId: "prop-01",
    userId: "mem-03",
    userName: "Nafis Fuad",
    userEmail: "nafis.buet.eee@gmail.com",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    rating: 4,
    title: "Peaceful environment, strict night gate security",
    comment:
      "The building main gate locking at 11:30 PM gives peace of mind. Fiber Wi-Fi is fast and steady for study. Gas burner is shared smoothly. Water pressure on the 4th floor is good since they installed the new roof line pump.",
    subRatings: {
      cleanliness: 4,
      landlordBehavior: 5,
      safety: 5,
      facilities: 4,
    },
    createdAt: "2026-09-22T14:15:00Z",
    isVerifiedTenant: true,
    tenancyStatus: "active",
    tenancyDetails: "Active Resident (Bed 3)",
  },
  {
    id: "rev-03",
    propertyId: "prop-02",
    userId: "mem-04",
    userName: "Sajjad Ali",
    userEmail: "sajjad.dmc@gmail.com",
    userAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    rating: 4,
    title: "Very convenient location near Mirpur-10 Metro",
    comment:
      "Metro station is literally 5 minutes away on foot. Electric sub-meters are transparent and landlord provides DESCO billing receipts every month. Some traffic noise in the afternoon, but peaceful at night.",
    subRatings: {
      cleanliness: 4,
      landlordBehavior: 4,
      safety: 4,
      facilities: 4,
    },
    createdAt: "2026-10-05T09:00:00Z",
    isVerifiedTenant: true,
    tenancyStatus: "active",
    tenancyDetails: "Active Resident (Room 102)",
  },
];
