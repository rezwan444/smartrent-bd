import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  signAccessToken,
  signRefreshToken,
  getAuthCookieOptions,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/jwt";
import type { ApiResponse, AuthSessionResponse, UserRole } from "@/types/backend";

const registerBodySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  userType: z.enum(["student", "owner"], {
    message: "userType must be either 'student' or 'owner'",
  }),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();
    const parseResult = registerBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { fullName, email, password, phone, userType } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: "An account with this email address already exists.",
        timestamp,
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Role assignment: strictly restrict to STUDENT or OWNER from public registration
    const assignedRole: UserRole = userType === "owner" ? "OWNER" : "STUDENT";

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password,
      phone: phone?.trim() || "",
      role: assignedRole,
      isVerified: false,
      nidVerified: false,
      isDemoUser: false,
      tokenVersion: 0,
    });

    await newUser.save();

    const safeUser = newUser.toSafeObject() as unknown as AuthSessionResponse["user"];
    const accessToken = signAccessToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: assignedRole,
      isDemoUser: false,
      tokenVersion: newUser.tokenVersion || 0,
    });
    const refreshToken = signRefreshToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: assignedRole,
      isDemoUser: false,
      tokenVersion: newUser.tokenVersion || 0,
    });

    // Store secure hash of refresh token for server-side validation
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await User.updateOne({ _id: newUser._id }, { $set: { refreshTokenHash } });

    const responseData: AuthSessionResponse = {
      user: safeUser,
      accessToken,
      refreshToken,
      isDemoSession: false,
    };

    const response = NextResponse.json<ApiResponse<AuthSessionResponse>>(
      {
        success: true,
        message: `Account created successfully for ${fullName}.`,
        data: responseData,
        timestamp,
      },
      { status: 201 }
    );

    // Set HttpOnly, Secure, SameSite cookies
    response.cookies.set(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions(3600)); // 1 hour
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, getAuthCookieOptions(30 * 24 * 3600)); // 30 days
    response.cookies.set("userRole", assignedRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("[Register Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to process registration request",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
