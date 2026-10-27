import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  checkTenantEligibility,
  submitPropertyReview,
  getPropertyRatingSummary,
  loadPropertyReviews,
  resetPropertyReviews,
} from "./propertyReviewStorage.ts";

describe("Feature 7: Property Reviews & Ratings (Track C3)", () => {
  beforeEach(() => {
    // Reset reviews to pre-seeded mock state before each test
    resetPropertyReviews();
  });

  test("calculates rating summary, star distribution, and sub-ratings accurately", () => {
    const summary = getPropertyRatingSummary("prop-01");

    assert.equal(summary.propertyId, "prop-01");
    assert.equal(summary.totalReviews, 2);
    // prop-01 pre-seeded with 5 stars (rev-01) and 4 stars (rev-02) -> avg 4.5
    assert.equal(summary.averageRating, 4.5);
    assert.equal(summary.distribution[5], 1);
    assert.equal(summary.distribution[4], 1);
    assert.equal(summary.distribution[3], 0);

    // Sub-ratings averages
    assert.ok(summary.subRatingAverages);
    assert.equal(summary.subRatingAverages.safety, 5.0);
    assert.equal(summary.subRatingAverages.cleanliness, 4.5);
  });

  test("returns empty summary with 0.0 rating for properties with no reviews", () => {
    const summary = getPropertyRatingSummary("prop-99-unreviewed");

    assert.equal(summary.totalReviews, 0);
    assert.equal(summary.averageRating, 0);
    assert.equal(summary.distribution[5], 0);
    assert.equal(summary.distribution[1], 0);
  });

  test("strictly isolates reviews by propertyId", () => {
    const prop01Reviews = loadPropertyReviews("prop-01");
    const prop02Reviews = loadPropertyReviews("prop-02");

    assert.ok(prop01Reviews.length >= 2);
    assert.ok(prop02Reviews.length >= 1);

    // Verify all returned reviews belong strictly to the requested property
    assert.ok(prop01Reviews.every((r) => r.propertyId === "prop-01"));
    assert.ok(prop02Reviews.every((r) => r.propertyId === "prop-02"));
  });

  describe("Verified Tenant Eligibility", () => {
    test("approves eligibility for verified active resident (demo-student-01 on prop-01)", () => {
      const eligibility = checkTenantEligibility(
        {
          id: "demo-student-01",
          email: "student@smartrentbd.com",
          role: "STUDENT",
        },
        "prop-01"
      );

      assert.equal(eligibility.isEligible, true);
      assert.equal(eligibility.isLoggedIn, true);
      assert.equal(eligibility.hasAlreadyReviewed, false);
      assert.ok(eligibility.tenancyRecord);
      assert.equal(eligibility.tenancyRecord.status, "active");
    });

    test("approves eligibility for completed past tenancy (Tanvir Hasan on prop-01 if not yet reviewed)", () => {
      // In mock data, Tanvir has rev-01, so checkTenantEligibility marks hasAlreadyReviewed = true
      const eligibility = checkTenantEligibility(
        {
          id: "mem-02",
          email: "tanvir.du.cse@gmail.com",
          role: "STUDENT",
        },
        "prop-01"
      );

      assert.equal(eligibility.isEligible, false);
      assert.equal(eligibility.hasAlreadyReviewed, true);
      assert.ok(eligibility.existingReview);
      assert.equal(eligibility.existingReview.userId, "mem-02");
    });

    test("rejects eligibility when user is not signed in", () => {
      const eligibility = checkTenantEligibility(null, "prop-01");

      assert.equal(eligibility.isEligible, false);
      assert.equal(eligibility.isLoggedIn, false);
      assert.match(eligibility.reason, /sign in/i);
    });

    test("rejects eligibility for property owners and administrators", () => {
      const ownerEligibility = checkTenantEligibility(
        { id: "demo-owner-01", email: "owner@smartrentbd.com", role: "OWNER" },
        "prop-01"
      );
      assert.equal(ownerEligibility.isEligible, false);
      assert.equal(ownerEligibility.isOwnerOrAdmin, true);

      const adminEligibility = checkTenantEligibility(
        { id: "demo-admin-01", email: "admin@smartrentbd.com", role: "ADMIN" },
        "prop-01"
      );
      assert.equal(adminEligibility.isEligible, false);
      assert.equal(adminEligibility.isOwnerOrAdmin, true);
    });

    test("rejects review eligibility for properties where user has NO confirmed rental", () => {
      // demo-student-01 rents prop-01, but NOT prop-02 or prop-03
      const eligibilityProp02 = checkTenantEligibility(
        {
          id: "demo-student-01",
          email: "student@smartrentbd.com",
          role: "STUDENT",
        },
        "prop-02"
      );

      assert.equal(eligibilityProp02.isEligible, false);
      assert.equal(eligibilityProp02.hasAlreadyReviewed, false);
      assert.match(eligibilityProp02.reason, /active or completed tenancy agreement/i);
    });

    test("enforces that a visit request alone does NOT confer tenant eligibility", () => {
      // A customer or student user who has only scheduled a visit for prop-02
      const customerEligibility = checkTenantEligibility(
        {
          id: "demo-customer-02",
          email: "customer@example.com",
          role: "STUDENT",
        },
        "prop-02"
      );

      assert.equal(customerEligibility.isEligible, false);
      assert.match(customerEligibility.reason, /visit requests alone do not confer/i);
    });
  });

  describe("Validation & Submission", () => {
    test("rejects invalid rating values (out of bounds, non-integers, NaN)", () => {
      const invalidRatings = [0, 6, -2, 3.5, 4.8, NaN];

      for (const badRating of invalidRatings) {
        const res = submitPropertyReview({
          propertyId: "prop-01",
          userId: "demo-student-01",
          userName: "Rayhan Ahmed",
          userEmail: "student@smartrentbd.com",
          userRole: "STUDENT",
          rating: badRating,
          comment: "A perfectly valid comment that is longer than ten characters.",
        });

        assert.equal(res.success, false, `Expected rating ${badRating} to be rejected`);
        assert.match(res.error || "", /integer between 1 and 5/i);
      }
    });

    test("rejects comments shorter than 10 characters or empty whitespace", () => {
      const invalidComments = ["", "   ", "Good", "Nice room", "Too short"];

      for (const badComment of invalidComments) {
        const res = submitPropertyReview({
          propertyId: "prop-01",
          userId: "demo-student-01",
          userName: "Rayhan Ahmed",
          userEmail: "student@smartrentbd.com",
          userRole: "STUDENT",
          rating: 5,
          comment: badComment,
        });

        assert.equal(res.success, false, `Expected comment '${badComment}' to be rejected`);
        assert.match(res.error || "", /at least 10 characters/i);
      }
    });

    test("successfully publishes verified tenant review and updates rating summary", () => {
      const res = submitPropertyReview({
        propertyId: "prop-01",
        userId: "demo-student-01",
        userName: "Rayhan Ahmed",
        userEmail: "student@smartrentbd.com",
        userRole: "STUDENT",
        rating: 5,
        title: "Very peaceful bachelor stay",
        comment:
          "High speed Wi-Fi, constant generator support during load shedding, and friendly housemates.",
        subRatings: {
          cleanliness: 5,
          landlordBehavior: 5,
          safety: 5,
          facilities: 5,
        },
      });

      assert.equal(res.success, true);
      assert.ok(res.review);
      assert.equal(res.review.isVerifiedTenant, true);
      assert.equal(res.review.rating, 5);
      assert.match(res.review.tenancyDetails || "", /Active Resident/);

      // Now prop-01 has 3 reviews (5 + 4 + 5 = 14 / 3 = 4.7)
      const newSummary = getPropertyRatingSummary("prop-01");
      assert.equal(newSummary.totalReviews, 3);
      assert.equal(newSummary.averageRating, 4.7);
      assert.equal(newSummary.distribution[5], 2);
    });

    test("strictly prevents duplicate reviews by the same user for the same property", () => {
      // 1. First submission succeeds
      const firstRes = submitPropertyReview({
        propertyId: "prop-01",
        userId: "demo-student-01",
        userName: "Rayhan Ahmed",
        userEmail: "student@smartrentbd.com",
        userRole: "STUDENT",
        rating: 5,
        comment: "First authentic review for this student flat.",
      });
      assert.equal(firstRes.success, true);

      // 2. Second submission by same user must be blocked
      const secondRes = submitPropertyReview({
        propertyId: "prop-01",
        userId: "demo-student-01",
        userName: "Rayhan Ahmed",
        userEmail: "student@smartrentbd.com",
        userRole: "STUDENT",
        rating: 4,
        comment: "Trying to submit a duplicate review for the same flat.",
      });

      assert.equal(secondRes.success, false);
      assert.match(secondRes.error || "", /already submitted a review/i);
    });
  });
});
