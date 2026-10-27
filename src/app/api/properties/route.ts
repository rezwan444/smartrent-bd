import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, formatPropertyForPublic } from "@/models/Property";
import { requireRole } from "@/lib/auth-server";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { filterProperties, sortProperties } from "@/lib/propertyFilters";
import type {
  ApiResponse,
  PaginatedResponse,
  PropertyType,
  PropertyFacility,
} from "@/types/backend";
import type { PropertyFilterCriteria, PropertySortOption } from "@/types/property";

export const dynamic = "force-dynamic";

// Zod schema for validating property creation
const createPropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters"),
  titleBangla: z.string().optional(),
  type: z.enum(["room", "flat", "mess", "hostel"], {
    message: "Invalid property type",
  }),
  location: z.object({
    neighborhood: z.string().trim().min(2, "Neighborhood is required"),
    neighborhoodBangla: z.string().optional(),
    city: z.string().trim().min(2, "City is required"),
    cityBangla: z.string().optional(),
    address: z.string().optional(),
    addressBangla: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  rent: z.number().positive("Rent must be a positive number"),
  serviceCharge: z.number().nonnegative().optional().default(0),
  securityDeposit: z.number().nonnegative().optional().default(0),
  bedrooms: z.number().int().positive().optional().default(1),
  bathrooms: z.number().int().positive().optional().default(1),
  balconies: z.number().int().nonnegative().optional().default(0),
  sizeSqFt: z.number().positive().optional(),
  floor: z.string().optional(),
  roomType: z
    .enum(["single", "shared", "master", "entire_flat"])
    .optional()
    .default("single"),
  seatsAvailable: z.number().int().positive().optional().default(1),
  facilities: z
    .array(
      z.enum([
        "wifi",
        "attached_bath",
        "furnished",
        "balcony",
        "family_friendly",
        "generator",
        "lift",
        "cctv",
        "kitchen",
      ])
    )
    .optional()
    .default([]),
  availability: z.string().optional().default("Available Now"),
  featuredImage: z.string().url("Valid image URL is required"),
  images: z.array(z.string().url()).optional().default([]),
  genderPreference: z
    .enum(["any", "male_only", "female_only", "family_only"])
    .optional()
    .default("any"),
  tenantType: z
    .enum(["students", "bachelors", "job_holders", "family", "any"])
    .optional()
    .default("students"),
  houseRules: z.array(z.string()).optional().default([]),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
});

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${randomSuffix}`;
}

/**
 * GET /api/properties
 * Public listings search, filter, and pagination.
 * Excludes rejected and scam-hidden listings from public results.
 */
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(req.url);

  // Pagination params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
  const skip = (page - 1) * limit;

  // Filter params
  const query = (searchParams.get("query") || searchParams.get("q") || "").trim();
  const propertyType = (searchParams.get("type") || searchParams.get("propertyType") || "all") as
    | PropertyType
    | "all";
  const minBudget = searchParams.get("minBudget")
    ? Number(searchParams.get("minBudget"))
    : null;
  const maxBudget = searchParams.get("maxBudget")
    ? Number(searchParams.get("maxBudget"))
    : null;
  const facilitiesParam = searchParams.get("facilities");
  const facilities: PropertyFacility[] = facilitiesParam
    ? (facilitiesParam.split(",").map((f) => f.trim()) as PropertyFacility[])
    : [];
  const onlyVerified =
    searchParams.get("verified") === "true" ||
    searchParams.get("onlyVerified") === "true";
  const genderPreference = searchParams.get("genderPreference") || "any";
  const sortBy = (searchParams.get("sortBy") || "recommended") as PropertySortOption;

  try {
    await connectToDatabase();

    // Build MongoDB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterQuery: Record<string, any> = {
      // Exclude rejected and scam-hidden listings per Track C3 rules
      status: { $ne: "rejected" },
      isHiddenFromSearch: { $ne: true },
    };

    if (propertyType !== "all") {
      filterQuery.type = propertyType;
    }

    if (onlyVerified) {
      filterQuery.isVerified = true;
    }

    if (genderPreference !== "any") {
      filterQuery.genderPreference = { $in: [genderPreference, "any"] };
    }

    if (minBudget !== null || maxBudget !== null) {
      filterQuery.rent = {};
      if (minBudget !== null) filterQuery.rent.$gte = minBudget;
      if (maxBudget !== null) filterQuery.rent.$lte = maxBudget;
    }

    if (facilities.length > 0) {
      filterQuery.facilities = { $all: facilities };
    }

    if (query) {
      filterQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { "location.neighborhood": { $regex: query, $options: "i" } },
        { "location.city": { $regex: query, $options: "i" } },
      ];
    }

    // Sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortObj: Record<string, any> = { createdAt: -1 };
    if (sortBy === "price_asc") {
      sortObj = { rent: 1 };
    } else if (sortBy === "price_desc") {
      sortObj = { rent: -1 };
    } else if (sortBy === "newest") {
      sortObj = { createdAt: -1 };
    } else {
      // "recommended": prioritize verified listings first
      sortObj = { isVerified: -1, createdAt: -1 };
    }

    const total = await Property.countDocuments(filterQuery);
    const properties = await Property.find(filterQuery)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = properties.map((p) => formatPropertyForPublic(p));
    const totalPages = Math.ceil(total / limit) || 1;

    const response: PaginatedResponse<unknown> = {
      success: true,
      data: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timestamp,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    // Graceful offline fallback using MOCK_PROPERTIES
    const filterCriteria: PropertyFilterCriteria = {
      query,
      propertyType,
      minBudget,
      maxBudget,
      facilities,
      onlyVerified,
      genderPreference: genderPreference as "any" | "male_only" | "female_only" | "family_only",
    };

    const filtered = filterProperties(MOCK_PROPERTIES, filterCriteria);
    const sorted = sortProperties(filtered, sortBy);

    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    const response: PaginatedResponse<unknown> & { isFallback: boolean } = {
      success: true,
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      isFallback: true,
      timestamp,
    };

    return NextResponse.json(response, { status: 200 });
  }
}

/**
 * POST /api/properties
 * Creates a new property listing.
 * Strictly enforces server-side role authorization (Owner or Admin only).
 */
export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // 1. Authorize: User must be signed in as OWNER or ADMIN
  const { auth, response: authResponse } = await requireRole(req, [
    "OWNER",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (authResponse || !auth.user) {
    return authResponse;
  }

  try {
    const rawBody = await req.json();
    const parseResult = createPropertySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const data = parseResult.data;
    const slug = generateSlug(data.title);

    await connectToDatabase();

    const isOwnerVerified = auth.user.nidVerified || auth.user.isVerified;
    const initialStatus = auth.role === "ADMIN" || auth.role === "SUPER_ADMIN" ? "verified" : "pending";

    const newProperty = new Property({
      ...data,
      slug,
      ownerId: auth.user._id,
      owner: {
        name: auth.user.fullName,
        role: "Landlord",
        isVerified: isOwnerVerified,
        phone: auth.user.phone || "",
      },
      isVerified: initialStatus === "verified",
      status: initialStatus,
      isHiddenFromSearch: false,
      images: data.images.length > 0 ? data.images : [data.featuredImage],
    });

    await newProperty.save();

    const formatted = formatPropertyForPublic(newProperty);

    const response: ApiResponse<typeof formatted> = {
      success: true,
      message:
        initialStatus === "verified"
          ? "Property listing published successfully!"
          : "Property listing submitted successfully! Pending admin verification.",
      data: formatted,
      timestamp,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[Create Property Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create property listing.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
