import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { requireRole } from "@/lib/auth-server";
import { ownerVerificationSchema } from "@/lib/ownerVerificationSchema";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export const submitVerificationSchema = ownerVerificationSchema;

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  const { auth, response } = await requireRole(req, ["OWNER", "ADMIN", "SUPER_ADMIN"]);
  if (response || !auth.user) {
    return response;
  }

  try {
    await connectToDatabase();

    const user = await User.findById(auth.user._id);
    if (!user) {
      const res: ApiResponse = {
        success: false,
        error: "Owner user account not found",
        timestamp,
      };
      return NextResponse.json(res, { status: 404 });
    }

    const res: ApiResponse<{
      nidVerified: boolean;
      nidStatus: "unverified" | "pending" | "verified" | "rejected";
      nidNumber: string;
      dob: string;
      holdingTaxNumber: string;
      propertyAddress: string;
      submittedAt?: string;
      reviewedAt?: string;
      adminNotes?: string;
    }> = {
      success: true,
      data: {
        nidVerified: Boolean(user.nidVerified),
        nidStatus: user.nidStatus || "unverified",
        nidNumber: user.nidNumber || "",
        dob: user.nidDob || user.dob || "",
        holdingTaxNumber: user.holdingTaxNumber || "",
        propertyAddress: user.nidPropertyLocation || "",
        submittedAt: user.nidSubmittedAt ? new Date(user.nidSubmittedAt).toISOString() : undefined,
        reviewedAt: user.nidReviewedAt ? new Date(user.nidReviewedAt).toISOString() : undefined,
        adminNotes: user.nidAdminNotes,
      },
      timestamp,
    };

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("[OwnerVerification GET Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "Failed to retrieve verification status",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  const { auth, response } = await requireRole(req, ["OWNER", "ADMIN", "SUPER_ADMIN"]);
  if (response || !auth.user) {
    return response;
  }

  try {
    const rawBody = await req.json();
    const parseResult = submitVerificationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const res: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { nidNumber, dob, holdingTaxNumber, propertyAddress } = parseResult.data;

    await connectToDatabase();

    const user = await User.findById(auth.user._id);
    if (!user) {
      const res: ApiResponse = {
        success: false,
        error: "User not found",
        timestamp,
      };
      return NextResponse.json(res, { status: 404 });
    }

    if (user.nidVerified && user.nidStatus === "verified") {
      const res: ApiResponse = {
        success: false,
        error: "Your Government NID is already verified. If you need to update credentials, please contact support.",
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    const now = new Date();
    user.nidNumber = nidNumber;
    user.nidDob = dob;
    user.dob = dob;
    user.holdingTaxNumber = holdingTaxNumber;
    user.nidPropertyLocation = propertyAddress;
    user.nidStatus = "pending";
    user.nidVerified = false;
    user.nidSubmittedAt = now;
    user.nidAdminNotes = undefined;

    await user.save();

    // Audit log
    const auditLog = new ModerationAuditLog({
      targetType: "owner",
      targetId: String(user._id),
      targetTitle: user.fullName,
      action: "Owner Submitted NID Verification",
      adminUser: user.fullName,
      adminUserId: mongoose.Types.ObjectId.isValid(user._id) ? new mongoose.Types.ObjectId(user._id) : undefined,
      notes: `Submitted NID: ${nidNumber}, DOB: ${dob}, Holding Tax: ${holdingTaxNumber}`,
    });
    await auditLog.save();

    const res: ApiResponse<{
      nidStatus: string;
      nidNumber: string;
      dob: string;
      holdingTaxNumber: string;
      submittedAt: string;
    }> = {
      success: true,
      message: "Government NID and holding tax verification documents submitted successfully! Admin will inspect within 12 business hours.",
      data: {
        nidStatus: user.nidStatus,
        nidNumber: user.nidNumber,
        dob: user.nidDob,
        holdingTaxNumber: user.holdingTaxNumber,
        submittedAt: now.toISOString(),
      },
      timestamp,
    };

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("[OwnerVerification POST Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while submitting verification documents.",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
