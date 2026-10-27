import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { MaintenanceTicket } from "@/models/MaintenanceTicket";
import { requireRole } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateTicketSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved"]),
  technicianNotes: z.string().optional(),
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
    const parsed = updateTicketSchema.safeParse(body);
    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid status value",
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectToDatabase();

    const ticket = await MaintenanceTicket.findById(id);
    if (!ticket) {
      const response: ApiResponse = {
        success: false,
        error: "Maintenance ticket not found",
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Ownership gate
    const isOwner = ticket.ownerId && String(ticket.ownerId) === String(auth.user._id);
    const isAdmin = auth.role === "ADMIN" || auth.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      const response: ApiResponse = {
        success: false,
        error: "Forbidden: You can only update maintenance tickets for your own properties.",
        timestamp,
      };
      return NextResponse.json(response, { status: 403 });
    }

    ticket.status = parsed.data.status;
    if (parsed.data.technicianNotes) {
      ticket.technicianNotes = parsed.data.technicianNotes;
    }
    await ticket.save();

    const response: ApiResponse = {
      success: true,
      message: `Maintenance ticket status updated to ${ticket.status}.`,
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Update Maintenance Ticket Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update maintenance ticket.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
