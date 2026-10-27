import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is missing.");
  process.exit(1);
}

const USERS_TO_SEED = [
  {
    email: "student@smartrentbd.com",
    password: "student123",
    fullName: "Rayhan Ahmed",
    role: "STUDENT",
    phone: "+880 1712-345678",
    location: "Dhanmondi, Dhaka",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
    isVerified: true,
    nidVerified: false,
    dashboardPath: "/dashboard/student",
  },
  {
    email: "owner@smartrentbd.com",
    password: "owner123",
    fullName: "Kabir Hossain",
    role: "OWNER",
    phone: "+880 1812-987654",
    location: "Mirpur 2, Dhaka",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=owner",
    isVerified: true,
    nidVerified: true,
    dashboardPath: "/dashboard/owner",
  },
  {
    email: "admin@smartrentbd.com",
    password: "admin123",
    fullName: "Admin Moderator",
    role: "ADMIN",
    phone: "+880 1700-000000",
    location: "Dhaka, Bangladesh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    isVerified: true,
    nidVerified: true,
    dashboardPath: "/dashboard/admin",
  },
  {
    email: "superadmin@smartrentbd.com",
    password: "superadmin123",
    fullName: "Super Admin Master",
    role: "SUPER_ADMIN",
    phone: "+880 1700-111222",
    location: "Dhaka, Bangladesh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
    isVerified: true,
    nidVerified: true,
    dashboardPath: "/dashboard/admin",
  },
  {
    email: "staff@smartrentbd.com",
    password: "staff123",
    fullName: "Staff Support",
    role: "STAFF",
    phone: "+880 1700-333444",
    location: "Bogura, Bangladesh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
    isVerified: true,
    nidVerified: true,
    dashboardPath: "/dashboard/admin",
  },
];

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas.\n");

    const usersCollection = mongoose.connection.collection("users");

    for (const userData of USERS_TO_SEED) {
      const normalizedEmail = userData.email.toLowerCase().trim();
      const existing = await usersCollection.findOne({ email: normalizedEmail });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      if (existing) {
        await usersCollection.updateOne(
          { _id: existing._id },
          {
            $set: {
              fullName: userData.fullName,
              role: userData.role,
              password: hashedPassword,
              phone: userData.phone,
              location: userData.location,
              avatar: userData.avatar,
              isVerified: userData.isVerified,
              nidVerified: userData.nidVerified,
              isDemoUser: false,
              tokenVersion: (existing.tokenVersion || 0) + 1,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`✅ Updated existing user: [${userData.role}] ${normalizedEmail}`);
      } else {
        await usersCollection.insertOne({
          email: normalizedEmail,
          password: hashedPassword,
          fullName: userData.fullName,
          role: userData.role,
          phone: userData.phone,
          location: userData.location,
          avatar: userData.avatar,
          isVerified: userData.isVerified,
          nidVerified: userData.nidVerified,
          isDemoUser: false,
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Created new user: [${userData.role}] ${normalizedEmail}`);
      }
    }

    console.log("\n========================================================");
    console.log(" 🎉 ALL ROLES SEEDED SUCCESSFULLY IN MONGODB ATLAS 🎉");
    console.log("========================================================");
    for (const u of USERS_TO_SEED) {
      console.log(`👉 Role: ${u.role.padEnd(12)} | Email: ${u.email.padEnd(26)} | Password: ${u.password.padEnd(14)} | Target: ${u.dashboardPath}`);
    }
    console.log("========================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

run();
