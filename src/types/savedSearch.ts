import { PropertyFacility, PropertyType } from "./property";

export interface SavedSearchCriteria {
  id: string;
  title: string;
  location: string;
  propertyType: PropertyType | "all";
  maxBudget: number | null;
  genderPreference: "any" | "male_only" | "female_only" | "family_only";
  facilities: PropertyFacility[];
  notifyInApp: boolean;
  notifyEmail: boolean;
  createdAt: string;
}

export interface MatchedListingAlert {
  id: string;
  savedSearchId: string;
  savedSearchTitle: string;
  propertyId: string;
  propertyTitle: string;
  location: string;
  rent: string;
  type: string;
  imageUrl: string;
  matchedAt: string;
  isRead: boolean;
}
