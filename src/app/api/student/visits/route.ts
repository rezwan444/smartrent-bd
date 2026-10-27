import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { VisitRequest } from "@/models/VisitRequest";
import { getAuthenticatedUser } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const auth = await getAuthenticatedUser(req);

  if (!auth.isAuthenticated || !auth.user) {
    const response: ApiResponse = {
      success: false,
      error: "Authentication required",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  }

  try {
    await connectToDatabase();
    const visits = await VisitRequest.find({ studentId: auth.user._id })
      .sort({ createdAt: -1 })
      .lean();

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
    console.error("[Student Visits Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch visits", timestamp },
      { status: 500 }
    );
  }
}
