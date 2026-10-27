import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
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

    try {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: normalizedEmail });

      if (dbUser) {
        // Generate random, single-use reset token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

        await User.updateOne(
          { _id: dbUser._id },
          {
            $set: {
              resetPasswordToken: hashedToken,
              resetPasswordExpires: expiresAt,
            },
          }
        );

        // Safe handling when email delivery service is unconfigured
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[Auth Recovery Info] Password reset requested for ${dbUser.email}. Token generated: ${rawToken} (Expires in 1 hour)`
          );
        }
      }
    } catch (dbErr) {
      console.error("[ForgotPassword DB Error]:", dbErr);
    }

    // Always return generic success to protect against user enumeration attacks
    const response: ApiResponse = {
      success: true,
      message:
        "If an account with this email address exists, password reset instructions have been generated.",
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[ForgotPassword Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to process password reset request.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
