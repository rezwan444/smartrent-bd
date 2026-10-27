import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import path from "path";
import fs from "fs";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // Enforce authentication
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    const res: ApiResponse = {
      success: false,
      error: "Authentication required to upload property images",
      timestamp,
    };
    return NextResponse.json(res, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      const res: ApiResponse = {
        success: false,
        error: "No file was provided in the upload request",
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      const res: ApiResponse = {
        success: false,
        error: "Invalid file type. Only JPG, PNG, WEBP, and GIF images are supported.",
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const res: ApiResponse = {
        success: false,
        error: "File size exceeds the 10MB limit",
        timestamp,
      };
      return NextResponse.json(res, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate extension & safe filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Target upload directory in public/uploads/properties
    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/properties/${filename}`;
      const res: ApiResponse<{ url: string; filename: string; size: number }> = {
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: publicUrl,
          filename,
          size: file.size,
        },
        timestamp,
      };
      return NextResponse.json(res, { status: 200 });
    } catch (fsErr) {
      console.warn("[Upload] Local filesystem write fallback to data URI:", fsErr);
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Data}`;
      const res: ApiResponse<{ url: string; filename: string; size: number }> = {
        success: true,
        message: "Image processed successfully",
        data: {
          url: dataUri,
          filename,
          size: file.size,
        },
        timestamp,
      };
      return NextResponse.json(res, { status: 200 });
    }
  } catch (error) {
    console.error("[Upload API Error]:", error);
    const res: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while uploading the image.",
      timestamp,
    };
    return NextResponse.json(res, { status: 500 });
  }
}
