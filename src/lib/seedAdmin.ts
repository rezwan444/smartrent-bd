import { connectToDatabase } from "./mongodb.ts";
import { User } from "../models/User.ts";
import bcrypt from "bcryptjs";

export interface AdminSeedResult {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
  error?: string;
}

/**
 * Safely seeds the initial administrator account into MongoDB Atlas.
 * If the user already exists, it verifies and guarantees their ADMIN role.
 */
export async function seedAdminUser(overridePassword?: string): Promise<AdminSeedResult> {
  try {
    await connectToDatabase();

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@smartrentbd.com").toLowerCase().trim();
    const adminPassword = overridePassword || process.env.ADMIN_PASSWORD || "admin123";

    let admin = await User.findOne({ email: adminEmail }).select("+password");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (admin) {
      admin.role = "ADMIN";
      admin.isVerified = true;
      admin.nidVerified = true;
      admin.fullName = admin.fullName || "Admin Moderator";
      admin.password = hashedPassword;
      await admin.save();

      return {
        success: true,
        message: `Admin user updated successfully (${adminEmail}).`,
        admin: {
          id: String(admin._id),
          email: admin.email,
          role: admin.role,
          fullName: admin.fullName,
        },
      };
    }

    admin = await User.create({
      email: adminEmail,
      fullName: "Admin Moderator",
      role: "ADMIN",
      password: hashedPassword,
      phone: "+880 1700-000000",
      isVerified: true,
      nidVerified: true,
      location: "Dhaka, Bangladesh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      isDemoUser: false,
    });

    return {
      success: true,
      message: `Admin user created successfully (${adminEmail}).`,
      admin: {
        id: String(admin._id),
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to seed admin user";
    return {
      success: false,
      message: errorMsg,
      error: errorMsg,
    };
  }
}
