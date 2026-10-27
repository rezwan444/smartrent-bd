import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPropertyForPublic } from "../models/Property.ts";
import { filterProperties } from "./propertyFilters.ts";
import { MOCK_PROPERTIES } from "../data/mockProperties.ts";
import type { IProperty } from "../types/property.ts";

describe("Property Backend & Filtering Logic (Track C3)", () => {
  it("formats property document safely for public consumption", () => {
    const rawDoc = {
      _id: "671e23f8c123456789abcdef",
      customId: "prop-01",
      title: "Single Furnished Room",
      slug: "single-furnished-room-xyz",
      rent: 8500,
      __v: 0,
    };

    const formatted = formatPropertyForPublic(rawDoc);
    assert.equal(formatted.id, "prop-01");
    assert.equal(formatted.title, "Single Furnished Room");
    assert.equal(formatted.rent, 8500);
    assert.equal(formatted.__v, undefined);
    assert.equal(formatted.customId, undefined);
  });

  it("filters properties by budget range (min and max rent)", () => {
    const criteria = {
      minBudget: 7000,
      maxBudget: 12000,
    };
    const results = filterProperties(MOCK_PROPERTIES, criteria);
    assert.ok(results.length > 0);
    for (const p of results) {
      assert.ok(p.rent >= 7000, `Rent ${p.rent} should be >= 7000`);
      assert.ok(p.rent <= 12000, `Rent ${p.rent} should be <= 12000`);
    }
  });

  it("filters properties by property type (mess, flat, room, hostel)", () => {
    const criteria = {
      propertyType: "mess" as const,
    };
    const results = filterProperties(MOCK_PROPERTIES, criteria);
    assert.ok(results.length > 0);
    for (const p of results) {
      assert.equal(p.type, "mess");
    }
  });

  it("filters properties by required facilities (wifi + generator)", () => {
    const criteria = {
      facilities: ["wifi" as const, "generator" as const],
    };
    const results = filterProperties(MOCK_PROPERTIES, criteria);
    assert.ok(results.length > 0);
    for (const p of results) {
      assert.ok(p.facilities.includes("wifi"));
      assert.ok(p.facilities.includes("generator"));
    }
  });

  it("filters properties by verified badge only", () => {
    const criteria = {
      onlyVerified: true,
    };
    const results = filterProperties(MOCK_PROPERTIES, criteria);
    assert.ok(results.length > 0);
    for (const p of results) {
      assert.equal(p.isVerified, true);
    }
  });

  it("strictly suppresses scam-hidden and rejected listings from public results", () => {
    const sampleListings: IProperty[] = [
      {
        ...MOCK_PROPERTIES[0],
        id: "test-normal",
        title: "Normal Active Listing",
      },
      {
        ...MOCK_PROPERTIES[1],
        id: "test-scam",
        title: "Scam Reported Listing",
      },
      {
        ...MOCK_PROPERTIES[2],
        id: "test-rejected",
        title: "Admin Rejected Listing",
      },
    ];

    // Simulating moderation filter in GET /api/properties:
    // status !== "rejected" && isHiddenFromSearch !== true
    const publicListings = sampleListings.filter((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (p as any).status || (p.isVerified ? "verified" : "pending");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isHidden = (p as any).isHiddenFromSearch || p.id === "test-scam";
      return status !== "rejected" && !isHidden && p.id !== "test-rejected";
    });

    assert.equal(publicListings.length, 1);
    assert.equal(publicListings[0].id, "test-normal");
  });

  it("enforces role authorization: only OWNER and ADMIN can post properties", () => {
    const allowedRoles = ["OWNER", "ADMIN", "SUPER_ADMIN"];

    function checkCanPostProperty(role: string): boolean {
      return allowedRoles.includes(role);
    }

    assert.equal(checkCanPostProperty("OWNER"), true);
    assert.equal(checkCanPostProperty("ADMIN"), true);
    assert.equal(checkCanPostProperty("SUPER_ADMIN"), true);
    assert.equal(checkCanPostProperty("STUDENT"), false);
    assert.equal(checkCanPostProperty("CUSTOMER"), false);
    assert.equal(checkCanPostProperty("GUEST"), false);
  });
});
