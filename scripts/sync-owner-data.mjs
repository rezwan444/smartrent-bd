import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const rayhan = await db.collection("users").findOne({ email: "aburayhan.bpi@gmail.com" });
  const kabir = await db.collection("users").findOne({ email: "owner@smartrentbd.com" });
  const student = await db.collection("users").findOne({ role: "STUDENT" });

  console.log("Found Rayhan:", rayhan ? rayhan._id : "NOT FOUND");
  console.log("Found Kabir:", kabir ? kabir._id : "NOT FOUND");

  const rayhanOwnerId = rayhan ? rayhan._id : null;
  const kabirOwnerId = kabir ? kabir._id : null;

  // 1. Assign properties to Rayhan and Kabir
  if (rayhanOwnerId) {
    const rayhanProps = ["prop-01", "prop-02", "prop-04", "prop-08", "prop-11", "prop-12"];
    await db.collection("properties").updateMany(
      { customId: { $in: rayhanProps } },
      {
        $set: {
          ownerId: rayhanOwnerId,
          "owner.name": rayhan.fullName || "Md. Abu Rayhan",
          "owner.phone": rayhan.phone || "+880 1712-345678",
          "owner.role": "Landlord",
          "owner.isVerified": true,
          "owner.memberSince": "Jan 2024",
          "owner.responseTime": "Within 30 mins",
          status: "verified",
          isVerified: true,
          isHiddenFromSearch: false,
        },
      }
    );
    console.log("Assigned properties to Md. Abu Rayhan:", rayhanProps);
  }

  if (kabirOwnerId) {
    const kabirProps = ["prop-03", "prop-05", "prop-06", "prop-07", "prop-09", "prop-10"];
    await db.collection("properties").updateMany(
      { customId: { $in: kabirProps } },
      {
        $set: {
          ownerId: kabirOwnerId,
          "owner.name": kabir.fullName || "Kabir Hossain",
          "owner.phone": kabir.phone || "+880 1812-987654",
          "owner.role": "Landlord",
          "owner.isVerified": true,
          "owner.memberSince": "Mar 2024",
          "owner.responseTime": "Within 1 hour",
        },
      }
    );
    console.log("Assigned properties to Kabir Hossain:", kabirProps);
  }

  // 2. Clear old test visit requests and seed real ones
  await db.collection("visitrequests").deleteMany({});
  const initialVisits = [
    {
      propertyId: "prop-01",
      propertyTitle: "Furnished single room near East West University",
      propertyAddress: "Block C, Banasree, Dhaka",
      studentId: student ? student._id : null,
      studentName: student ? student.fullName : "Tanvir Hasan",
      studentEmail: student ? student.email : "tanvir.hasan@du.ac.bd",
      institution: "Dhaka University (Dept of CSE)",
      ownerId: rayhanOwnerId || kabirOwnerId,
      preferredDate: "Tomorrow, 4:00 PM",
      timeSlot: "Afternoon (2:00 PM - 5:00 PM)",
      contactPhone: "+880 1711-223344",
      visitorCount: "1",
      notes: "Looking forward to inspecting the attached balcony and reading room.",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      propertyId: "prop-08",
      propertyTitle: "Executive student hostel seat near NSU Gate 8",
      propertyAddress: "Bashundhara R/A, Block C, Dhaka",
      studentId: student ? student._id : null,
      studentName: "Sajjad Ali",
      studentEmail: "sajjad.ali@northsouth.edu",
      institution: "North South University",
      ownerId: rayhanOwnerId || kabirOwnerId,
      preferredDate: "Saturday, 11:30 AM",
      timeSlot: "Morning (9:00 AM - 12:00 PM)",
      contactPhone: "+880 1819-556677",
      visitorCount: "2",
      notes: "Visiting with parent for academic year accommodation.",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      propertyId: "prop-02",
      propertyTitle: "Two-bedroom residential flat near Mirpur-10 Metro",
      propertyAddress: "Mirpur Section 10, Dhaka",
      studentId: student ? student._id : null,
      studentName: "Farhan Ahmed",
      studentEmail: "farhan.ahmed@buet.ac.bd",
      institution: "BUET (EEE Dept)",
      ownerId: rayhanOwnerId || kabirOwnerId,
      preferredDate: "Monday, 5:00 PM",
      timeSlot: "Evening (5:00 PM - 7:00 PM)",
      contactPhone: "+880 1912-887766",
      visitorCount: "3",
      notes: "Bachelor study group flat share inquiry.",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("visitrequests").insertMany(initialVisits);
  console.log("Seeded live visit requests in MongoDB:", initialVisits.length);

  // 3. Clear old test maintenance tickets and seed real ones
  await db.collection("maintenancetickets").deleteMany({});
  const initialTickets = [
    {
      propertyId: "prop-01",
      propertyTitle: "Furnished single room near East West University",
      tenantId: student ? student._id : null,
      tenantName: student ? student.fullName : "Tanvir Hasan",
      tenantPhone: "+880 1711-223344",
      ownerId: rayhanOwnerId || kabirOwnerId,
      issue: "Kitchen Gas Regulator & Hose Inspection",
      description: "Low gas pressure observed in evening. Requires technician inspection.",
      category: "appliance",
      urgency: "High",
      status: "in_progress",
      technicianNotes: "DESCO technician scheduled for 3 PM tomorrow.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      propertyId: "prop-04",
      propertyTitle: "Master bedroom with attached bath & private balcony",
      tenantId: student ? student._id : null,
      tenantName: "Nafis Imtiaz",
      tenantPhone: "+880 1622-334455",
      ownerId: rayhanOwnerId || kabirOwnerId,
      issue: "Attached Bathroom Water Heater / Geyser Servicing",
      description: "Geyser tripping circuit breaker upon switching on.",
      category: "electrical",
      urgency: "Medium",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("maintenancetickets").insertMany(initialTickets);
  console.log("Seeded live maintenance tickets in MongoDB:", initialTickets.length);

  // 4. Seed Reviews in MongoDB
  await db.collection("reviews").deleteMany({});
  const initialReviews = [
    {
      propertyId: "prop-01",
      userId: student ? student._id : null,
      userName: student ? student.fullName : "Tanvir Hasan",
      userAvatar: student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      userRole: "Current Student Tenant",
      rating: 5,
      title: "Best student accommodation near East West University",
      comment: "Lived here for 8 months. Very peaceful study atmosphere, high-speed WiFi never drops, and landlord is extremely responsive to maintenance requests.",
      subRatings: {
        cleanliness: 5,
        landlordBehavior: 5,
        safety: 5,
        facilities: 5,
      },
      isVerifiedTenant: true,
      tenancyStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      propertyId: "prop-08",
      userId: student ? student._id : null,
      userName: "Rafid Karim",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      userRole: "Verified NSU Student",
      rating: 5,
      title: "Extremely convenient location right beside NSU Gate 8",
      comment: "Zero commute to campus, backup generator works immediately during load shedding, and security guards are very alert 24/7.",
      subRatings: {
        cleanliness: 5,
        landlordBehavior: 4,
        safety: 5,
        facilities: 5,
      },
      isVerifiedTenant: true,
      tenancyStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("reviews").insertMany(initialReviews);
  console.log("Seeded live reviews in MongoDB:", initialReviews.length);

  await mongoose.disconnect();
  console.log("Database synchronization complete!");
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
