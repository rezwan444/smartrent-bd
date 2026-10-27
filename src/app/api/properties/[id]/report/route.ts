import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { ScamReport } from "@/models/ScamReport";
import { ModerationAuditLog } from "@/models/ModerationAuditLog";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getPropertyById } from "@/data/mockProperties";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const reportBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Report reason must be at least 5 characters long")
    .max(200, "Report reason cannot exceed 200 characters"),
  details: z
    .string()
    .trim()
    .max(1000, "Details cannot exceed 1000 characters")
    .optional(),
  contactInfo: z
    .string()
    .trim()
    .max(100, "Contact info cannot exceed 100 characters")
    .optional(),
});

export async function POST(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  if (!id || typeof id !== "string") {
    const response: ApiResponse = {
      success: false,
      error: "Invalid property identifier",
      timestamp,
    };
    return NextResponse.json(response, { status: 400 });
  }

  // 1. Authenticate reporter
  const auth = await getAuthenticatedUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    const response: ApiResponse = {
      success: false,
      error: "Authentication required to report a listing. Please sign in.",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const parseResult = reportBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { reason, details, contactInfo } = parseResult.data;

    await connectToDatabase();

    // 2. Resolve property
    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    const property = await Property.findOne({ $or: orConditions });
    let propertyTitle = property?.title;
    let propertyLocation = property
      ? `${property.location?.neighborhood || ""}, ${property.location?.city || ""}`
      : "Dhaka, Bangladesh";

    // Fallback to mock property if not yet in MongoDB
    if (!property) {
      const mock = getPropertyById(id);
      if (mock) {
        propertyTitle = mock.title;
        propertyLocation = `${mock.location.neighborhood}, ${mock.location.city}`;
      } else {
        const response: ApiResponse = {
          success: false,
          error: "Property not found",
          timestamp,
        };
        return NextResponse.json(response, { status: 404 });
      }
    }

    const propertyIdentifier = property ? String(property._id) : id;

    // 3. Duplicate / spam submission protection: check if same user already reported this property and it is still pending
    const existingReport = await ScamReport.findOne({
      propertyId: propertyIdentifier,
      reportedByUserId: auth.user._id,
      status: { $in: ["awaiting_review", "investigating"] },
    });

    if (existingReport) {
      const response: ApiResponse = {
        success: false,
        error: "You have already submitted a safety report for this listing. It is currently under administrative review.",
        timestamp,
      };
      return NextResponse.json(response, { status: 409 });
    }

    // 4. Create persistent ScamReport record
    const newReport = new ScamReport({
      propertyId: propertyIdentifier,
      propertyTitle: propertyTitle || "Accommodation Listing",
      propertyLocation,
      reportedByUserId: auth.user._id,
      reportedByName: auth.user.fullName,
      reportedByEmail: auth.user.email,
      reportedByPhone: auth.user.phone,
      reason,
      details: details || "",
      contactInfo: contactInfo || auth.user.phone || auth.user.email,
      status: "awaiting_review",
      actionTaken: "hidden_from_search",
    });

    await newReport.save();

    // 5. Automatically hide property from public search during safety review
    if (property) {
      await Property.updateOne(
        { _id: property._id },
        {
          $set: {
            isHiddenFromSearch: true,
            moderationNotes: `Automatically suppressed upon student scam report (${newReport._id}). Reason: ${reason}`,
          },
        }
      );
    }

    // 6. Record Moderation Audit Log
    const auditLog = new ModerationAuditLog({
      targetType: "scam_report",
      targetId: String(newReport._id),
      targetTitle: propertyTitle || "Property Listing",
      action: "Listing Automatically Hidden",
      adminUser: "Automated Safety Policy (Track C3 Rule 8)",
      notes: `Report logged by user ${auth.user.email}. Reason: "${reason}". Listing immediately hidden from public search awaiting admin investigation.`,
    });
    await auditLog.save();

    // 7. Return safe response without leaking private reporter data
    const response: ApiResponse<{
      reportId: string;
      propertyId: string;
      status: string;
      actionTaken: string;
    }> = {
      success: true,
      message: "Report logged successfully. The listing has been temporarily hidden from search results while under review.",
      data: {
        reportId: String(newReport._id),
        propertyId: propertyIdentifier,
        status: newReport.status,
        actionTaken: newReport.actionTaken || "hidden_from_search",
      },
      timestamp,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("[Report Property Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while logging report.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
