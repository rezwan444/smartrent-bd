import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { MaintenanceTicket } from "@/models/MaintenanceTicket";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();

  const { auth, response: authResponse } = await requireRole(req, [
    "OWNER",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (authResponse || !auth.user) {
    return authResponse;
  }

  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN") {
      query.ownerId = auth.user._id;
    }

    const tickets = await MaintenanceTicket.find(query).sort({ createdAt: -1 }).lean();

    const response: ApiResponse<unknown> = {
      success: true,
      data: tickets.map((t) => ({
        ...t,
        id: String(t._id),
        _id: String(t._id),
      })),
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Owner Maintenance GET Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch maintenance tickets.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
