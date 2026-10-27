import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ScamReport } from "@/models/ScamReport";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";
import type { ScamReport as ScamReportType } from "@/types/moderation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // 1. Enforce Server-Side Admin Authorization
  const { auth, response } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "STAFF"]);
  if (response || !auth.user) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";

  try {
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterQuery: Record<string, any> = {};
    if (status !== "all") {
      filterQuery.status = status;
    }

    const reports = await ScamReport.find(filterQuery).sort({ createdAt: -1 }).limit(100).lean();

    const formattedReports: ScamReportType[] = reports.map((r) => ({
      id: String(r._id),
      propertyId: r.propertyId,
      propertyTitle: r.propertyTitle,
      propertyLocation: r.propertyLocation || "Dhaka, Bangladesh",
      reportedBy: r.reportedByName || "Verified Tenant",
      reason: r.reason,
      details: r.details,
      contactInfo: r.contactInfo,
      status: r.status,
      reportedAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : undefined,
      adminNotes: r.adminNotes,
      actionTaken: r.actionTaken,
    }));

    const result: ApiResponse<{
      reports: ScamReportType[];
      counts: {
        total: number;
        awaitingReview: number;
        investigating: number;
        confirmedFraud: number;
        dismissed: number;
      };
    }> = {
      success: true,
      data: {
        reports: formattedReports,
        counts: {
          total: formattedReports.length,
          awaitingReview: formattedReports.filter((r) => r.status === "awaiting_review").length,
          investigating: formattedReports.filter((r) => r.status === "investigating").length,
          confirmedFraud: formattedReports.filter((r) => r.status === "confirmed_fraud").length,
          dismissed: formattedReports.filter((r) => r.status === "dismissed").length,
        },
      },
      timestamp,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GetScamReports Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "Failed to retrieve scam reports",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
