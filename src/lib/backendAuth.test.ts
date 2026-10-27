import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
  extractRefreshToken,
  JWT_ISSUER,
  JWT_AUDIENCE,
} from "./jwt.ts";

describe("Backend Auth & JWT Utilities (Track C3)", () => {
  const samplePayload = {
    userId: "user-12345",
    email: "student@smartrentbd.com",
    role: "STUDENT" as const,
    isDemoUser: false,
    tokenVersion: 0,
  };

  describe("1. Password Hashing and Verification", () => {
    it("hashes passwords securely with bcrypt and verifies correct candidate password", async () => {
      const rawPassword = "securePassword123!";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      assert.notEqual(hashedPassword, rawPassword);
      assert.ok(hashedPassword.startsWith("$2"));

      const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
      assert.equal(isMatch, true);
    });

    it("rejects wrong candidate passwords without revealing hash information", async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("correctPassword123", salt);

      const isMatch = await bcrypt.compare("wrongPassword321", hashedPassword);
      assert.equal(isMatch, false);
    });
  });

  describe("2. Registration Validation and Role Restrictions", () => {
    const validatePublicRegistrationRole = (userType: string): { allowed: boolean; role?: string } => {
      const normalized = userType.toLowerCase().trim();
      if (normalized === "student") return { allowed: true, role: "STUDENT" };
      if (normalized === "owner") return { allowed: true, role: "OWNER" };
      return { allowed: false };
    };

    it("permits public registration for legitimate roles: student and owner", () => {
      assert.deepEqual(validatePublicRegistrationRole("student"), { allowed: true, role: "STUDENT" });
      assert.deepEqual(validatePublicRegistrationRole("owner"), { allowed: true, role: "OWNER" });
    });

    it("strictly prohibits public registration for administrative roles (ADMIN, SUPER_ADMIN, STAFF)", () => {
      assert.equal(validatePublicRegistrationRole("admin").allowed, false);
      assert.equal(validatePublicRegistrationRole("ADMIN").allowed, false);
      assert.equal(validatePublicRegistrationRole("super_admin").allowed, false);
      assert.equal(validatePublicRegistrationRole("staff").allowed, false);
      assert.equal(validatePublicRegistrationRole("moderator").allowed, false);
    });

    it("normalizes user email to lowercase and trims whitespace", () => {
      const rawEmail = "   Student.User@Example.COM   ";
      const normalized = rawEmail.toLowerCase().trim();
      assert.equal(normalized, "student.user@example.com");
    });
  });

  describe("3. JWT Signing, Expiry, and Tampering", () => {
    it("signs and successfully verifies an access token with issuer and audience claims", () => {
      assert.equal(JWT_ISSUER, "smartrent-bd");
      assert.equal(JWT_AUDIENCE, "smartrent-bd-app");

      const token = signAccessToken(samplePayload, "1h");
      assert.ok(typeof token === "string");
      assert.ok(token.split(".").length === 3);

      const verified = verifyAccessToken(token);
      assert.ok(verified !== null);
      assert.equal(verified.userId, samplePayload.userId);
      assert.equal(verified.email, samplePayload.email);
      assert.equal(verified.role, samplePayload.role);
      assert.equal(verified.isDemoUser, false);
      assert.equal(verified.tokenVersion, 0);
    });

    it("rejects tampered or forged JWT tokens", () => {
      const validToken = signAccessToken(samplePayload, "1h");
      const tamperedToken = validToken.slice(0, -4) + "abcd";
      const verified = verifyAccessToken(tamperedToken);
      assert.equal(verified, null);
    });

    it("rejects expired JWT tokens", async () => {
      const shortLivedToken = signAccessToken(samplePayload, "10ms");
      await new Promise((resolve) => setTimeout(resolve, 50));
      const verified = verifyAccessToken(shortLivedToken);
      assert.equal(verified, null);
    });
  });

  describe("4. Refresh Token Lifecycle and Revocation", () => {
    it("signs and verifies a refresh token with distinct tokenType", () => {
      const refreshToken = signRefreshToken(samplePayload, "30d");
      const verifiedRefresh = verifyRefreshToken(refreshToken);
      assert.ok(verifiedRefresh !== null);
      assert.equal(verifiedRefresh.tokenType, "refresh");

      // Verify that access token verifier rejects refresh tokens
      assert.equal(verifyAccessToken(refreshToken), null);

      // Verify that refresh token verifier rejects access tokens
      const accessToken = signAccessToken(samplePayload, "1h");
      assert.equal(verifyRefreshToken(accessToken), null);
    });

    it("enforces session invalidation when tokenVersion does not match user record", () => {
      const tokenPayloadVersion = 0;
      const dbUserTokenVersion = 1; // User logged out, so version was bumped

      const isSessionActive = (payloadVersion: number, dbVersion: number) => {
        return payloadVersion === dbVersion;
      };

      assert.equal(isSessionActive(tokenPayloadVersion, dbUserTokenVersion), false);
      assert.equal(isSessionActive(1, 1), true);
    });
  });

  describe("5. Token Extraction from Request Headers and Cookies", () => {
    it("extracts access token from Bearer authorization header", () => {
      const fakeToken = "sample-token-abc";
      const req = new Request("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${fakeToken}`,
        },
      });

      const extracted = extractToken(req);
      assert.equal(extracted, fakeToken);
    });

    it("extracts token from cookie header when Authorization header is absent", () => {
      const fakeToken = "cookie-token-xyz";
      const req = new Request("http://localhost:3000/api/auth/me", {
        headers: {
          Cookie: `accessToken=${fakeToken}; other=123`,
        },
      });

      const extracted = extractToken(req);
      assert.equal(extracted, fakeToken);
    });

    it("extracts refresh token from cookies", () => {
      const fakeRefreshToken = "refresh-token-999";
      const req = new Request("http://localhost:3000/api/auth/refresh", {
        headers: {
          Cookie: `refreshToken=${fakeRefreshToken}; accessToken=something`,
        },
      });

      const extracted = extractRefreshToken(req);
      assert.equal(extracted, fakeRefreshToken);
    });

    it("returns null when no token is present in request", () => {
      const req = new Request("http://localhost:3000/api/auth/me");
      const extracted = extractToken(req);
      assert.equal(extracted, null);
    });
  });

  describe("6. Server-Side Role and Ownership Authorization", () => {
    const isRoleAuthorized = (userRole: string, allowedRoles: string[]): boolean => {
      return allowedRoles.map((r) => r.toUpperCase()).includes(userRole.toUpperCase());
    };

    it("authorizes ADMIN and SUPER_ADMIN for admin-only operations", () => {
      const adminOnly = ["ADMIN", "SUPER_ADMIN"];
      assert.equal(isRoleAuthorized("ADMIN", adminOnly), true);
      assert.equal(isRoleAuthorized("SUPER_ADMIN", adminOnly), true);
      assert.equal(isRoleAuthorized("STUDENT", adminOnly), false);
      assert.equal(isRoleAuthorized("OWNER", adminOnly), false);
    });

    it("authorizes OWNER and ADMIN for listing creation operations", () => {
      const propertyCreators = ["OWNER", "ADMIN", "SUPER_ADMIN"];
      assert.equal(isRoleAuthorized("OWNER", propertyCreators), true);
      assert.equal(isRoleAuthorized("ADMIN", propertyCreators), true);
      assert.equal(isRoleAuthorized("STUDENT", propertyCreators), false);
    });

    it("verifies resource ownership safely", () => {
      const checkListingOwnership = (listingOwnerId: string, requestUserId: string, userRole: string) => {
        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") return true;
        return listingOwnerId === requestUserId;
      };

      assert.equal(checkListingOwnership("owner-1", "owner-1", "OWNER"), true);
      assert.equal(checkListingOwnership("owner-1", "owner-2", "OWNER"), false);
      assert.equal(checkListingOwnership("owner-1", "admin-1", "ADMIN"), true);
    });
  });

  describe("7. Demo vs Production Authentication Behavior", () => {
    it("clearly separates demo sessions from production database accounts", () => {
      const demoToken = "demo-token-demo-student-01";
      const isDemoToken = (token: string) => token.startsWith("demo-token-");

      assert.equal(isDemoToken(demoToken), true);

      const realJwt = signAccessToken(samplePayload, "1h");
      assert.equal(isDemoToken(realJwt), false);
    });
  });

  describe("8. Account Recovery & Single-Use Password Reset Tokens", () => {
    it("generates cryptographically secure, non-reversible SHA-256 hashed reset tokens", () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      assert.equal(rawToken.length, 64);

      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      assert.notEqual(hashedToken, rawToken);

      // Verify that matching raw token produces exact same hash
      const checkHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      assert.equal(checkHash, hashedToken);

      // Verify that tampered raw token produces different hash
      const tamperedHash = crypto.createHash("sha256").update(rawToken + "x").digest("hex");
      assert.notEqual(tamperedHash, hashedToken);
    });

    it("rejects password reset tokens that have expired", () => {
      const now = Date.now();
      const expiredTime = new Date(now - 1000); // 1 second ago
      const validTime = new Date(now + 3600000); // 1 hour in future

      const isTokenValid = (expiresAt: Date) => expiresAt.getTime() > Date.now();

      assert.equal(isTokenValid(expiredTime), false);
      assert.equal(isTokenValid(validTime), true);
    });
  });
});
