import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { SIDEBAR_ITEMS } from "./constants.ts";

describe("Dashboard Navigation & Role Separation", () => {
  test("strictly separates Admin navigation from Student and Owner workflows", () => {
    const adminItems = SIDEBAR_ITEMS.filter((item) => item.roles.includes("ADMIN"));
    const adminHrefs = adminItems.map((item) => item.href);

    // 1. Admin must contain the 5 required moderation items
    assert.ok(adminHrefs.includes("/dashboard/admin"), "Admin Overview must be present");
    assert.ok(adminHrefs.includes("/dashboard/admin?tab=listings"), "Listing Verification must be present");
    assert.ok(adminHrefs.includes("/dashboard/admin?tab=owners"), "Owner NID Verification must be present");
    assert.ok(adminHrefs.includes("/dashboard/admin?tab=scams"), "Scam Reports & Suppression must be present");
    assert.ok(adminHrefs.includes("/dashboard/admin?tab=logs"), "Moderation Audit Trail must be present");

    // 2. Student-facing items must NOT appear in Admin navigation
    assert.ok(!adminHrefs.includes("/roommates"), "Roommate matching must not appear in Admin sidebar");
    assert.ok(!adminHrefs.includes("/dashboard/student/expenses"), "Shared expenses must not appear in Admin sidebar");
    assert.ok(!adminHrefs.includes("/dashboard/student/maintenance"), "Student maintenance must not appear in Admin sidebar");
    assert.ok(!adminHrefs.includes("/dashboard/student"), "Student portal must not appear in Admin sidebar");

    // 3. Exactly 5 items in Admin sidebar
    assert.equal(adminItems.length, 5, "Admin navigation must strictly have 5 focused moderation items");
  });

  test("preserves Student portal navigation with roommates, expenses, and maintenance", () => {
    const studentItems = SIDEBAR_ITEMS.filter((item) => item.roles.includes("STUDENT"));
    const studentHrefs = studentItems.map((item) => item.href);

    assert.ok(studentHrefs.includes("/dashboard/student"), "Student dashboard must be present");
    assert.ok(studentHrefs.includes("/roommates"), "Roommate matching must be present for students");
    assert.ok(studentHrefs.includes("/dashboard/student/expenses"), "Shared expenses must be present for students");
    assert.ok(studentHrefs.includes("/dashboard/student/maintenance"), "Maintenance must be present for students");

    // No admin moderation items in Student sidebar
    assert.ok(!studentHrefs.includes("/dashboard/admin"), "Admin portal must not appear in student sidebar");
    assert.ok(!studentHrefs.includes("/dashboard/admin?tab=listings"), "Admin listings queue must not appear in student sidebar");
    assert.ok(!studentHrefs.includes("/dashboard/admin?tab=owners"), "Admin owner queue must not appear in student sidebar");
    assert.ok(!studentHrefs.includes("/dashboard/admin?tab=scams"), "Admin scams queue must not appear in student sidebar");
  });

  test("preserves Owner portal navigation without pollution", () => {
    const ownerItems = SIDEBAR_ITEMS.filter((item) => item.roles.includes("OWNER"));
    const ownerHrefs = ownerItems.map((item) => item.href);

    assert.ok(ownerHrefs.includes("/dashboard/owner"), "Owner dashboard must be present");
    assert.ok(ownerItems.length >= 1, "Owner navigation contains owner portal sections");
    assert.ok(
      ownerHrefs.every((h) => h.startsWith("/dashboard/owner")),
      "All owner items must strictly belong to owner portal"
    );
    assert.ok(!ownerHrefs.includes("/dashboard/admin"), "Admin portal must not appear in owner sidebar");
  });
});
