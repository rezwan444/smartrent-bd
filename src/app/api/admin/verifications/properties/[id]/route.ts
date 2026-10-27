import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const verifyPropertySchema = z.object({
  decision: z.enum(["approve", "reject"], {
    message: "Decision must be either 'approve' or 'reject'",
  }),
  notes: z.string().trim().optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  // 1. Enforce Server-Side Admin Authorization
  const { auth, response } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "STAFF"]);
  if (response || !auth.user) {
    return response;
  }

  try {
    const rawBody = await req.json();
    const parseResult = verifyPropertySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const res: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { decision, notes } = parseResult.data;

    await connectToDatabase();

    // 2. Resolve target property
    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const property = await Property.findOne({ $or: orConditions });
    if (!property) {
      const res: ApiResponse = {
        success: false,
        error: `Property listing '${id}' not found`,
        timestamp,
      };
      return NextResponse.json(res, { status: 404 });
    }

    // 3. CRUCIAL RULE: Prevent self-verification / self-approval
    // If the admin user owns this property, reject the verification attempt
    if (property.ownerId && String(property.ownerId) === String(auth.user._id)) {
      const res: ApiResponse = {
        success: false,
        error: "Forbidden: You cannot approve or verify your own property listing. An independent administrator must review it.",
        timestamp,
      };
      return NextResponse.json(res, { status: 403 });
    }

    const isApproved = decision === "approve";
    const now = new Date();
    const adminNotes = notes || (isApproved ? "Listing inspected and verified by moderation team." : "Listing rejected due to non-compliance with quality or safety standards.");

    // 4. Update Property status
    property.status = isApproved ? "verified" : "rejected";
    property.isVerified = isApproved;
    // Approved listings are visible; rejected listings are hidden
    property.isHiddenFromSearch = !isApproved;
    property.moderationNotes = adminNotes;
    property.reviewedAt = now;
    if (mongoose.Types.ObjectId.isValid(auth.user._id)) {
      property.reviewedBy = new mongoose.Types.ObjectId(auth.user._id);
    }
    await property.save();

    // 5. Record Moderation Audit Log
    const auditLog = new ModerationAuditLog({
      targetType: "listing",
      targetId: String(property._id),
      targetTitle: property.title,
      action: isApproved ? "Listing Approved & Verified" : "Listing Rejected",
      adminUser: auth.user.fullName || "Admin Officer",
      adminUserId: mongoose.Types.ObjectId.isValid(auth.user._id) ? new mongoose.Types.ObjectId(auth.user._id) : undefined,
      notes: adminNotes,
    });
    await auditLog.save();

    const res: ApiResponse<{
      propertyId: string;
      status: string;
      isVerified: boolean;
      isHiddenFromSearch: boolean;
      reviewedAt: string;
      reviewedBy: string;
    }> = {
      success: true,
      message: isApproved
        ? `Listing "${property.title}" approved and verified successfully.`
        : `Listing "${property.title}" rejected and hidden from public search.`,
      data: {
        propertyId: String(property._id),
        status: property.status,
        isVerified: property.isVerified,
        isHiddenFromSearch: property.isHiddenFromSearch,
        reviewedAt: now.toISOString(),
        reviewedBy: auth.user.fullName,
      },
      timestamp,
    };

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("[VerifyProperty Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while verifying listing.",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
