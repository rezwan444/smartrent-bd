import jwt, { type SignOptions } from "jsonwebtoken";
import { getEnv } from "./env.ts";
import type { AuthTokenPayload } from "../types/backend.ts";

export const JWT_ISSUER = "smartrent-bd";
export const JWT_AUDIENCE = "smartrent-bd-app";
export const AUTH_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Signs a JWT access token for an authenticated user.
 * Defaults to 1 hour access expiration.
 */
export function signAccessToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string {
  const env = getEnv();
  return jwt.sign(
    {
      ...payload,
      tokenType: "access",
      tokenVersion: payload.tokenVersion ?? 0,
    },
    env.AUTH_SECRET,
    {
      expiresIn,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

/**
 * Signs a refresh token for long-term session maintenance.
 * Defaults to 30 days expiration.
 */
export function signRefreshToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  expiresIn: SignOptions["expiresIn"] = "30d"
): string {
  const env = getEnv();
  return jwt.sign(
    {
      ...payload,
      tokenType: "refresh",
      tokenVersion: payload.tokenVersion ?? 0,
    },
    env.AUTH_SECRET,
    {
      expiresIn,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

/**
 * Verifies a JWT access token and returns its decoded payload.
 * Returns null if token is expired, tampered with, invalid, or is not an access token.
 */
export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.AUTH_SECRET) as AuthTokenPayload;
    if (decoded.tokenType && decoded.tokenType !== "access") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verifies a JWT refresh token and returns its decoded payload.
 * Returns null if token is expired, tampered with, invalid, or is not a refresh token.
 */
export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.AUTH_SECRET) as AuthTokenPayload;
    if (decoded.tokenType !== "refresh") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extracts the JWT bearer token from the Authorization header or cookies.
 */
export function extractToken(
  req: Request | { headers: Headers; cookies?: { get(name: string): { value: string } | undefined } }
): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  // Fallback to cookies if present on NextRequest
  if ("cookies" in req && typeof req.cookies?.get === "function") {
    const cookie = req.cookies.get(AUTH_COOKIE_NAME);
    if (cookie?.value) {
      return cookie.value;
    }
  }

  // Plain header cookie parsing
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Extracts the refresh token from cookies or Authorization header.
 */
export function extractRefreshToken(
  req: Request | { headers: Headers; cookies?: { get(name: string): { value: string } | undefined } }
): string | null {
  if ("cookies" in req && typeof req.cookies?.get === "function") {
    const cookie = req.cookies.get(REFRESH_COOKIE_NAME);
    if (cookie?.value) {
      return cookie.value;
    }
  }

  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)refreshToken=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

/**
 * Helper to build standard secure cookie attributes.
 */
export function getAuthCookieOptions(maxAgeSeconds: number = 3600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
