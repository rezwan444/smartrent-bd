import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, formatPropertyForPublic } from "@/models/Property";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getPropertyById } from "@/data/mockProperties";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/properties/[id]
 * Retrieves single accommodation listing details.
 * Protects against public exposure of rejected or scam-suppressed listings.
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
      // Check scam suppression or rejection
      const isSuppressed = property.isHiddenFromSearch || property.status === "rejected";

      if (isSuppressed) {
        // Only allow listing owner or moderators to access a suppressed/rejected listing
        const auth = await getAuthenticatedUser(req);
        const isOwner = auth.user && String(property.ownerId) === String(auth.user._id);
        const isAdmin = auth.role === "ADMIN" || auth.role === "SUPER_ADMIN";

        if (!isOwner && !isAdmin) {
          const response: ApiResponse = {
            success: false,
            error: "This listing is temporarily unavailable or undergoing safety review.",
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
