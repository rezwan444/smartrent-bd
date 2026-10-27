import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { VisitRequest } from "@/models/VisitRequest";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateVisitSchema = z.object({
  status: z.enum(["pending", "approved", "declined", "completed"]),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  const { auth, response: authResponse } = await requireRole(req, [
    "OWNER",
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  if (authResponse || !auth.user) {
    return authResponse;
  }

  try {
    const body = await req.json();
    const parsed = updateVisitSchema.safeParse(body);
    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid status value",
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectToDatabase();

    const visit = await VisitRequest.findById(id);
    if (!visit) {
      const response: ApiResponse = {
        success: false,
        error: "Visit request not found",
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Ownership gate
    const isOwner = visit.ownerId && String(visit.ownerId) === String(auth.user._id);
    const isAdmin = auth.role === "ADMIN" || auth.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden: You can only manage visit requests for your own listings.",
        timestamp,
      };
      return NextResponse.json(response, { status: 403 });
    }

    visit.status = parsed.data.status;
    await visit.save();

    const response: ApiResponse = {
      success: true,
      message: `Visit request marked as ${visit.status}.`,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Update Visit Request Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update visit request.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
