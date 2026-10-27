import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/mongodb";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getDatabaseHealth();
  const timestamp = new Date().toISOString();

  if (!health.isConnected) {
    const errorResponse: ApiResponse<{ database: typeof health }> = {
      success: false,
      message: "Database connection unavailable",
      error: `Database is currently in '${health.state}' state`,
      data: { database: health },
      timestamp,
    };
    return NextResponse.json(errorResponse, { status: 503 });
  }

  const successResponse: ApiResponse<{ database: typeof health }> = {
    success: true,
    message: "Database connected and responsive",
    data: { database: health },
    timestamp,
  };

  return NextResponse.json(successResponse, { status: 200 });
}
