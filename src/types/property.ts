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

export interface IProperty {
  id: string;
  title: string;
  titleBangla?: string;
  slug: string;
  type: PropertyType;
  location: {
    neighborhood: string;
    neighborhoodBangla?: string;
    city: string;
    cityBangla?: string;
    address?: string;
    addressBangla?: string;
  };
  keywordsBangla?: string[];
  rent: number; // In BDT
  serviceCharge?: number;
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
  images: string[];
  featuredImage: string;
  genderPreference?: "any" | "male_only" | "female_only" | "family_only";
  tenantType?: "students" | "bachelors" | "job_holders" | "family" | "any";
  description: string;
  createdAt: string;
}

export type PropertySortOption =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "newest";

export interface PropertyFilterCriteria {
  query?: string;
  propertyType?: PropertyType | "all";
  minBudget?: number | null;
  maxBudget?: number | null;
  facilities?: PropertyFacility[];
  genderPreference?: "any" | "male_only" | "female_only" | "family_only";
  onlyVerified?: boolean;
}
