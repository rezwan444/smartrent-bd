import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  extractRefreshToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  getAuthCookieOptions,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/jwt";
import type { ApiResponse, AuthSessionResponse, UserRole } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    let token = extractRefreshToken(req);

    // Fallback to JSON body if not in cookies
    if (!token) {
      try {
        const body = await req.json();
        token = body.refreshToken || null;
      } catch {
        // Ignore JSON parse errors for empty body
      }
    }

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: "Refresh token is missing.",
        timestamp,
      };
      return NextResponse.json(response, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired refresh token.",
        timestamp,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Demo session refresh
    if (payload.isDemoUser) {
      const newAccessToken = signAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        isDemoUser: true,
        tokenVersion: 0,
      });

      const response = NextResponse.json<ApiResponse<{ accessToken: string }>>(
        {
          success: true,
          message: "Session refreshed successfully (Demo Profile).",
          data: { accessToken: newAccessToken },
          timestamp,
        },
        { status: 200 }
      );
      response.cookies.set(AUTH_COOKIE_NAME, newAccessToken, getAuthCookieOptions(3600));
      return response;
    }

    // Database user token rotation and verification
    await connectToDatabase();
    const dbUser = await User.findById(payload.userId).select("+refreshTokenHash");

    if (!dbUser) {
      const response: ApiResponse = {
        success: false,
        error: "User account no longer exists.",
        timestamp,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify token version matches (not revoked)
    if (
      typeof dbUser.tokenVersion === "number" &&
      typeof payload.tokenVersion === "number" &&
      dbUser.tokenVersion !== payload.tokenVersion
    ) {
      const response: ApiResponse = {
        success: false,
        error: "Session has been revoked. Please sign in again.",
        timestamp,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify refresh token hash matches the one stored in DB
    const incomingHash = crypto.createHash("sha256").update(token).digest("hex");
    if (dbUser.refreshTokenHash && dbUser.refreshTokenHash !== incomingHash) {
      // Possible reuse attack: revoke all tokens for this user
      await User.updateOne({ _id: dbUser._id }, { $inc: { tokenVersion: 1 }, $unset: { refreshTokenHash: 1 } });
      const response: ApiResponse = {
        success: false,
        error: "Security anomaly detected: refresh token invalidated. Please sign in again.",
        timestamp,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Rotate tokens
    const currentTokenVersion = dbUser.tokenVersion ?? 0;
    const newAccessToken = signAccessToken({
      userId: String(dbUser._id),
      email: dbUser.email,
      role: dbUser.role as UserRole,
      isDemoUser: false,
      tokenVersion: currentTokenVersion,
    });

    const newRefreshToken = signRefreshToken({
      userId: String(dbUser._id),
      email: dbUser.email,
      role: dbUser.role as UserRole,
      isDemoUser: false,
      tokenVersion: currentTokenVersion,
    });

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await User.updateOne({ _id: dbUser._id }, { $set: { refreshTokenHash: newRefreshTokenHash } });

    const safeUser = dbUser.toSafeObject() as unknown as AuthSessionResponse["user"];

    const response = NextResponse.json<ApiResponse<AuthSessionResponse>>(
      {
        success: true,
        message: "Session token rotated successfully.",
        data: {
          user: safeUser,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          isDemoSession: false,
        },
        timestamp,
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, newAccessToken, getAuthCookieOptions(3600));
    response.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, getAuthCookieOptions(30 * 24 * 3600));

    return response;
  } catch (err) {
    console.error("[Refresh Token Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to refresh authentication session.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
