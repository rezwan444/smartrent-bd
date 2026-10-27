import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";
import type { ModerationAuditLog as ModerationAuditLogType } from "@/types/moderation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // 1. Enforce Server-Side Admin Authorization
  const { auth, response } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "STAFF"]);
  if (response || !auth.user) {
    return response;
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

  try {
    await connectToDatabase();

    const dbLogs = await ModerationAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const logs: ModerationAuditLogType[] = dbLogs.map((l) => ({
      id: String(l._id),
      timestamp: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
      targetType: l.targetType,
      targetId: l.targetId,
      targetTitle: l.targetTitle,
      action: l.action,
      adminUser: l.adminUser,
      notes: l.notes,
    }));

    const result: ApiResponse<{ logs: ModerationAuditLogType[] }> = {
      success: true,
      data: { logs },
      timestamp,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GetModerationLogs Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "Failed to retrieve moderation logs",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
