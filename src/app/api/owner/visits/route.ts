import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VisitRequest } from "@/models/VisitRequest";
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

    const visits = await VisitRequest.find(query).sort({ createdAt: -1 }).lean();

    const response: ApiResponse<unknown> = {
      success: true,
      data: visits.map((v) => ({
        ...v,
        id: String(v._id),
        _id: String(v._id),
      })),
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Owner Visits GET Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch visit requests.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
