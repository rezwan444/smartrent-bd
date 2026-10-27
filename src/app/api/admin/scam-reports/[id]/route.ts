import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ScamReport } from "@/models/ScamReport";
import { Property } from "@/models/Property";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const moderateScamSchema = z.object({
  action: z.enum(["dismiss", "confirm_fraud", "investigate"], {
    message: "Action must be 'dismiss', 'confirm_fraud', or 'investigate'",
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
    const parseResult = moderateScamSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const res: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { action, notes } = parseResult.data;

    await connectToDatabase();

    // 2. Find target scam report
    let report = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await ScamReport.findById(id);
    }
    if (!report) {
      report = await ScamReport.findOne({ _id: id });
    }

    if (!report) {
      const res: ApiResponse = {
        success: false,
        error: `Scam report '${id}' not found`,
        timestamp,
      };
      return NextResponse.json(res, { status: 404 });
    }

    const now = new Date();
    let actionLabel = "";
    const propertyActionNotes = notes || "";

    // 3. Resolve target property in MongoDB
    const propOrConditions: Array<Record<string, unknown>> = [
      { customId: report.propertyId },
      { slug: report.propertyId },
    ];
    if (mongoose.Types.ObjectId.isValid(report.propertyId)) {
      propOrConditions.push({ _id: report.propertyId });
    }
    const property = await Property.findOne({ $or: propOrConditions });

    // 4. Apply Moderation Decision
    if (action === "dismiss") {
      report.status = "dismissed";
      report.actionTaken = "restored";
      report.resolvedAt = now;
      report.adminNotes = notes || "Investigated and found compliant with platform standards. False report dismissed.";
      actionLabel = "Report Dismissed & Listing Restored";

      // Restore listing to public search if not otherwise rejected
      if (property && property.status !== "rejected") {
        // Check if there are other active reports on this property
        const otherActiveReports = await ScamReport.countDocuments({
          propertyId: report.propertyId,
          _id: { $ne: report._id },
          status: { $in: ["awaiting_review", "investigating", "confirmed_fraud"] },
        });

        if (otherActiveReports === 0) {
          property.isHiddenFromSearch = false;
          await property.save();
        }
      }
    } else if (action === "confirm_fraud") {
      report.status = "confirmed_fraud";
      report.actionTaken = "delisted";
      report.resolvedAt = now;
      report.adminNotes = notes || "Confirmed fraud. Listing removed permanently.";
      actionLabel = "Scam Confirmed & Listing Permanently De-listed";

      // Permanently de-list listing
      if (property) {
        property.status = "rejected";
        property.isVerified = false;
        property.isHiddenFromSearch = true;
        property.moderationNotes = notes || "Permanently delisted due to confirmed fraudulent activity.";
        property.reviewedAt = now;
        await property.save();
      }
    } else {
      // "investigate"
      report.status = "investigating";
      report.actionTaken = "under_investigation";
      report.adminNotes = notes || "Assigned for on-site verification.";
      actionLabel = "Marked for On-site Inspection";

      // Keep listing hidden during investigation
      if (property) {
        property.isHiddenFromSearch = true;
        await property.save();
      }
    }

    if (mongoose.Types.ObjectId.isValid(auth.user._id)) {
      report.reviewedBy = new mongoose.Types.ObjectId(auth.user._id);
    }
    await report.save();

    // 5. Record Moderation Audit Log
    const auditLog = new ModerationAuditLog({
      targetType: "scam_report",
      targetId: String(report._id),
      targetTitle: report.propertyTitle,
      action: actionLabel,
      adminUser: auth.user.fullName || "Admin Officer",
      adminUserId: mongoose.Types.ObjectId.isValid(auth.user._id) ? new mongoose.Types.ObjectId(auth.user._id) : undefined,
      notes: report.adminNotes || propertyActionNotes,
    });
    await auditLog.save();

    const res: ApiResponse<{
      reportId: string;
      status: string;
      actionTaken: string;
      resolvedAt?: string;
      adminNotes?: string;
    }> = {
      success: true,
      message: `Scam report updated: ${actionLabel}.`,
      data: {
        reportId: String(report._id),
        status: report.status,
        actionTaken: report.actionTaken || "under_investigation",
        resolvedAt: report.resolvedAt ? report.resolvedAt.toISOString() : undefined,
        adminNotes: report.adminNotes,
      },
      timestamp,
    };

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("[ModerateScamReport Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while processing scam report.",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
