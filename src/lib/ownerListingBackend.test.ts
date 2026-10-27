import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

describe("Owner Listing Management & Dynamic Public Property Discovery (Track C3)", () => {
  // 1. Zod Property Validation Schema
  const createPropertySchema = z.object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
    type: z.enum(["room", "flat", "mess", "hostel"], { message: "Invalid property type" }),
    location: z.object({
      neighborhood: z.string().trim().min(2, "Neighborhood is required"),
      city: z.string().trim().min(2, "City is required"),
      address: z.string().optional(),
    }),
    rent: z.number().positive("Rent must be a positive number"),
    bedrooms: z.number().int().positive().optional().default(1),
    bathrooms: z.number().int().positive().optional().default(1),
    facilities: z.array(z.string()).optional().default([]),
    featuredImage: z.string().url("Valid image URL is required"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
  });

  describe("1. Listing Creation Input Validation (Zod)", () => {
    it("accepts a well-formed property listing payload", () => {
      const validPayload = {
        title: "Furnished Master Bed near East West University",
        type: "room",
        location: {
          neighborhood: "Block C, Banasree",
          city: "Dhaka",
          address: "House 14, Road 4",
        },
        rent: 8500,
        bedrooms: 1,
        bathrooms: 1,
        facilities: ["wifi", "attached_bath", "balcony"],
        featuredImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
        description: "Spacious south-facing single room with attached bath and private balcony.",
      };

      const result = createPropertySchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    it("rejects listing with short title (<5 chars)", () => {
      const invalidPayload = {
        title: "Room",
        type: "room",
        location: { neighborhood: "Banasree", city: "Dhaka" },
        rent: 8500,
        featuredImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
        description: "A very nice room for students.",
      };

      const result = createPropertySchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
      assert.ok(result.error?.issues.some((i) => i.message.includes("at least 5 characters")));
    });

    it("rejects non-positive rent amounts (zero or negative)", () => {
      const zeroRent = {
        title: "Bachelor Mess Seat in Mirpur 2",
        type: "mess",
        location: { neighborhood: "Mirpur 2", city: "Dhaka" },
        rent: 0,
        featuredImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
        description: "Mess seat available with shared kitchen.",
      };
      const negRent = { ...zeroRent, rent: -500 };

      assert.equal(createPropertySchema.safeParse(zeroRent).success, false);
      assert.equal(createPropertySchema.safeParse(negRent).success, false);
    });

    it("rejects invalid property type", () => {
      const invalidType = {
        title: "Commercial Shop for Rent",
        type: "commercial_shop",
        location: { neighborhood: "Farmgate", city: "Dhaka" },
        rent: 20000,
        featuredImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
        description: "Commercial space on main road.",
      };

      const result = createPropertySchema.safeParse(invalidType);
      assert.equal(result.success, false);
    });

    it("rejects malformed image URL", () => {
      const badImage = {
        title: "Hostel Seat near DU Campus",
        type: "hostel",
        location: { neighborhood: "Nilkhet", city: "Dhaka" },
        rent: 4500,
        featuredImage: "not-a-valid-url",
        description: "Hostel room with wifi and study desk.",
      };

      const result = createPropertySchema.safeParse(badImage);
      assert.equal(result.success, false);
    });
  });

  describe("2. Anti-Privilege Escalation on Creation (Admin Inspection Queue)", () => {
    const assignInitialListingStatus = (userRole: string) => {
      const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
      return {
        status: isAdmin ? "verified" : "pending",
        isVerified: isAdmin,
        isHiddenFromSearch: false,
      };
    };

    it("defaults owner-created listings to status='pending' and isVerified=false", () => {
      const ownerStatus = assignInitialListingStatus("OWNER");
      assert.equal(ownerStatus.status, "pending");
      assert.equal(ownerStatus.isVerified, false);
    });

    it("prevents owners from self-approving or self-issuing the Verified trust badge", () => {
      const callerRole = "OWNER";
      const attemptedClaim = { isVerified: true, status: "verified" };
      const serverStatus = assignInitialListingStatus(callerRole);

      // Server overrides any client attempt to self-verify
      assert.notEqual(serverStatus.status, attemptedClaim.status);
      assert.notEqual(serverStatus.isVerified, attemptedClaim.isVerified);
    });

    it("allows administrators to publish pre-inspected verified listings", () => {
      const adminStatus = assignInitialListingStatus("ADMIN");
      assert.equal(adminStatus.status, "verified");
      assert.equal(adminStatus.isVerified, true);
    });
  });

  describe("3. Ownership Authorization for Listing Edits", () => {
    const checkEditAuthorization = (
      listingOwnerId: string,
      requesterUserId: string,
      requesterRole: string
    ): { allowed: boolean; status: number } => {
      const isOwner = listingOwnerId === requesterUserId;
      const isAdmin = requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN";
      if (!isOwner && !isAdmin) return { allowed: false, status: 403 };
      return { allowed: true, status: 200 };
    };

    it("permits listing owner to edit their own listing", () => {
      const auth = checkEditAuthorization("owner-user-01", "owner-user-01", "OWNER");
      assert.equal(auth.allowed, true);
      assert.equal(auth.status, 200);
    });

    it("strictly prohibits another owner from modifying a stranger's listing (403 Forbidden)", () => {
      const auth = checkEditAuthorization("owner-user-01", "owner-user-02", "OWNER");
      assert.equal(auth.allowed, false);
      assert.equal(auth.status, 403);
    });

    it("permits platform administrators to edit any listing", () => {
      const auth = checkEditAuthorization("owner-user-01", "admin-user-01", "ADMIN");
      assert.equal(auth.allowed, true);
      assert.equal(auth.status, 200);
    });

    it("resets listing status to 'pending' when owner updates listing details", () => {
      const currentListing = {
        id: "prop-01",
        ownerId: "owner-user-01",
        status: "verified",
        isVerified: true,
      };

      const applyOwnerEdit = (requesterRole: string, current: typeof currentListing) => {
        if (requesterRole !== "ADMIN") {
          return {
            ...current,
            status: "pending",
            isVerified: false,
          };
        }
        return current;
      };

      const updated = applyOwnerEdit("OWNER", currentListing);
      assert.equal(updated.status, "pending");
      assert.equal(updated.isVerified, false);
    });
  });

  describe("4. Ownership Authorization & Safe Deletion with Scam Protection", () => {
    const checkDeleteAction = (
      listingOwnerId: string,
      requesterUserId: string,
      requesterRole: string,
      hasActiveScamReport: boolean
    ): { allowed: boolean; action: "delete" | "deactivate"; status: number } => {
      const isOwner = listingOwnerId === requesterUserId;
      const isAdmin = requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN";
      if (!isOwner && !isAdmin) return { allowed: false, action: "delete", status: 403 };

      if (hasActiveScamReport) {
        // Safe deactivation instead of destroying moderation evidence
        return { allowed: true, action: "deactivate", status: 200 };
      }
      return { allowed: true, action: "delete", status: 200 };
    };

    it("allows owner to permanently delete a listing with no active scam reports", () => {
      const result = checkDeleteAction("owner-user-01", "owner-user-01", "OWNER", false);
      assert.equal(result.allowed, true);
      assert.equal(result.action, "delete");
    });

    it("strictly prevents strangers from deleting an owner's listing (403 Forbidden)", () => {
      const result = checkDeleteAction("owner-user-01", "stranger-user-02", "OWNER", false);
      assert.equal(result.allowed, false);
      assert.equal(result.status, 403);
    });

    it("safely deactivates listing rather than hard-deleting when active scam report exists", () => {
      const result = checkDeleteAction("owner-user-01", "owner-user-01", "OWNER", true);
      assert.equal(result.allowed, true);
      assert.equal(result.action, "deactivate");
    });
  });

  describe("5. Public Search & Details Dynamic Suppression", () => {
    interface PropertyRecord {
      id: string;
      ownerId: string;
      status: "pending" | "verified" | "rejected";
      isHiddenFromSearch: boolean;
    }

    const isVisibleInPublicSearch = (prop: PropertyRecord): boolean => {
      return prop.status === "verified" && !prop.isHiddenFromSearch;
    };

    const canAccessDetailsPage = (
      prop: PropertyRecord,
      requesterId: string | null,
      requesterRole: string | null
    ): boolean => {
      if (isVisibleInPublicSearch(prop)) return true;
      const isOwner = requesterId !== null && prop.ownerId === requesterId;
      const isAdmin = requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN" || requesterRole === "STAFF";
      return isOwner || isAdmin;
    };

    const verifiedProp: PropertyRecord = {
      id: "prop-01",
      ownerId: "owner-01",
      status: "verified",
      isHiddenFromSearch: false,
    };

    const pendingProp: PropertyRecord = {
      id: "prop-02",
      ownerId: "owner-01",
      status: "pending",
      isHiddenFromSearch: false,
    };

    const rejectedProp: PropertyRecord = {
      id: "prop-03",
      ownerId: "owner-01",
      status: "rejected",
      isHiddenFromSearch: true,
    };

    const scamHiddenProp: PropertyRecord = {
      id: "prop-04",
      ownerId: "owner-01",
      status: "verified",
      isHiddenFromSearch: true,
    };

    it("includes only verified, unhidden listings in public search", () => {
      assert.equal(isVisibleInPublicSearch(verifiedProp), true);
      assert.equal(isVisibleInPublicSearch(pendingProp), false);
      assert.equal(isVisibleInPublicSearch(rejectedProp), false);
      assert.equal(isVisibleInPublicSearch(scamHiddenProp), false);
    });

    it("hides unapproved (pending) listings from public detail page visitors (404)", () => {
      const publicViewer = canAccessDetailsPage(pendingProp, null, null);
      assert.equal(publicViewer, false);
    });

    it("permits listing owner to preview their own pending listing on detail page", () => {
      const ownerViewer = canAccessDetailsPage(pendingProp, "owner-01", "OWNER");
      assert.equal(ownerViewer, true);
    });

    it("permits administrator to view pending or suppressed listings on detail page", () => {
      const adminViewer = canAccessDetailsPage(pendingProp, "admin-01", "ADMIN");
      assert.equal(adminViewer, true);
    });

    it("hides scam-suppressed listings from strangers even if previously verified", () => {
      const strangerViewer = canAccessDetailsPage(scamHiddenProp, "student-01", "STUDENT");
      assert.equal(strangerViewer, false);
    });
  });
});
