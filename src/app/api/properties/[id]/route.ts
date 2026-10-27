import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, formatPropertyForPublic } from "@/models/Property";
import { ScamReport } from "@/models/ScamReport";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getPropertyById } from "@/data/mockProperties";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const imageSourceSchema = z
  .string()
  .trim()
  .min(1, "Image is required")
  .refine(
    (val) =>
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("/") ||
      val.startsWith("data:image/"),
    { message: "Valid image URL, upload path, or data URI is required" }
  );

// Zod schema for partial property updates
const updatePropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  titleBangla: z.string().optional(),
  type: z.enum(["room", "flat", "mess", "hostel"]).optional(),
  location: z
    .object({
      neighborhood: z.string().trim().min(2, "Neighborhood is required").optional(),
      neighborhoodBangla: z.string().optional(),
      city: z.string().trim().min(2, "City is required").optional(),
      cityBangla: z.string().optional(),
      address: z.string().optional(),
      addressBangla: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
    })
    .optional(),
  rent: z.number().positive("Rent must be a positive number").optional(),
  serviceCharge: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  balconies: z.number().int().nonnegative().optional(),
  sizeSqFt: z.number().positive().optional(),
  floor: z.string().optional(),
  roomType: z.enum(["single", "shared", "master", "entire_flat"]).optional(),
  seatsAvailable: z.number().int().positive().optional(),
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
    .optional(),
  availability: z.string().optional(),
  featuredImage: imageSourceSchema.optional(),
  images: z.array(imageSourceSchema).optional(),
  genderPreference: z
    .enum(["any", "male_only", "female_only", "family_only"])
    .optional(),
  tenantType: z
    .enum(["students", "bachelors", "job_holders", "family", "any"])
    .optional(),
  houseRules: z.array(z.string()).optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  // Admin-only fields (filtered out for non-admins)
  isVerified: z.boolean().optional(),
  status: z.enum(["pending", "verified", "rejected"]).optional(),
  isHiddenFromSearch: z.boolean().optional(),
});

/**
 * GET /api/properties/[id]
 * Retrieves single accommodation listing details.
 * Protects against public exposure of unapproved, rejected, or scam-suppressed listings.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  if (!id || typeof id !== "string") {
    const response: ApiResponse = {
      success: false,
      error: "Invalid property identifier",
      timestamp,
    };
    return NextResponse.json(response, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Query conditions: supports customId (e.g. prop-01), ObjectId, or slug
    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];

    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const property = await Property.findOne({ $or: orConditions }).lean();

    if (property) {
      // Check if listing is unapproved, rejected, or hidden
      const isPubliclyUnavailable =
        property.isHiddenFromSearch || property.status !== "verified";

      if (isPubliclyUnavailable) {
        // Only allow listing owner or moderators to access a suppressed/pending/rejected listing
        const auth = await getAuthenticatedUser(req);
        const isOwner =
          auth.user && String(property.ownerId) === String(auth.user._id);
        const isAdmin =
          auth.role === "ADMIN" ||
          auth.role === "SUPER_ADMIN" ||
          auth.role === "STAFF";

        if (!isOwner && !isAdmin) {
          const response: ApiResponse = {
            success: false,
            error:
              "This listing is pending verification or temporarily unavailable.",
            timestamp,
          };
          return NextResponse.json(response, { status: 404 });
        }
      }

      const formatted = formatPropertyForPublic(property);
      const response: ApiResponse<typeof formatted> = {
        success: true,
        data: formatted,
        timestamp,
      };
      return NextResponse.json(response, { status: 200 });
    }
  } catch {
    // Database unavailable or error: fall through to mock data fallback
  }

  // Fallback to in-memory mock properties for offline prototype resilience
  const mockProperty = getPropertyById(id);
  if (mockProperty) {
    const response: ApiResponse<typeof mockProperty> & { isFallback: boolean } = {
      success: true,
      data: mockProperty,
      isFallback: true,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  }

  // Not found in both database and mock registry
  const notFoundResponse: ApiResponse = {
    success: false,
    error: `Property listing '${id}' not found`,
    timestamp,
  };
  return NextResponse.json(notFoundResponse, { status: 404 });
}

/**
 * PATCH /api/properties/[id]
 * Updates an existing property listing.
 * Enforces ownership: only the owner or an admin may edit the listing.
 * Anti-privilege escalation: owners cannot self-verify. Edits by owners
 * reset status to 'pending' so administrators can re-verify.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    const response: ApiResponse = {
      success: false,
      error: "Authentication required to update property listings.",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = updatePropertySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectToDatabase();

    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const property = await Property.findOne({ $or: orConditions });

    if (!property) {
      const response: ApiResponse = {
        success: false,
        error: `Listing '${id}' not found.`,
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Ownership check
    const isOwner = String(property.ownerId) === String(auth.user._id);
    const isAdmin =
      auth.role === "ADMIN" ||
      auth.role === "SUPER_ADMIN" ||
      auth.role === "STAFF";

    if (!isOwner && !isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden: You do not have permission to edit this listing.",
        timestamp,
      };
      return NextResponse.json(response, { status: 403 });
    }

    const data = parseResult.data;

    // Apply allowed updates
    if (data.title !== undefined) property.title = data.title;
    if (data.titleBangla !== undefined) property.titleBangla = data.titleBangla;
    if (data.type !== undefined) property.type = data.type;
    if (data.description !== undefined) property.description = data.description;
    if (data.rent !== undefined) property.rent = data.rent;
    if (data.serviceCharge !== undefined) property.serviceCharge = data.serviceCharge;
    if (data.securityDeposit !== undefined) property.securityDeposit = data.securityDeposit;
    if (data.bedrooms !== undefined) property.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) property.bathrooms = data.bathrooms;
    if (data.balconies !== undefined) property.balconies = data.balconies;
    if (data.sizeSqFt !== undefined) property.sizeSqFt = data.sizeSqFt;
    if (data.floor !== undefined) property.floor = data.floor;
    if (data.roomType !== undefined) property.roomType = data.roomType;
    if (data.seatsAvailable !== undefined) property.seatsAvailable = data.seatsAvailable;
    if (data.facilities !== undefined) property.facilities = data.facilities;
    if (data.availability !== undefined) property.availability = data.availability;
    if (data.featuredImage !== undefined) property.featuredImage = data.featuredImage;
    if (data.images !== undefined) property.images = data.images;
    if (data.genderPreference !== undefined) property.genderPreference = data.genderPreference;
    if (data.tenantType !== undefined) property.tenantType = data.tenantType;
    if (data.houseRules !== undefined) property.houseRules = data.houseRules;

    if (data.location) {
      property.location = {
        ...property.location,
        ...data.location,
      };
    }

    // Anti-privilege escalation:
    // If updated by non-admin owner, reset to pending verification for safety inspection
    if (!isAdmin) {
      // Owner cannot self-verify
      property.isVerified = false;
      property.status = "pending";
      property.reviewedAt = undefined;
      property.reviewedBy = undefined;
      // If property was scam-suppressed, owner cannot unilaterally unhide it
      if (property.isHiddenFromSearch) {
        property.isHiddenFromSearch = true;
      }
    } else {
      // Admin update can explicitly control status and visibility
      if (data.isVerified !== undefined) property.isVerified = data.isVerified;
      if (data.status !== undefined) property.status = data.status;
      if (data.isHiddenFromSearch !== undefined) property.isHiddenFromSearch = data.isHiddenFromSearch;
    }

    await property.save();

    // Record in audit log
    await ModerationAuditLog.create({
      targetType: "listing",
      targetId: property.customId || String(property._id),
      targetTitle: property.title,
      action: isAdmin ? "listing_admin_updated" : "listing_owner_edited",
      adminUser: auth.user.fullName,
      adminUserId: auth.user._id,
      notes: isAdmin
        ? "Listing updated by administrator."
        : "Listing edited by owner. Status reset to pending verification.",
    });

    const formatted = formatPropertyForPublic(property);
    const response: ApiResponse<typeof formatted> = {
      success: true,
      message: isAdmin
        ? "Listing updated successfully."
        : "Listing updated and resubmitted for admin verification.",
      data: formatted,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Update Property Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update property listing.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/properties/[id]
 * Deletes or deactivates an accommodation listing.
 * Enforces ownership: only owner or administrator may delete.
 * Safe handling: if active scam reports exist, listing is safely deactivated
 * rather than destroying evidence.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    const response: ApiResponse = {
      success: false,
      error: "Authentication required to delete property listings.",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  }

  try {
    await connectToDatabase();

    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const property = await Property.findOne({ $or: orConditions });

    if (!property) {
      const response: ApiResponse = {
        success: false,
        error: `Listing '${id}' not found.`,
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Ownership check
    const isOwner = String(property.ownerId) === String(auth.user._id);
    const isAdmin =
      auth.role === "ADMIN" ||
      auth.role === "SUPER_ADMIN" ||
      auth.role === "STAFF";

    if (!isOwner && !isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden: You do not have permission to delete this listing.",
        timestamp,
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Check for active scam reports to prevent destroying moderation evidence
    const propIdentifiers = [
      property.customId,
      String(property._id),
      property.slug,
    ].filter(Boolean) as string[];

    const activeReport = await ScamReport.findOne({
      propertyId: { $in: propIdentifiers },
      status: { $in: ["awaiting_review", "investigating", "confirmed_fraud"] },
    });

    if (activeReport) {
      // Safe deactivation instead of hard-deletion
      property.isHiddenFromSearch = true;
      property.status = "rejected";
      property.availability = "Deactivated (Under Safety Review)";
      await property.save();

      await ModerationAuditLog.create({
        targetType: "listing",
        targetId: property.customId || String(property._id),
        targetTitle: property.title,
        action: "listing_deactivated_safety",
        adminUser: auth.user.fullName,
        adminUserId: auth.user._id,
        notes:
          "Listing deletion converted to safe deactivation due to active scam reports.",
      });

      const response: ApiResponse = {
        success: true,
        message:
          "Listing has been deactivated and removed from public search (retained for safety review).",
        timestamp,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // No active fraud reports: proceed with deletion
    await Property.deleteOne({ _id: property._id });

    await ModerationAuditLog.create({
      targetType: "listing",
      targetId: property.customId || String(property._id),
      targetTitle: property.title,
      action: "listing_deleted",
      adminUser: auth.user.fullName,
      adminUserId: auth.user._id,
      notes: "Listing permanently deleted by owner/admin.",
    });

    const response: ApiResponse = {
      success: true,
      message: "Listing deleted successfully.",
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Delete Property Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete property listing.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
