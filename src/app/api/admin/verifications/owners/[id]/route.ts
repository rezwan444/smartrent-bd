import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const verifyOwnerSchema = z.object({
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
    const parseResult = verifyOwnerSchema.safeParse(rawBody);

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

    // 2. Resolve target owner
    let owner = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      owner = await User.findById(id);
    }
    if (!owner) {
      owner = await User.findOne({ email: id.toLowerCase() });
    }

    if (!owner) {
      const res: ApiResponse = {
        success: false,
        error: `Owner account '${id}' not found`,
        timestamp,
      };
      return NextResponse.json(res, { status: 404 });
    }

    // 3. CRUCIAL RULE: Prevent self-verification / self-approval
    // If the admin user is trying to verify their own account, reject!
    if (String(owner._id) === String(auth.user._id)) {
      const res: ApiResponse = {
        success: false,
        error: "Forbidden: You cannot verify or approve your own owner identity. Another authorized administrator must review your documents.",
        timestamp,
      };
      return NextResponse.json(res, { status: 403 });
    }

    const isApproved = decision === "approve";
    const now = new Date();
    const adminNotes = notes || (isApproved ? "Govt NID verified against national identity database." : "Owner documents failed verification check.");

    // 4. Update Owner status
    owner.nidVerified = isApproved;
    owner.nidStatus = isApproved ? "verified" : "rejected";
    owner.nidAdminNotes = adminNotes;
    owner.nidReviewedAt = now;
    if (mongoose.Types.ObjectId.isValid(auth.user._id)) {
      owner.nidReviewedBy = new mongoose.Types.ObjectId(auth.user._id);
    }
    await owner.save();

    // 5. If approved, update all properties belonging to this owner with verified owner badge
    if (isApproved) {
      await Property.updateMany(
        { ownerId: owner._id },
        {
          $set: {
            "owner.isVerified": true,
          },
        }
      );
    }

    // 6. Record Moderation Audit Log
    const auditLog = new ModerationAuditLog({
      targetType: "owner",
      targetId: String(owner._id),
      targetTitle: owner.fullName,
      action: isApproved ? "Owner NID Approved & Verified" : "Owner NID Rejected",
      adminUser: auth.user.fullName || "Admin Officer",
      adminUserId: mongoose.Types.ObjectId.isValid(auth.user._id) ? new mongoose.Types.ObjectId(auth.user._id) : undefined,
      notes: adminNotes,
    });
    await auditLog.save();

    const res: ApiResponse<{
      ownerId: string;
      ownerName: string;
      nidVerified: boolean;
      nidStatus: string;
      dob?: string;
      reviewedAt: string;
      reviewedBy: string;
    }> = {
      success: true,
      message: isApproved
        ? `Owner ${owner.fullName}'s NID verified successfully.`
        : `Owner ${owner.fullName}'s NID verification rejected.`,
      data: {
        ownerId: String(owner._id),
        ownerName: owner.fullName,
        nidVerified: owner.nidVerified,
        nidStatus: owner.nidStatus,
        dob: owner.nidDob || owner.dob || "",
        reviewedAt: now.toISOString(),
        reviewedBy: auth.user.fullName,
      },
      timestamp,
    };

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("[VerifyOwner Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while verifying owner identity.",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
