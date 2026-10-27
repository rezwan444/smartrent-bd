import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  signAccessToken,
  signRefreshToken,
  getAuthCookieOptions,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/lib/jwt";
import type { UserRole } from "@/types/backend";

export const dynamic = "force-dynamic";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "access_denied")}`, origin)
    );
  }

  let requestedRole: UserRole = "STUDENT";
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
      if (decoded.role === "owner") {
        requestedRole = "OWNER";
      }
    } catch {
      // Use default role if state parsing fails
    }
  }

  try {
    const env = getEnv();
    if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
      return NextResponse.redirect(new URL("/login?error=google_credentials_missing", origin));
    }

    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.AUTH_GOOGLE_ID,
        client_secret: env.AUTH_GOOGLE_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[Google Token Exchange Failed]:", tokenData);
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", origin));
    }

    // 2. Fetch verified Google user profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = (await profileRes.json()) as GoogleUserInfo;
    if (!profileRes.ok || !profile.email) {
      return NextResponse.redirect(new URL("/login?error=profile_fetch_failed", origin));
    }

    const normalizedEmail = profile.email.toLowerCase().trim();

    // 3. Upsert user in database
    await connectToDatabase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user = new User({
        email: normalizedEmail,
        fullName: profile.name || "Google User",
        password: randomPassword,
        avatar: profile.picture || "",
        role: requestedRole,
        isVerified: profile.email_verified || true,
        nidVerified: false,
        isDemoUser: false,
        tokenVersion: 0,
      });
      await user.save();
    } else {
      // Update avatar if not set
      if (!user.avatar && profile.picture) {
        user.avatar = profile.picture;
        await user.save();
      }
    }

    const currentTokenVersion = user.tokenVersion ?? 0;
    const userRole = user.role as UserRole;

    // 4. Issue SmartRent BD session tokens
    const accessToken = signAccessToken({
      userId: String(user._id),
      email: user.email,
      role: userRole,
      isDemoUser: false,
      tokenVersion: currentTokenVersion,
    });

    const refreshToken = signRefreshToken({
      userId: String(user._id),
      email: user.email,
      role: userRole,
      isDemoUser: false,
      tokenVersion: currentTokenVersion,
    });

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await User.updateOne({ _id: user._id }, { $set: { refreshTokenHash } });

    // Determine target dashboard based on authoritative user role
    const dashboardTarget =
      userRole === "ADMIN" || userRole === "SUPER_ADMIN"
        ? "/dashboard/admin"
        : userRole === "OWNER"
        ? "/dashboard/owner"
        : "/dashboard/student";

    const response = NextResponse.redirect(new URL(dashboardTarget, origin));

    // Set secure HttpOnly session cookies
    response.cookies.set(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions(3600));
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, getAuthCookieOptions(30 * 24 * 3600));
    response.cookies.set("userRole", userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });

    return response;
  } catch (err) {
    console.error("[Google OAuth Callback Error]:", err);
    return NextResponse.redirect(new URL("/login?error=oauth_processing_error", origin));
  }
}
