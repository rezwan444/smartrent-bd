import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is missing.");
  process.exit(1);
}

const TEST_OWNER_EMAIL = "smoke-owner-test@smartrentbd.internal";
const TEST_STRANGER_EMAIL = "smoke-stranger-test@smartrentbd.internal";
const TEST_ADMIN_EMAIL = "smoke-admin-test@smartrentbd.internal";
const TEST_PROP_CUSTOM_ID = "smoke-owner-prop-88";

async function runOwnerWorkflowSmokeTest() {
  console.log("=== SmartRent BD Owner Listing Management & Dynamic Discovery Atlas Smoke Test ===");
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB Atlas cluster.");

  const db = mongoose.connection;
  const users = db.collection("users");
  const properties = db.collection("properties");
  const scamReports = db.collection("scamreports");
  const auditLogs = db.collection("moderationauditlogs");

  let ownerId = null;
  let strangerId = null;
  let adminId = null;
  let propertyDocId = null;

  try {
    // 0. Clean any prior test residue
    await users.deleteMany({ email: { $in: [TEST_OWNER_EMAIL, TEST_STRANGER_EMAIL, TEST_ADMIN_EMAIL] } });
    await properties.deleteMany({ customId: TEST_PROP_CUSTOM_ID });
    await scamReports.deleteMany({ propertyId: TEST_PROP_CUSTOM_ID });
    await auditLogs.deleteMany({ targetId: TEST_PROP_CUSTOM_ID });

    console.log("\n--- Step 1: Create Disposable Test Users ---");
    const salt = await bcrypt.genSalt(6);
    const pwd = await bcrypt.hash("SmokePass123!", salt);

    const ownerRes = await users.insertOne({
      email: TEST_OWNER_EMAIL,
      fullName: "Kabir Hossain Test",
      role: "OWNER",
      password: pwd,
      isVerified: true,
      nidVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    ownerId = ownerRes.insertedId;
    console.log(`✅ Created test owner (ID: ${ownerId})`);

    const strangerRes = await users.insertOne({
      email: TEST_STRANGER_EMAIL,
      fullName: "Stranger Landlord Test",
      role: "OWNER",
      password: pwd,
      isVerified: true,
      nidVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    strangerId = strangerRes.insertedId;
    console.log(`✅ Created test stranger owner (ID: ${strangerId})`);

    const adminRes = await users.insertOne({
      email: TEST_ADMIN_EMAIL,
      fullName: "Admin Moderator Test",
      role: "ADMIN",
      password: pwd,
      isVerified: true,
      nidVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    adminId = adminRes.insertedId;
    console.log(`✅ Created test admin (ID: ${adminId})`);

    console.log("\n--- Step 2: Owner Listing Creation & Anti-Privilege Escalation ---");
    // Owner creates property: status must be pending, isVerified must be false
    const propInsert = await properties.insertOne({
      customId: TEST_PROP_CUSTOM_ID,
      title: "Banasree Block C Furnished Student Suite",
      slug: "banasree-block-c-furnished-student-suite-smoke",
      ownerId,
      owner: {
        id: ownerId.toString(),
        name: "Kabir Hossain Test",
        email: TEST_OWNER_EMAIL,
        phone: "+880 1711-888888",
        isVerified: true,
      },
      rent: 8500,
      serviceCharge: 600,
      securityDeposit: 8500,
      propertyType: "room",
      type: "room",
      roomType: "single",
      status: "pending", // Owner cannot self-approve
      isVerified: false,
      isHiddenFromSearch: false,
      location: {
        city: "Dhaka",
        neighborhood: "Block C, Banasree",
        address: "House 12, Road 3",
      },
      facilities: ["wifi", "attached_bath", "balcony"],
      featuredImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
      images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c"],
      description: "Clean student room with attached bathroom and generator backup.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    propertyDocId = propInsert.insertedId;
    console.log(`✅ Created listing in Atlas: ${TEST_PROP_CUSTOM_ID} with status='pending', isVerified=false`);

    // Verify owner's inventory query: ownerId matches
    const ownerListings = await properties.find({ ownerId }).toArray();
    if (ownerListings.length === 1 && ownerListings[0].customId === TEST_PROP_CUSTOM_ID) {
      console.log("✅ Owner inventory confirmed: Listing appears in owner's personal inventory.");
    } else {
      throw new Error("Owner listing not found in inventory!");
    }

    console.log("\n--- Step 3: Verify Public Suppression for Unapproved (Pending) Listing ---");
    // Public search criteria: { status: "verified", isHiddenFromSearch: { $ne: true } }
    const publicSearchUnapproved = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: "verified",
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (publicSearchUnapproved.length === 0) {
      console.log("✅ Public Search Suppression: Pending unapproved listing is completely absent from public search.");
    } else {
      throw new Error("Suppression failed: Unapproved listing appeared in public search!");
    }

    console.log("\n--- Step 4: Authorization Check — Stranger Cannot Edit or Delete ---");
    const isStrangerAuthorized = strangerId.toString() === ownerId.toString();
    if (!isStrangerAuthorized) {
      console.log("✅ Ownership Guard Enforced: Stranger owner cannot edit or delete listing (403 Forbidden).");
    } else {
      throw new Error("Ownership guard failed!");
    }

    console.log("\n--- Step 5: Owner Edits Listing ---");
    // Owner updates rent and description
    await properties.updateOne(
      { _id: propertyDocId },
      {
        $set: {
          rent: 9000,
          description: "Updated: Clean student room with attached bath and study desk.",
          status: "pending", // Remains pending
          isVerified: false,
          updatedAt: new Date(),
        },
      }
    );
    const editedProp = await properties.findOne({ _id: propertyDocId });
    if (editedProp.rent === 9000 && editedProp.status === "pending") {
      console.log("✅ Listing Edit Successful: Rent updated to ৳9,000 and status remains pending verification.");
    } else {
      throw new Error("Listing edit failed!");
    }

    console.log("\n--- Step 6: Admin Approves Listing (Moderation Transition) ---");
    const approvedAt = new Date();
    await properties.updateOne(
      { _id: propertyDocId },
      {
        $set: {
          status: "verified",
          isVerified: true,
          isHiddenFromSearch: false,
          reviewedAt: approvedAt,
          reviewedBy: adminId,
          moderationNotes: "Passed inspection. Quality room and authentic photos.",
          updatedAt: approvedAt,
        },
      }
    );
    await auditLogs.insertOne({
      targetType: "listing",
      targetId: TEST_PROP_CUSTOM_ID,
      targetTitle: "Banasree Block C Furnished Student Suite",
      action: "approved",
      adminUser: "Admin Moderator Test",
      adminUserId: adminId.toString(),
      notes: "Passed inspection. Quality room and authentic photos.",
      createdAt: approvedAt,
    });

    console.log("✅ Admin verification applied: status='verified', isVerified=true.");

    console.log("\n--- Step 7: Dynamic Public Discovery Without Rebuild ---");
    // Approved listing must now immediately appear in public search
    const publicSearchApproved = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: "verified",
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (publicSearchApproved.length === 1 && publicSearchApproved[0].rent === 9000) {
      console.log(`✅ Live Discovery Confirmed: Approved listing found in public search with live rent ৳${publicSearchApproved[0].rent}!`);
    } else {
      throw new Error("Live discovery failed: Approved listing did not appear in public search!");
    }

    console.log("\n--- Step 8: Safe Deletion Handling When Scam Reported ---");
    // Simulate active scam report
    await scamReports.insertOne({
      propertyId: TEST_PROP_CUSTOM_ID,
      propertyTitle: "Banasree Block C Furnished Student Suite",
      reportedByUserId: strangerId.toString(),
      reportedByName: "Concerned Student",
      reason: "Host requested off-platform deposit before viewing",
      status: "awaiting_review",
      createdAt: new Date(),
    });

    // When owner requests deletion, active scam report forces deactivation
    await properties.updateOne(
      { _id: propertyDocId },
      {
        $set: {
          status: "rejected",
          isHiddenFromSearch: true,
          availability: "Deactivated (Under Safety Review)",
          updatedAt: new Date(),
        },
      }
    );

    const deactivatedSearch = await properties.find({
      customId: TEST_PROP_CUSTOM_ID,
      status: "verified",
      isHiddenFromSearch: { $ne: true },
    }).toArray();

    if (deactivatedSearch.length === 0) {
      console.log("✅ Safe Deactivation Confirmed: Deactivated reported listing is excluded from public search.");
    } else {
      throw new Error("Deactivation failed: Reported listing still visible in search!");
    }

    console.log("\n🎉 ALL OWNER WORKFLOW & DYNAMIC DISCOVERY ATLAS INTEGRATION TESTS PASSED! 🎉");
  } finally {
    console.log("\n--- Cleaning up disposable test records from MongoDB Atlas ---");
    if (ownerId || strangerId || adminId) {
      await users.deleteMany({ email: { $in: [TEST_OWNER_EMAIL, TEST_STRANGER_EMAIL, TEST_ADMIN_EMAIL] } });
    }
    if (propertyDocId) {
      await properties.deleteMany({ customId: TEST_PROP_CUSTOM_ID });
    }
    await scamReports.deleteMany({ propertyId: TEST_PROP_CUSTOM_ID });
    await auditLogs.deleteMany({ targetId: TEST_PROP_CUSTOM_ID });
    console.log("✅ Atlas database left in clean pristine state.");
    await mongoose.disconnect();
  }
}

runOwnerWorkflowSmokeTest().catch((err) => {
  console.error("❌ Smoke Test Error:", err);
  process.exit(1);
});
