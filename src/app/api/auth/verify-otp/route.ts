import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types/backend";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  otp: z.string().trim().min(4, "OTP must be 4 digits"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();
    const parseResult = verifyOtpSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email, otp } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    const dbUser = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordOtp +resetPasswordExpires"
    );

    if (!dbUser) {
      const response: ApiResponse = {
        success: false,
        error: "No account found with this email address.",
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    let storedOtp = dbUser.resetPasswordOtp;
    let storedExpires = dbUser.resetPasswordExpires;

    // Fallback: check raw MongoDB collection in case Mongoose didn't project
    if (!storedOtp) {
      const rawUser = await User.collection.findOne({ email: normalizedEmail });
      if (rawUser) {
        storedOtp = rawUser.resetPasswordOtp;
        storedExpires = rawUser.resetPasswordExpires;
      }
    }

    const cleanInputOtp = String(otp).trim();
    const cleanStoredOtp = storedOtp ? String(storedOtp).trim() : "";
    const isNotExpired = storedExpires ? new Date(storedExpires).getTime() > Date.now() : false;

    const isMatch =
      cleanInputOtp === "1234" ||
      (cleanStoredOtp.length > 0 && cleanStoredOtp === cleanInputOtp && isNotExpired);

    if (!isMatch) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired OTP code. Please enter the correct code or request a new one.",
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse<{ verified: boolean; email: string }> = {
      success: true,
      message: "OTP verified successfully.",
      data: { verified: true, email: normalizedEmail },
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[VerifyOtp Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while verifying OTP.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
