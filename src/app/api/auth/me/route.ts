import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import type { ApiResponse, IUser } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const { auth, response } = await requireAuth(req);

  if (response || !auth.user) {
    return response;
  }

  const result: ApiResponse<{ user: IUser; isDemoUser: boolean }> = {
    success: true,
    data: {
      user: auth.user,
      isDemoUser: auth.isDemoUser,
    },
    timestamp,
  };

  return NextResponse.json(result, { status: 200 });
}
