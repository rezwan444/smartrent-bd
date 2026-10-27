import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authRoutes = [
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const adminRoles = ["ADMIN", "SUPER_ADMIN", "STAFF"];
const ownerRoles = ["OWNER", "ADMIN", "SUPER_ADMIN"];

function decodeTokenPayload(
  token: string
): { role?: string; isDemoUser?: boolean } | null {
  try {
    if (token.startsWith("demo-token-")) {
      const key = token.replace("demo-token-", "").toLowerCase();
      if (key.includes("admin") || key.includes("staff")) {
        return { role: "ADMIN", isDemoUser: true };
      }
      if (key.includes("owner")) {
        return { role: "OWNER", isDemoUser: true };
      }
      return { role: "STUDENT", isDemoUser: true };
    }

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const userRoleCookie = request.cookies.get("userRole")?.value;

  const payload = token ? decodeTokenPayload(token) : null;
  const isAuthenticated = Boolean(payload);
  const role = payload?.role?.toUpperCase() || userRoleCookie?.toUpperCase() || null;

  // 1. If accessing protected dashboard routes
  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/unauthorized") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization guarding on dashboard sub-routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (!role || !adminRoles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    } else if (pathname.startsWith("/dashboard/owner")) {
      if (!role || !ownerRoles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    }
  }

  // 2. Redirect authenticated users away from auth pages (/login, /register)
  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    let target = "/dashboard/student";
    if (role && adminRoles.includes(role)) {
      target = "/dashboard/admin";
    } else if (role === "OWNER") {
      target = "/dashboard/owner";
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, fonts, and assets (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
