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
import { DEMO_USERS } from "@/lib/auth";
import type { ApiResponse, AuthSessionResponse, UserRole } from "@/types/backend";

const loginBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const rawBody = await req.json();
    const parseResult = loginBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(". ");
      const response: ApiResponse = {
        success: false,
        error: errorMsg,
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check MongoDB for registered database user
    let dbConnected = true;
    try {
      await connectToDatabase();
    } catch {
      dbConnected = false;
    }

    if (dbConnected) {
      const dbUser = await User.findOne({ email: normalizedEmail }).select(
        "+password +refreshTokenHash"
      );

      if (dbUser) {
        const isPasswordValid = await dbUser.comparePassword(password);
        if (!isPasswordValid) {
          const response: ApiResponse = {
            success: false,
            error: "Invalid email or password.",
            timestamp,
          };
          return NextResponse.json(response, { status: 401 });
        }

        const safeUser = dbUser.toSafeObject() as unknown as AuthSessionResponse["user"];
        const currentTokenVersion = dbUser.tokenVersion ?? 0;

        const accessToken = signAccessToken({
          userId: String(dbUser._id),
          email: dbUser.email,
          role: dbUser.role as UserRole,
          isDemoUser: false,
          tokenVersion: currentTokenVersion,
        });

        const refreshToken = signRefreshToken({
          userId: String(dbUser._id),
          email: dbUser.email,
          role: dbUser.role as UserRole,
          isDemoUser: false,
          tokenVersion: currentTokenVersion,
        });

        // Store secure SHA-256 hash of refresh token for server-side rotation/revocation
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        await User.updateOne({ _id: dbUser._id }, { $set: { refreshTokenHash } });

        const responseData: AuthSessionResponse = {
          user: safeUser,
          accessToken,
          refreshToken,
          isDemoSession: false,
        };

        const response = NextResponse.json<ApiResponse<AuthSessionResponse>>(
          {
            success: true,
            message: `Welcome back, ${dbUser.fullName}!`,
            data: responseData,
            timestamp,
          },
          { status: 200 }
        );

        // Set HttpOnly, Secure, SameSite cookies
        response.cookies.set(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions(3600)); // 1 hour
        response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, getAuthCookieOptions(30 * 24 * 3600)); // 30 days
        response.cookies.set("userRole", dbUser.role, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 3600,
        });

        return response;
      }
    }

    // 2. Demo fallback authentication for hackathon evaluation
    // Clearly distinguishes demo sessions from real database accounts
    const matchedDemo = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (matchedDemo) {
      const demoRole = matchedDemo.role.toUpperCase() as UserRole;
      const safeDemoUser: AuthSessionResponse["user"] = {
        _id: matchedDemo.id,
        email: matchedDemo.email,
        fullName: matchedDemo.name,
        phone: matchedDemo.phone,
        role: demoRole,
        isVerified: true,
        nidVerified: demoRole === "ADMIN",
        avatar: matchedDemo.avatar,
        location: matchedDemo.location,
        isDemoUser: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      };

      const accessToken = signAccessToken({
        userId: matchedDemo.id,
        email: matchedDemo.email,
        role: demoRole,
        isDemoUser: true,
        tokenVersion: 0,
      });

      const responseData: AuthSessionResponse = {
        user: safeDemoUser,
        accessToken,
        isDemoSession: true,
      };

      const response = NextResponse.json<ApiResponse<AuthSessionResponse>>(
        {
          success: true,
          message: `Welcome, ${matchedDemo.name}! (Authenticated via Hackathon Demonstration Profile)`,
          data: responseData,
          timestamp,
        },
        { status: 200 }
      );

      // Set cookies for demo session as well
      response.cookies.set(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions(3600));
      response.cookies.set("userRole", demoRole, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });

      return response;
    }

    // 3. Generic failure message: never leak whether the email exists
    const response: ApiResponse = {
      success: false,
      error: "Invalid email or password.",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  } catch (error) {
    console.error("[Login Error]:", error);
    const response: ApiResponse = {
      success: false,
      error: "An unexpected error occurred during login.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
