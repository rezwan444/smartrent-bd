import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  extractToken,
  verifyAccessToken,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/jwt";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    const token = extractToken(req);

    // If an authenticated database user is logging out, revoke their tokens server-side
    if (token && !token.startsWith("demo-token-")) {
      const payload = verifyAccessToken(token);
      if (payload && !payload.isDemoUser && payload.userId) {
        try {
          await connectToDatabase();
          // Revoke session server-side by incrementing tokenVersion and clearing refreshTokenHash
          await User.updateOne(
            { _id: payload.userId },
            {
              $inc: { tokenVersion: 1 },
              $unset: { refreshTokenHash: 1 },
            }
          );
        } catch (dbErr) {
          console.error("[Logout DB Revocation Error]:", dbErr);
        }
      }
    }

    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Logged out successfully.",
        timestamp,
      },
      { status: 200 }
    );

    // Clear HttpOnly session cookies
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set(REFRESH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("userRole", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error("[Logout Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "An error occurred while logging out.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
