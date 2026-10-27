import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@smartrentbd.com").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is missing.");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas.");

    const usersCollection = mongoose.connection.collection("users");
    const existing = await usersCollection.findOne({ email: ADMIN_EMAIL });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    if (existing) {
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            role: "ADMIN",
            isVerified: true,
            nidVerified: true,
            password: hashedPassword,
            tokenVersion: (existing.tokenVersion || 0) + 1,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Admin account updated successfully: ${ADMIN_EMAIL}`);
    } else {
      await usersCollection.insertOne({
        email: ADMIN_EMAIL,
        fullName: "Admin Moderator",
        role: "ADMIN",
        password: hashedPassword,
        phone: "+880 1700-000000",
        isVerified: true,
        nidVerified: true,
        location: "Dhaka, Bangladesh",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        isDemoUser: false,
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Admin account created successfully: ${ADMIN_EMAIL}`);
    }

    console.log(`\n📋 Login Credentials:`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ADMIN`);
    console.log(`   Dashboard: /dashboard/admin\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

run();
