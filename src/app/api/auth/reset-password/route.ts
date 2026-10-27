import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { ApiResponse } from "@/types/backend";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();

    // Check if token was provided in Authorization header if not in body
    let token = rawBody.token;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim();
      }
    }

    const parseResult = resetPasswordSchema.safeParse({
      ...rawBody,
      token,
    });

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { token: resetToken, newPassword } = parseResult.data;

    await connectToDatabase();

    // Hash the reset token with SHA-256 to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const dbUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!dbUser) {
      const response: ApiResponse = {
        success: false,
        error: "Password reset token is invalid or has expired.",
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password, clear reset token, and increment tokenVersion to revoke active sessions
    await User.updateOne(
      { _id: dbUser._id },
      {
        $set: { password: hashedPassword },
        $inc: { tokenVersion: 1 },
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
          refreshTokenHash: 1,
        },
      }
    );

    const response: ApiResponse = {
      success: true,
      message: "Password reset successfully. You may now sign in with your new password.",
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[ResetPassword Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to reset password.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
