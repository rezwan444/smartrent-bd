import { SavedSearchCriteria, MatchedListingAlert } from "@/types/savedSearch";

export const INITIAL_SAVED_SEARCHES: SavedSearchCriteria[] = [
  {
    id: "search-01",
    title: "Quiet Mess Seat near DU / Nilkhet under ৳ 7,000",
    location: "Nilkhet",
    propertyType: "mess",
    maxBudget: 7000,
    genderPreference: "male_only",
    facilities: ["wifi", "attached_bath", "generator"],
    notifyInApp: true,
    notifyEmail: true,
    createdAt: "2026-10-12",
  },
  {
    id: "search-02",
    title: "Affordable Student Room in Bogura under ৳ 4,000",
    location: "Bogura",
    propertyType: "room",
    maxBudget: 4000,
    genderPreference: "any",
    facilities: ["wifi"],
    notifyInApp: true,
    notifyEmail: false,
    createdAt: "2026-10-14",
  },
];

export const INITIAL_MATCHED_ALERTS: MatchedListingAlert[] = [
  {
    id: "alert-01",
    savedSearchId: "search-01",
    savedSearchTitle: "Quiet Mess Seat near DU / Nilkhet under ৳ 7,000",
    propertyId: "prop-01",
    propertyTitle: "Quiet Study Flat Share for University Students",
    location: "Nilkhet, Dhaka (5 min walk to DU Science Annex)",
    rent: "৳ 6,500 / month",
    type: "Mess Seat",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80",
    matchedAt: "Today at 02:30 PM",
    isRead: false,
  },
  {
    id: "alert-02",
    savedSearchId: "search-02",
    savedSearchTitle: "Affordable Student Room in Bogura under ৳ 4,000",
    propertyId: "prop-02",
    propertyTitle: "Furnished Mess Seat near Bogura Govt College",
    location: "Jaleshwaritola, Bogura",
    rent: "৳ 3,200 / month",
    type: "Mess Seat",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=80",
    matchedAt: "Yesterday at 05:45 PM",
    isRead: true,
  },
];
