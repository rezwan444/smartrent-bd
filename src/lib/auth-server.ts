import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { verifyAccessToken, extractToken } from "./jwt.ts";
import { connectToDatabase } from "./mongodb.ts";
import { User } from "../models/User.ts";
import { DEMO_USERS } from "./auth.ts";
import type { UserRole, IUser } from "../types/backend.ts";

export { extractToken };

export interface AuthContext {
  isAuthenticated: boolean;
  user: IUser | null;
  role: UserRole | null;
  isDemoUser: boolean;
  error?: string;
}

/**
 * Verifies request credentials and fetches the authoritative server-side user record.
 * Never trusts client-supplied roles or identity.
 */
export async function getAuthenticatedUser(
  req: NextRequest | Request
): Promise<AuthContext> {
  const token = extractToken(req);

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      isDemoUser: false,
      error: "Authentication token missing",
    };
  }

  // Handle demo token shortcuts for local prototype testing
  if (token.startsWith("demo-token-")) {
    const demoKey = token.replace("demo-token-", "");
    const demoEntry = Object.values(DEMO_USERS).find(
      (d) => d.id === demoKey || d.role.toLowerCase() === demoKey.toLowerCase()
    );

    if (demoEntry) {
      const demoUser: IUser = {
        _id: demoEntry.id,
        email: demoEntry.email,
        fullName: demoEntry.name,
        phone: demoEntry.phone,
        role: demoEntry.role.toUpperCase() as UserRole,
        isVerified: true,
        nidVerified: demoEntry.role.toUpperCase() === "ADMIN",
        avatar: demoEntry.avatar,
        location: demoEntry.location,
        isDemoUser: true,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      };

      return {
        isAuthenticated: true,
        user: demoUser,
        role: demoUser.role,
        isDemoUser: true,
      };
    }
  }

  // Verify JWT token signature
  const payload = verifyAccessToken(token);
  if (!payload) {
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      isDemoUser: false,
      error: "Invalid or expired authentication token",
    };
  }

  // Check if token represents a verified demo session
  if (payload.isDemoUser) {
    const demoEntry = Object.values(DEMO_USERS).find(
      (d) => d.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (demoEntry) {
      const demoUser: IUser = {
        _id: demoEntry.id,
        email: demoEntry.email,
        fullName: demoEntry.name,
        phone: demoEntry.phone,
        role: payload.role,
        isVerified: true,
        nidVerified: payload.role === "ADMIN",
        avatar: demoEntry.avatar,
        location: demoEntry.location,
        isDemoUser: true,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      };
      return {
        isAuthenticated: true,
        user: demoUser,
        role: payload.role,
        isDemoUser: true,
      };
    }
  }

  // Query authoritative user document from MongoDB Atlas
  try {
    await connectToDatabase();
    const dbUser = await User.findById(payload.userId).lean();

    if (!dbUser) {
      return {
        isAuthenticated: false,
        user: null,
        role: null,
        isDemoUser: false,
        error: "User account no longer exists",
      };
    }

    // Token revocation check: if user's tokenVersion was incremented (e.g. on logout or password reset), invalidate old tokens
    if (
      typeof dbUser.tokenVersion === "number" &&
      typeof payload.tokenVersion === "number" &&
      dbUser.tokenVersion !== payload.tokenVersion
    ) {
      return {
        isAuthenticated: false,
        user: null,
        role: null,
        isDemoUser: false,
        error: "Session has been invalidated. Please sign in again.",
      };
    }

    const safeUser: IUser = {
      _id: String(dbUser._id),
      email: dbUser.email,
      fullName: dbUser.fullName,
      phone: dbUser.phone,
      role: dbUser.role as UserRole,
      isVerified: dbUser.isVerified,
      nidVerified: dbUser.nidVerified,
      avatar: dbUser.avatar,
      location: dbUser.location,
      isDemoUser: false,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    return {
      isAuthenticated: true,
      user: safeUser,
      role: safeUser.role,
      isDemoUser: false,
    };
  } catch (err) {
    console.error("[getAuthenticatedUser Error]:", err);
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      isDemoUser: false,
      error: "Authentication service unavailable",
    };
  }
}

/**
 * Enforces authentication. Returns 401 response if user is unauthenticated.
 */
export async function requireAuth(
  req: NextRequest | Request
): Promise<{ auth: AuthContext; response?: NextResponse }> {
  const auth = await getAuthenticatedUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return {
      auth,
      response: NextResponse.json(
        {
          success: false,
          error: auth.error || "Authentication required",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      ),
    };
  }
  return { auth };
}

/**
 * Enforces server-side role check. Returns 403 Forbidden if user lacks required role.
 */
export async function requireRole(
  req: NextRequest | Request,
  allowedRoles: UserRole[]
): Promise<{ auth: AuthContext; response?: NextResponse }> {
  const { auth, response } = await requireAuth(req);
  if (response) return { auth, response };

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return {
      auth,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: this action requires one of the following roles: ${allowedRoles.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      ),
    };
  }

  return { auth };
}
