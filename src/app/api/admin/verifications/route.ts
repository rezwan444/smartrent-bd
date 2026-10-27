import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";
import type { ModeratedPropertyItem, OwnerVerificationSubmission } from "@/types/moderation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // 1. Enforce Server-Side Admin Authorization
  const { auth, response } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "STAFF"]);
  if (response || !auth.user) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const status = searchParams.get("status") || "all";

  try {
    await connectToDatabase();

    let properties: ModeratedPropertyItem[] = [];
    let owners: OwnerVerificationSubmission[] = [];

    // 2. Fetch Listings for Verification
    if (type === "all" || type === "listings") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const propFilter: Record<string, any> = {};
      if (status !== "all") {
        propFilter.status = status;
      }

      const dbProps = await Property.find(propFilter).sort({ createdAt: -1 }).limit(100).lean();

      properties = dbProps.map((p) => ({
        id: String(p.customId || p._id),
        title: p.title,
        type: p.type,
        location: `${p.location?.neighborhood || ""}, ${p.location?.city || ""}`.trim().replace(/^, |, $/g, ""),
        rent: `৳ ${p.rent.toLocaleString()} / mo`,
        ownerName: p.owner?.name || "Landlord",
        ownerPhone: p.owner?.phone || "+880 1700-000000",
        nidStatus: p.owner?.isVerified ? "Verified" : "Submitted (Pending)",
        status: (p.status as ModeratedPropertyItem["status"]) || "pending",
        isHiddenFromSearch: Boolean(p.isHiddenFromSearch),
        submittedAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        reviewedAt: p.reviewedAt ? new Date(p.reviewedAt).toISOString() : undefined,
        adminNotes: p.moderationNotes,
      }));
    }

    // 3. Fetch Owners for NID Verification
    if (type === "all" || type === "owners") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userFilter: Record<string, any> = {
        role: "OWNER",
      };

      if (status === "pending") {
        userFilter.nidStatus = "pending";
      } else if (status === "approved" || status === "verified") {
        userFilter.nidVerified = true;
      } else if (status === "rejected") {
        userFilter.nidStatus = "rejected";
      }

      const dbOwners = await User.find(userFilter).sort({ createdAt: -1 }).limit(100).lean();

      owners = dbOwners.map((u) => {
        let submissionStatus: "pending" | "approved" | "rejected" = "pending";
        if (u.nidVerified) {
          submissionStatus = "approved";
        } else if (u.nidStatus === "rejected") {
          submissionStatus = "rejected";
        }

        return {
          id: String(u._id),
          ownerId: String(u._id),
          ownerName: u.fullName,
          ownerPhone: u.phone || "+880 1800-000000",
          ownerEmail: u.email,
          nidNumber: u.nidNumber || "1985-2692-4401-29",
          dob: u.nidDob || u.dob || "",
          holdingTaxNumber: u.holdingTaxNumber || "DNCC-HOLD-84920",
          propertyLocation: u.nidPropertyLocation || u.location || "Dhaka, Bangladesh",
          submittedAt: u.nidSubmittedAt
            ? new Date(u.nidSubmittedAt).toISOString()
            : u.createdAt
            ? new Date(u.createdAt).toISOString()
            : new Date().toISOString(),
          status: submissionStatus,
          reviewedAt: u.nidReviewedAt ? new Date(u.nidReviewedAt).toISOString() : undefined,
          adminNotes: u.nidAdminNotes,
        };
      });
    }

    const result: ApiResponse<{
      properties: ModeratedPropertyItem[];
      owners: OwnerVerificationSubmission[];
      counts: {
        pendingListings: number;
        pendingOwners: number;
      };
    }> = {
      success: true,
      data: {
        properties,
        owners,
        counts: {
          pendingListings: properties.filter((p) => p.status === "pending").length,
          pendingOwners: owners.filter((o) => o.status === "pending").length,
        },
      },
      timestamp,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GetVerifications Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to retrieve verification submissions",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
