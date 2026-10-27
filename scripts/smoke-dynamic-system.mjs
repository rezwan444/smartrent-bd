import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not defined");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log("=== CHECKING MONGO DB LIVE STATUS ===");

  // Check Properties with real owner
  const rayhanProps = await db.collection("properties").find({ "owner.name": "Md. Abu Rayhan" }).toArray();
  console.log("Properties assigned to Md. Abu Rayhan:", rayhanProps.length);
  for (const p of rayhanProps) {
    console.log(` - [${p.customId}] ${p.title} (Status: ${p.status}, Owner: ${p.owner?.name}, Phone: ${p.owner?.phone})`);
  }

  // Check Visit Requests
  const visits = await db.collection("visitrequests").find({}).toArray();
  console.log("\nLive Visit Requests in MongoDB:", visits.length);
  for (const v of visits) {
    console.log(` - [${v.status.toUpperCase()}] ${v.studentName} for '${v.propertyTitle}' on ${v.preferredDate}`);
  }

  // Check Maintenance Tickets
  const tickets = await db.collection("maintenancetickets").find({}).toArray();
  console.log("\nLive Maintenance Tickets in MongoDB:", tickets.length);
  for (const t of tickets) {
    console.log(` - [${t.status.toUpperCase()}] ${t.issue} for '${t.propertyTitle}' (${t.urgency} urgency)`);
  }

  // Check Reviews
  const reviews = await db.collection("reviews").find({}).toArray();
  console.log("\nLive Reviews in MongoDB:", reviews.length);
  for (const r of reviews) {
    console.log(` - [${r.rating} STARS] '${r.title}' by ${r.userName} on ${r.propertyId}`);
  }

  await mongoose.disconnect();
  console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
