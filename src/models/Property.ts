import mongoose, { Schema, Document, Model } from "mongoose";
import type { PropertyType, PropertyFacility, ListingModerationStatus } from "../types/backend.ts";

export interface IPropertyDocument extends Document {
  customId?: string;
  title: string;
  titleBangla?: string;
  slug: string;
  type: PropertyType;
  ownerId?: mongoose.Types.ObjectId;
  owner?: {
    name: string;
    role: "Landlord" | "Property Manager" | "Current Roommate" | "Hostel Warden";
    isVerified: boolean;
    memberSince?: string;
    responseTime?: string;
    phone?: string;
  };
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
  rent: number;
  serviceCharge?: number;
  securityDeposit?: number;
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
  featuredImage: string;
  images: string[];
  genderPreference?: "any" | "male_only" | "female_only" | "family_only";
  tenantType?: "students" | "bachelors" | "job_holders" | "family" | "any";
  houseRules?: string[];
  nearbyLandmarks?: Array<{
    name: string;
    distance: string;
    category: "transit" | "campus" | "hospital" | "market";
  }>;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IPropertyDocument>(
  {
    customId: {
      type: String,
      index: true,
      sparse: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    titleBangla: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["room", "flat", "mess", "hostel"],
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    owner: {
      name: { type: String, default: "" },
      role: {
        type: String,
        enum: ["Landlord", "Property Manager", "Current Roommate", "Hostel Warden"],
        default: "Landlord",
      },
      isVerified: { type: Boolean, default: false },
      memberSince: { type: String },
      responseTime: { type: String },
      phone: { type: String },
    },
    location: {
      neighborhood: { type: String, required: true, index: true },
      neighborhoodBangla: { type: String },
      city: { type: String, required: true, index: true },
      cityBangla: { type: String },
      address: { type: String },
      addressBangla: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: [0, "Rent cannot be negative"],
      index: true,
    },
    serviceCharge: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    balconies: { type: Number, default: 0 },
    sizeSqFt: { type: Number },
    floor: { type: String },
    roomType: {
      type: String,
      enum: ["single", "shared", "master", "entire_flat"],
      default: "single",
    },
    seatsAvailable: { type: Number, default: 1 },
    facilities: {
      type: [String],
      default: [],
      index: true,
    },
    availability: {
      type: String,
      default: "Available Now",
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    moderationNotes: { type: String },
    isHiddenFromSearch: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredImage: {
      type: String,
      required: [true, "Featured image is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    genderPreference: {
      type: String,
      enum: ["any", "male_only", "female_only", "family_only"],
      default: "any",
      index: true,
    },
    tenantType: {
      type: String,
      enum: ["students", "bachelors", "job_holders", "family", "any"],
      default: "students",
    },
    houseRules: {
      type: [String],
      default: [],
    },
    nearbyLandmarks: [
      {
        name: { type: String, required: true },
        distance: { type: String, required: true },
        category: {
          type: String,
          enum: ["transit", "campus", "hospital", "market"],
          default: "campus",
        },
      },
    ],
    mapCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
PropertySchema.index({
  title: "text",
  description: "text",
  "location.neighborhood": "text",
  "location.city": "text",
});

export const Property: Model<IPropertyDocument> =
  (mongoose.models.Property as Model<IPropertyDocument>) ||
  mongoose.model<IPropertyDocument>("Property", PropertySchema);

/**
 * Safely formats a Property document for public API consumption,
 * mapping _id to id and excluding internal database metadata.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatPropertyForPublic(doc: any): Record<string, unknown> {
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  const id = obj.customId || (obj._id ? String(obj._id) : undefined);
  delete obj.__v;
  delete obj.customId;
  return {
    ...obj,
    id,
  };
}

export default Property;
