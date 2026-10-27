import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const env = getEnv();

    if (!env.AUTH_GOOGLE_ID) {
      return NextResponse.redirect(
        new URL("/login?error=google_oauth_not_configured", req.nextUrl.origin)
      );
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/callback/google`;
    const searchParams = req.nextUrl.searchParams;
    const roleParam = searchParams.get("role") || "student";

    // Encode state to preserve requested account type (e.g. student or owner)
    const state = Buffer.from(JSON.stringify({ role: roleParam, origin: req.nextUrl.origin })).toString("base64url");

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", env.AUTH_GOOGLE_ID);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (err) {
    console.error("[Google OAuth Init Error]:", err);
    return NextResponse.redirect(
      new URL("/login?error=oauth_initialization_failed", req.nextUrl.origin)
    );
  }
}
