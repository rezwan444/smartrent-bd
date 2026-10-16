import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authRoutes = [
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/reset-success",
  "/verify-otp",
];
const protectedRoutes = ["/dashboard"];

const decodeTokenRole = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as {
      role?: string;
      user?: { role?: string };
    };

    return payload.role || payload.user?.role || null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const isAuthenticated = Boolean(token);
  const role = token ? decodeTokenRole(token) : null;
  const isSuperAdmin = role === "SUPER_ADMIN";

  if (isAuthenticated && !isSuperAdmin) {
    if (pathname === "/login") {
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("authUser");
      return response;
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("authUser");
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (
    authRoutes.some((route) => pathname.startsWith(route)) &&
    isAuthenticated &&
    isSuperAdmin
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
