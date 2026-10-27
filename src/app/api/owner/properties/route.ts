import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, formatPropertyForPublic } from "@/models/Property";
import { requireRole } from "@/lib/auth-server";
import { getOwnerProperties } from "@/lib/propertyModerationStorage";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

/**
 * GET /api/owner/properties
 * Returns all listings belonging to the authenticated owner.
 * Returns listings across all moderation statuses (pending, verified, rejected, hidden).
 */
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  const { auth, response: authResponse } = await requireRole(req, [
    "OWNER",
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF",
  ]);

  if (authResponse || !auth.user) {
    return authResponse;
  }

  try {
    await connectToDatabase();

    const properties = await Property.find({ ownerId: auth.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (properties.length > 0) {
      const formatted = properties.map((p) => {
        const publicDoc = formatPropertyForPublic(p);
        return {
          ...publicDoc,
          status: p.status,
          isVerified: p.isVerified,
          isHiddenFromSearch: p.isHiddenFromSearch,
          adminNotes: p.moderationNotes,
        };
      });

      const response: ApiResponse<typeof formatted> = {
        success: true,
        data: formatted,
        timestamp,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // For a real registered database user with no properties yet, return an empty array
    if (!auth.isDemoUser) {
      const response: ApiResponse<unknown[]> = {
        success: true,
        data: [],
        timestamp,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // For demo session fallback only
    const demoItems = getOwnerProperties(auth.user.fullName);
    const response: ApiResponse<typeof demoItems> & { isDemoFallback: boolean } = {
      success: true,
      data: demoItems,
      isDemoFallback: true,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Owner Properties Error]:", err);
    if (!auth.isDemoUser) {
      const response: ApiResponse<unknown[]> = {
        success: true,
        data: [],
        timestamp,
      };
      return NextResponse.json(response, { status: 200 });
    }
    const demoItems = getOwnerProperties(auth.user.fullName);
    const response: ApiResponse<typeof demoItems> & { isDemoFallback: boolean } = {
      success: true,
      data: demoItems,
      isDemoFallback: true,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  }
}
