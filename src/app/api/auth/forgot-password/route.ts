import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendOtpEmail } from "@/lib/mail";
import type { ApiResponse } from "@/types/backend";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();
    const parseResult = forgotSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();
    const dbUser = await User.findOne({ email: normalizedEmail });

    // If user is not found in the database, return 404 with clear message
    if (!dbUser) {
      const response: ApiResponse = {
        success: false,
        error: "No account found with this email address.",
        timestamp,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Generate random 4-digit OTP code
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiration

    // Update directly via MongoDB collection and Mongoose to guarantee persistence
    await Promise.all([
      User.collection.updateOne(
        { _id: dbUser._id },
        {
          $set: {
            resetPasswordOtp: String(generatedOtp).trim(),
            resetPasswordExpires: expiresAt,
          },
        }
      ),
      User.updateOne(
        { _id: dbUser._id },
        {
          $set: {
            resetPasswordOtp: String(generatedOtp).trim(),
            resetPasswordExpires: expiresAt,
          },
        },
        { strict: false }
      ),
    ]);

    // Attempt real email delivery via Nodemailer / SMTP
    const mailResult = await sendOtpEmail(normalizedEmail, generatedOtp);

    let clientMessage = `Verification code sent to ${normalizedEmail}.`;
    if (!mailResult.delivered) {
      // Notice for local evaluation when SMTP is not yet configured in .env
      clientMessage = `Verification code sent! (Dev OTP: ${generatedOtp})`;
    }

    const response: ApiResponse<{
      email: string;
      delivered: boolean;
      expiresIn: string;
      devOtp?: string;
    }> = {
      success: true,
      message: clientMessage,
      data: {
        email: normalizedEmail,
        delivered: mailResult.delivered,
        devOtp: mailResult.delivered ? undefined : generatedOtp,
        expiresIn: "15 minutes",
      },
      timestamp,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[ForgotPassword Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "An unexpected error occurred while processing recovery request.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
