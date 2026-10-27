import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { VisitRequest } from "@/models/VisitRequest";
import { getAuthenticatedUser } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const visitRequestSchema = z.object({
  preferredDate: z.string().min(1, "Preferred date is required"),
  timeSlot: z.string().min(1, "Preferred time slot is required"),
  contactPhone: z.string().min(6, "Valid contact phone is required"),
  visitorCount: z.string().default("1"),
  notes: z.string().optional(),
  studentName: z.string().optional(),
  studentEmail: z.string().email().optional(),
  institution: z.string().optional(),
});

export async function POST(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = visitRequestSchema.safeParse(body);

    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(". "),
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectToDatabase();

    // Find the property to link to owner
    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const prop = await Property.findOne({ $or: orConditions }).lean();
    if (!prop) {
      const response: ApiResponse = {
        success: false,
        error: "Property not found",
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    const auth = await getAuthenticatedUser(req);
    const studentUser = auth.user;

    const data = parsed.data;
    const studentName = studentUser?.fullName || data.studentName || "Prospective Tenant";
    const studentEmail = studentUser?.email || data.studentEmail || "";
    const studentId = studentUser && !auth.isDemoUser ? studentUser._id : undefined;

    const newVisit = new VisitRequest({
      propertyId: prop.customId || String(prop._id),
      propertyTitle: prop.title,
      propertyAddress: prop.location?.address || prop.location?.neighborhood || "",
      studentId,
      studentName,
      studentEmail,
      institution: data.institution || "University Student",
      ownerId: prop.ownerId,
      preferredDate: data.preferredDate,
      timeSlot: data.timeSlot,
      contactPhone: data.contactPhone,
      visitorCount: data.visitorCount,
      notes: data.notes || "",
      status: "pending",
    });

    await newVisit.save();

    const response: ApiResponse<{ visitId: string }> = {
      success: true,
      message: "Visit request submitted successfully! The property owner has been notified.",
      data: { visitId: String(newVisit._id) },
      timestamp,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[Create Visit Request Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to submit visit request.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
