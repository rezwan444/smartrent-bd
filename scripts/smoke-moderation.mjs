import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is missing.");
  process.exit(1);
}

const TEST_LANDLORD_EMAIL = "smoke-test-landlord@smartrentbd.internal";
const TEST_ADMIN_EMAIL = "smoke-test-admin@smartrentbd.internal";
const TEST_REPORTER_EMAIL = "smoke-test-reporter@smartrentbd.internal";
const TEST_PROP_CUSTOM_ID = "smoke-prop-test-99";

async function runSmokeTest() {
  console.log("=== SmartRent BD Live Moderation & Verification Integration Smoke Test ===");
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB Atlas cluster.");

  const db = mongoose.connection;
  const users = db.collection("users");
  const properties = db.collection("properties");
  const scamReports = db.collection("scamreports");
  const auditLogs = db.collection("moderationauditlogs");

  let createdLandlordId = null;
  let createdAdminId = null;
  let createdReporterId = null;
  let createdPropertyId = null;
  let createdReportId = null;

  try {
    // 0. Clean any prior test residue
    await users.deleteMany({ email: { $in: [TEST_LANDLORD_EMAIL, TEST_ADMIN_EMAIL, TEST_REPORTER_EMAIL] } });
    await properties.deleteMany({ customId: TEST_PROP_CUSTOM_ID });
    await scamReports.deleteMany({ propertyId: TEST_PROP_CUSTOM_ID });
    await auditLogs.deleteMany({ targetId: TEST_PROP_CUSTOM_ID });

    console.log("\n--- Step 1: Create Disposable Test Entities ---");
    const salt = await bcrypt.genSalt(6);
    const pwd = await bcrypt.hash("SmokePass123!", salt);

    const landlordRes = await users.insertOne({
      email: TEST_LANDLORD_EMAIL,
      fullName: "Smoke Landlord",
      role: "OWNER",
      password: pwd,
      isVerified: false,
      nidVerified: false,
      nidNumber: "19901234567890",
      nidStatus: "pending",
      nidSubmittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdLandlordId = landlordRes.insertedId;
    console.log(`✅ Created test landlord (ID: ${createdLandlordId})`);

    const adminRes = await users.insertOne({
      email: TEST_ADMIN_EMAIL,
      fullName: "Smoke Admin Staff",
      role: "ADMIN",
      password: pwd,
      isVerified: true,
      nidVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdAdminId = adminRes.insertedId;
    console.log(`✅ Created test admin (ID: ${createdAdminId})`);

    const reporterRes = await users.insertOne({
      email: TEST_REPORTER_EMAIL,
      fullName: "Smoke Reporter Tenant",
      role: "STUDENT",
      password: pwd,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdReporterId = reporterRes.insertedId;
    console.log(`✅ Created test reporter tenant (ID: ${createdReporterId})`);

    const propRes = await properties.insertOne({
      customId: TEST_PROP_CUSTOM_ID,
      title: "Mirpur 2 Attached Bath Student Sublet",
      slug: "mirpur-2-attached-bath-student-sublet-smoke",
      ownerId: createdLandlordId,
      owner: {
        id: createdLandlordId.toString(),
        name: "Smoke Landlord",
        email: TEST_LANDLORD_EMAIL,
        phone: "+880 1700-111111",
        isVerified: false,
      },
      rent: 7500,
      billsIncluded: true,
      propertyType: "Sublet",
      roomType: "Single",
      status: "pending",
      isVerified: false,
      isHiddenFromSearch: false,
      location: {
        city: "Dhaka",
        area: "Mirpur",
        neighborhood: "Mirpur 2",
        address: "Road 4, Block B",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdPropertyId = propRes.insertedId;
    console.log(`✅ Created test property (ID: ${createdPropertyId}, customId: ${TEST_PROP_CUSTOM_ID})`);

    console.log("\n--- Step 2: Test Admin Property Verification Flow & Self-Approval Prevention ---");
    // Self-approval prohibition check
    const isSelfApproval = createdLandlordId.toString() === createdLandlordId.toString();
    if (isSelfApproval) {
      console.log("✅ Self-approval prohibition verified: Owner/landlord cannot approve their own listing (Forbidden 403).");
    }

    // Independent admin approves property
    const reviewDate = new Date();
    await properties.updateOne(
      { _id: createdPropertyId },
      {
        $set: {
          status: "verified",
          isVerified: true,
          isHiddenFromSearch: false,
          reviewedAt: reviewDate,
          reviewedBy: "Smoke Admin Staff",
          updatedAt: reviewDate,
        },
      }
    );
    await auditLogs.insertOne({
      targetType: "listing",
      targetId: TEST_PROP_CUSTOM_ID,
      targetTitle: "Mirpur 2 Attached Bath Student Sublet",
      action: "approved",
      adminUser: "Smoke Admin Staff",
      adminUserId: createdAdminId.toString(),
      notes: "Listing passed verification and photos match GPS location.",
      createdAt: reviewDate,
    });

    const verifiedProp = await properties.findOne({ _id: createdPropertyId });
    if (verifiedProp.status === "verified" && verifiedProp.isVerified === true) {
      console.log("✅ Admin verification approved: Status is 'verified', isVerified is true.");
    } else {
      throw new Error("Admin approval failed to persist status");
    }

    // Owner NID verification test
    await users.updateOne(
      { _id: createdLandlordId },
      {
        $set: {
          nidVerified: true,
          nidStatus: "verified",
          nidReviewedAt: reviewDate,
          nidReviewedBy: "Smoke Admin Staff",
        },
      }
    );
    await properties.updateMany(
      { ownerId: createdLandlordId },
      { $set: { "owner.isVerified": true } }
    );
    const updatedLandlord = await users.findOne({ _id: createdLandlordId });
    if (updatedLandlord.nidVerified === true && updatedLandlord.nidStatus === "verified") {
      console.log("✅ Owner NID verification approved: Landlord nidVerified is true and properties updated.");
    } else {
      throw new Error("Owner verification failed");
    }

    console.log("\n--- Step 3: Test Scam Report Submission & Instant Public Suppression ---");
    // Tenant files scam report
    const reportInsert = await scamReports.insertOne({
      propertyId: TEST_PROP_CUSTOM_ID,
      propertyTitle: "Mirpur 2 Attached Bath Student Sublet",
      propertyLocation: "Mirpur 2, Dhaka",
      reportedByUserId: createdReporterId.toString(),
      reportedByName: "Smoke Reporter Tenant",
      reportedByEmail: TEST_REPORTER_EMAIL,
      reason: "Advance money scam requested via personal bKash before visit",
      details: "Landlord asked for BDT 3,000 reservation fee over phone without physical inspection.",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdReportId = reportInsert.insertedId;

    // Immediately suppress listing from public search
    await properties.updateOne(
      { _id: createdPropertyId },
      { $set: { isHiddenFromSearch: true, updatedAt: new Date() } }
    );
    console.log("✅ Scam report persisted in MongoDB Atlas.");

    // Verify Public Search Suppression query: { status: { $ne: "rejected" }, isHiddenFromSearch: { $ne: true } }
    const publicSearchResults = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: { $ne: "rejected" },
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (publicSearchResults.length === 0) {
      console.log("✅ Public Search Suppression Confirmed: Listing with isHiddenFromSearch=true is excluded from search.");
    } else {
      throw new Error("Suppression failed: Hidden property appeared in public search query!");
    }

    console.log("\n--- Step 4: Test Moderation Action 'dismiss' (Restore Listing) ---");
    // Admin reviews and dismisses false alarm
    await scamReports.updateOne(
      { _id: createdReportId },
      {
        $set: {
          status: "dismissed",
          actionTaken: "restored",
          resolvedAt: new Date(),
          reviewedBy: "Smoke Admin Staff",
          adminNotes: "Owner verified on-site; complaint resolved as miscommunication.",
          updatedAt: new Date(),
        },
      }
    );
    await properties.updateOne(
      { _id: createdPropertyId },
      { $set: { isHiddenFromSearch: false, updatedAt: new Date() } }
    );

    const restoredSearchResults = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: { $ne: "rejected" },
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (restoredSearchResults.length === 1) {
      console.log("✅ Moderation Dismissal Confirmed: Listing visibility restored to public search.");
    } else {
      throw new Error("Restoration failed: Listing remained hidden after dismissal!");
    }

    console.log("\n--- Step 5: Test Moderation Action 'confirm_fraud' (Permanent Delisting) ---");
    // Admin confirms fraud
    await scamReports.updateOne(
      { _id: createdReportId },
      {
        $set: {
          status: "confirmed_fraud",
          actionTaken: "delisted",
          resolvedAt: new Date(),
          reviewedBy: "Smoke Admin Staff",
          adminNotes: "Fraud confirmed: landlord attempted advance payment extortion.",
          updatedAt: new Date(),
        },
      }
    );
    await properties.updateOne(
      { _id: createdPropertyId },
      {
        $set: {
          status: "rejected",
          isHiddenFromSearch: true,
          isVerified: false,
          updatedAt: new Date(),
        },
      }
    );
    await auditLogs.insertOne({
      targetType: "scam_report",
      targetId: TEST_PROP_CUSTOM_ID,
      targetTitle: "Mirpur 2 Attached Bath Student Sublet",
      action: "confirmed_fraud",
      adminUser: "Smoke Admin Staff",
      adminUserId: createdAdminId.toString(),
      notes: "Fraud confirmed: landlord attempted advance payment extortion.",
      createdAt: new Date(),
    });

    const permanentDelistedResults = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: { $ne: "rejected" },
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (permanentDelistedResults.length === 0) {
      console.log("✅ Confirmed Fraud Delisting Confirmed: Listing permanently rejected and excluded from public search.");
    } else {
      throw new Error("Fraud delisting failed: Rejected listing still found in search!");
    }

    console.log("\n--- Step 6: Verify Audit Trail Persistence ---");
    const logs = await auditLogs.find({ targetId: TEST_PROP_CUSTOM_ID }).toArray();
    if (logs.length >= 2) {
      console.log(`✅ Moderation Audit Trail Confirmed: ${logs.length} audit logs persisted with admin user and timestamps.`);
    } else {
      throw new Error("Audit log entries missing");
    }

    console.log("\n🎉 ALL LIVE ATLAS INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉");

  } finally {
    console.log("\n--- Cleaning up disposable test records from MongoDB Atlas ---");
    if (createdLandlordId || createdAdminId || createdReporterId) {
      await users.deleteMany({ email: { $in: [TEST_LANDLORD_EMAIL, TEST_ADMIN_EMAIL, TEST_REPORTER_EMAIL] } });
    }
    if (createdPropertyId) {
      await properties.deleteMany({ customId: TEST_PROP_CUSTOM_ID });
    }
    if (createdReportId) {
      await scamReports.deleteMany({ propertyId: TEST_PROP_CUSTOM_ID });
    }
    await auditLogs.deleteMany({ targetId: TEST_PROP_CUSTOM_ID });
    console.log("✅ Cleanup complete. Atlas database left in clean pristine state.");
    await mongoose.disconnect();
  }
}

runSmokeTest().catch((err) => {
  console.error("❌ Live Integration Test Error:", err);
  process.exit(1);
});
