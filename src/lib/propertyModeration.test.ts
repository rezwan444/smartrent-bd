import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getModerationStore,
  saveModerationStore,
  getAllPublicProperties,
  submitScamReport,
  moderateScamReport,
  verifyListing,
  verifyOwnerNid,
  INITIAL_MODERATION_STORE,
} from "./propertyModerationStorage.ts";

describe("Property Moderation & Scam Suppression (Track C3)", () => {
  beforeEach(() => {
    // Reset to pristine seed data before each test
    saveModerationStore(JSON.parse(JSON.stringify(INITIAL_MODERATION_STORE)));
  });

  it("automatically hides a reported listing from public search upon receiving a scam report", () => {
    // Step 1: Ensure prop-01 is initially visible
    const initialPublic = getAllPublicProperties();
    assert.equal(initialPublic.some((p) => p.id === "prop-01"), true);

    // Step 2: Student submits a safety scam report against prop-01
    const report = submitScamReport({
      propertyId: "prop-01",
      propertyTitle: "Furnished single room near East West University",
      reason: "Host asked for advance bKash money before physical visit",
      details: "Demanded ৳ 2,000 token advance via personal bKash number",
      reportedBy: "Tanvir Hasan (DU CSE)",
      contactInfo: "+880 1711-223344",
    });

    assert.equal(report.status, "awaiting_review");
    assert.equal(report.actionTaken, "hidden_from_search");

    // Step 3: Check that prop-01 is now immediately HIDDEN from public search results
    const updatedPublic = getAllPublicProperties();
    const isStillPublic = updatedPublic.some((p) => p.id === "prop-01");
    assert.equal(isStillPublic, false);

    // Step 4: Verify audit log recorded the automatic suppression
    const store = getModerationStore();
    const lastLog = store.auditLogs[0];
    assert.equal(lastLog.targetId, report.id);
    assert.equal(lastLog.action, "Listing Automatically Hidden");
  });

  it("restores listing visibility when admin investigates and dismisses a false scam report", () => {
    // Report prop-02
    submitScamReport({
      propertyId: "prop-02",
      propertyTitle: "Two-bedroom residential flat near Mirpur-10",
      reason: "Incorrect rent amount",
    });

    // Verify it is hidden
    assert.equal(getAllPublicProperties().some((p) => p.id === "prop-02"), false);

    // Admin reviews report and finds listing is compliant -> Dismiss report
    const store = getModerationStore();
    const report = store.scamReports.find((r) => r.propertyId === "prop-02");
    assert.ok(report);

    moderateScamReport(
      report.id,
      "dismiss",
      "Investigated with building caretaker. Rent is accurate, complaint was malicious.",
      "Admin Staff Rayhan"
    );

    // Verify report is dismissed
    const refreshedStore = getModerationStore();
    const updatedReport = refreshedStore.scamReports.find((r) => r.id === report.id);
    assert.equal(updatedReport?.status, "dismissed");
    assert.equal(updatedReport?.actionTaken, "restored");

    // Verify listing is restored to public search
    const restoredPublic = getAllPublicProperties();
    assert.equal(restoredPublic.some((p) => p.id === "prop-02"), true);
  });

  it("permanently de-lists a confirmed fraudulent listing with auditable notes", () => {
    submitScamReport({
      propertyId: "prop-05",
      propertyTitle: "Bachelor mess seat in Dhanmondi",
      reason: "Suspected fraudulent listing",
    });

    const store = getModerationStore();
    const report = store.scamReports.find((r) => r.propertyId === "prop-05");
    assert.ok(report);

    // Admin confirms fraud
    moderateScamReport(
      report.id,
      "confirm_fraud",
      "Confirmed impersonation. Photos stolen from another building. Phone number blocked.",
      "Admin Officer"
    );

    const refreshedStore = getModerationStore();
    const targetProperty = refreshedStore.properties.find((p) => p.id === "prop-05");
    assert.equal(targetProperty?.status, "suspended");
    assert.equal(targetProperty?.isHiddenFromSearch, true);

    // Must never appear in public search
    assert.equal(getAllPublicProperties().some((p) => p.id === "prop-05"), false);
  });

  it("approves pending listings, marks them verified, and publishes them", () => {
    // ver-pend-01 is initially pending and hidden
    const initialPublic = getAllPublicProperties();
    assert.equal(initialPublic.some((p) => p.id === "ver-pend-01"), false);

    // Admin approves the listing after inspection
    verifyListing(
      "ver-pend-01",
      "approve",
      "Physical room inspected by Dhaka field team. Clean facilities and valid student rules.",
      "Admin Inspector"
    );

    const refreshedStore = getModerationStore();
    const verifiedItem = refreshedStore.properties.find((p) => p.id === "ver-pend-01");
    assert.equal(verifiedItem?.status, "verified");
    assert.equal(verifiedItem?.isHiddenFromSearch, false);

    // Audit log was recorded
    const log = refreshedStore.auditLogs.find((l) => l.targetId === "ver-pend-01");
    assert.ok(log);
    assert.equal(log.action, "Listing Approved & Verified");
  });

  it("rejects non-compliant listings with rejection feedback notes", () => {
    verifyListing(
      "ver-pend-02",
      "reject",
      "Photos do not show washroom condition. Please re-upload clear photos of facilities.",
      "Admin Reviewer"
    );

    const refreshedStore = getModerationStore();
    const rejectedItem = refreshedStore.properties.find((p) => p.id === "ver-pend-02");
    assert.equal(rejectedItem?.status, "rejected");
    assert.equal(rejectedItem?.isHiddenFromSearch, true);
    assert.equal(rejectedItem?.adminNotes?.includes("Photos do not show"), true);
  });

  it("verifies owner NID identity and updates related properties", () => {
    const store = getModerationStore();
    const pendingNid = store.ownerVerifications.find((s) => s.id === "nid-sub-02");
    assert.ok(pendingNid);
    assert.equal(pendingNid.status, "pending");

    verifyOwnerNid(
      pendingNid.id,
      "approve",
      "NID matched with national identity registry. Holding tax paid.",
      "Senior Admin"
    );

    const refreshedStore = getModerationStore();
    const updatedNid = refreshedStore.ownerVerifications.find((s) => s.id === pendingNid.id);
    assert.equal(updatedNid?.status, "approved");

    // Associated properties should now show NID as Verified
    const ownerProperty = refreshedStore.properties.find(
      (p) => p.ownerName === pendingNid.ownerName
    );
    assert.equal(ownerProperty?.nidStatus, "Verified");
  });
});
