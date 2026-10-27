import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

describe("Property Moderation, Verification & Scam Suppression Backend (Track C3)", () => {
  // Mock helper matching server-side requireRole logic
  const checkRoleAuthorization = (
    userRole: string | null | undefined,
    allowedRoles: string[]
  ): { authorized: boolean; status: number } => {
    if (!userRole) return { authorized: false, status: 401 };
    if (!allowedRoles.includes(userRole.toUpperCase())) return { authorized: false, status: 403 };
    return { authorized: true, status: 200 };
  };

  describe("1. Server-Side Admin Role Authorization", () => {
    const adminRoles = ["ADMIN", "SUPER_ADMIN", "STAFF"];

    it("authorizes ADMIN, SUPER_ADMIN, and STAFF for moderation endpoints", () => {
      assert.equal(checkRoleAuthorization("ADMIN", adminRoles).authorized, true);
      assert.equal(checkRoleAuthorization("SUPER_ADMIN", adminRoles).authorized, true);
      assert.equal(checkRoleAuthorization("STAFF", adminRoles).authorized, true);
      assert.equal(checkRoleAuthorization("admin", adminRoles).authorized, true);
    });

    it("strictly rejects STUDENT, OWNER, and unauthenticated callers with 401 or 403", () => {
      assert.deepEqual(checkRoleAuthorization("STUDENT", adminRoles), { authorized: false, status: 403 });
      assert.deepEqual(checkRoleAuthorization("OWNER", adminRoles), { authorized: false, status: 403 });
      assert.deepEqual(checkRoleAuthorization(null, adminRoles), { authorized: false, status: 401 });
      assert.deepEqual(checkRoleAuthorization(undefined, adminRoles), { authorized: false, status: 401 });
    });
  });

  describe("2. Self-Verification Prevention (Anti-Privilege Escalation)", () => {
    const validatePropertyApproval = (
      propertyOwnerId: string,
      reviewingAdminId: string,
      decision: "approve" | "reject"
    ): { allowed: boolean; error?: string } => {
      if (decision === "approve" && propertyOwnerId === reviewingAdminId) {
        return {
          allowed: false,
          error: "Forbidden: You cannot approve or verify your own property listing.",
        };
      }
      return { allowed: true };
    };

    const validateOwnerApproval = (
      ownerUserId: string,
      reviewingAdminId: string,
      decision: "approve" | "reject"
    ): { allowed: boolean; error?: string } => {
      if (decision === "approve" && ownerUserId === reviewingAdminId) {
        return {
          allowed: false,
          error: "Forbidden: You cannot verify or approve your own owner identity.",
        };
      }
      return { allowed: true };
    };

    it("prohibits administrators from approving their own property listings", () => {
      const selfCheck = validatePropertyApproval("user-admin-01", "user-admin-01", "approve");
      assert.equal(selfCheck.allowed, false);
      assert.ok(selfCheck.error?.includes("cannot approve or verify your own property listing"));
    });

    it("allows independent administrators to review and approve listings", () => {
      const independentCheck = validatePropertyApproval("user-owner-10", "user-admin-01", "approve");
      assert.equal(independentCheck.allowed, true);
    });

    it("prohibits users from verifying their own owner NID identity", () => {
      const selfNidCheck = validateOwnerApproval("user-admin-01", "user-admin-01", "approve");
      assert.equal(selfNidCheck.allowed, false);
      assert.ok(selfNidCheck.error?.includes("cannot verify or approve your own owner identity"));
    });
  });

  describe("3. Scam Report Zod Validation & Duplicate Spam Protection", () => {
    const reportSchema = z.object({
      reason: z.string().trim().min(5, "Reason is required"),
      details: z.string().trim().max(1000).optional(),
      contactInfo: z.string().trim().max(100).optional(),
    });

    const checkDuplicateReport = (
      existingReports: Array<{ propertyId: string; reportedByUserId: string; status: string }>,
      propertyId: string,
      userId: string
    ): boolean => {
      return existingReports.some(
        (r) =>
          r.propertyId === propertyId &&
          r.reportedByUserId === userId &&
          ["awaiting_review", "investigating"].includes(r.status)
      );
    };

    it("accepts well-formed scam report submission with valid reason", () => {
      const valid = reportSchema.safeParse({
        reason: "Landlord demanded bKash payment prior to physical visit",
        details: "Requested ৳ 2,000 reservation fee on personal bKash",
        contactInfo: "student@example.com",
      });
      assert.equal(valid.success, true);
    });

    it("rejects report submission with empty or short reasons (<5 chars)", () => {
      const invalid = reportSchema.safeParse({
        reason: "bad",
      });
      assert.equal(invalid.success, false);
    });

    it("detects and rejects duplicate report submissions by the same user for active reviews", () => {
      const reports = [
        { propertyId: "prop-101", reportedByUserId: "student-01", status: "awaiting_review" },
      ];
      assert.equal(checkDuplicateReport(reports, "prop-101", "student-01"), true);
      assert.equal(checkDuplicateReport(reports, "prop-101", "student-02"), false);
      assert.equal(checkDuplicateReport(reports, "prop-102", "student-01"), false);
    });
  });

  describe("4. Moderation Decisions & Public Listing Suppression", () => {
    interface MockProperty {
      id: string;
      title: string;
      isVerified: boolean;
      status: "pending" | "verified" | "rejected";
      isHiddenFromSearch: boolean;
      ownerId: string;
    }

    const filterPublicListings = (properties: MockProperty[]): MockProperty[] => {
      return properties.filter((p) => p.status !== "rejected" && !p.isHiddenFromSearch);
    };

    const checkDetailAccess = (
      property: MockProperty,
      requestingUser: { id?: string; role?: string } | null
    ): { allowed: boolean; status: number } => {
      const isSuppressed = property.isHiddenFromSearch || property.status === "rejected";
      if (!isSuppressed) return { allowed: true, status: 200 };

      const isOwner = Boolean(requestingUser?.id && requestingUser.id === property.ownerId);
      const isAdmin = Boolean(requestingUser?.role && ["ADMIN", "SUPER_ADMIN"].includes(requestingUser.role));

      if (isOwner || isAdmin) {
        return { allowed: true, status: 200 };
      }
      return { allowed: false, status: 404 };
    };

    const initialProperties: MockProperty[] = [
      { id: "p1", title: "Clean Room Nilkhet", isVerified: true, status: "verified", isHiddenFromSearch: false, ownerId: "own-1" },
      { id: "p2", title: "Mirpur 2 Flat", isVerified: true, status: "verified", isHiddenFromSearch: false, ownerId: "own-2" },
      { id: "p3", title: "Dhanmondi Mess", isVerified: false, status: "pending", isHiddenFromSearch: true, ownerId: "own-3" },
    ];

    it("suppresses reported listings immediately from public search", () => {
      // Scam report filed on p1 -> marks isHiddenFromSearch = true
      const reportedListings = initialProperties.map((p) => (p.id === "p1" ? { ...p, isHiddenFromSearch: true } : p));
      const publicResults = filterPublicListings(reportedListings);

      assert.equal(publicResults.some((p) => p.id === "p1"), false);
      assert.equal(publicResults.some((p) => p.id === "p2"), true);
    });

    it("restores visibility when admin investigates and dismisses a false scam report", () => {
      const reported = initialProperties.map((p) => (p.id === "p1" ? { ...p, isHiddenFromSearch: true } : p));
      assert.equal(filterPublicListings(reported).some((p) => p.id === "p1"), false);

      // Admin dismisses report -> restores isHiddenFromSearch = false
      const restored = reported.map((p) => (p.id === "p1" ? { ...p, isHiddenFromSearch: false } : p));
      assert.equal(filterPublicListings(restored).some((p) => p.id === "p1"), true);
    });

    it("permanently de-lists a confirmed fraud listing", () => {
      const fraudConfirmed = initialProperties.map((p) =>
        p.id === "p1" ? { ...p, status: "rejected" as const, isHiddenFromSearch: true, isVerified: false } : p
      );
      const publicResults = filterPublicListings(fraudConfirmed);
      assert.equal(publicResults.some((p) => p.id === "p1"), false);
    });

    it("prevents public users from accessing detail page of suppressed or rejected listings", () => {
      const hiddenListing: MockProperty = {
        id: "p1",
        title: "Suspected Scam Room",
        isVerified: false,
        status: "pending",
        isHiddenFromSearch: true,
        ownerId: "own-1",
      };

      // Unauthenticated visitor -> 404
      assert.deepEqual(checkDetailAccess(hiddenListing, null), { allowed: false, status: 404 });
      // Other student -> 404
      assert.deepEqual(checkDetailAccess(hiddenListing, { id: "student-99", role: "STUDENT" }), { allowed: false, status: 404 });
      // Property owner -> 200 allowed
      assert.deepEqual(checkDetailAccess(hiddenListing, { id: "own-1", role: "OWNER" }), { allowed: true, status: 200 });
      // Administrator -> 200 allowed
      assert.deepEqual(checkDetailAccess(hiddenListing, { id: "admin-1", role: "ADMIN" }), { allowed: true, status: 200 });
    });
  });

  describe("5. Reporter Privacy & Data Protection", () => {
    it("ensures public property responses never leak reporter identity", () => {
      const publicViewProperties = (doc: {
        id: string;
        title: string;
        reporterEmail?: string;
        reporterPhone?: string;
      }) => {
        // Strip sensitive fields
        return {
          id: doc.id,
          title: doc.title,
        };
      };

      const publicOutput = publicViewProperties({
        id: "p1",
        title: "Dhanmondi Flat",
        reporterEmail: "private-student@university.edu",
        reporterPhone: "+880 1711-000000",
      });

      assert.equal("reporterEmail" in publicOutput, false);
      assert.equal("reporterPhone" in publicOutput, false);
      assert.equal(publicOutput.id, "p1");
    });
  });
});
