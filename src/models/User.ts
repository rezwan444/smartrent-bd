import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../types/backend.ts";

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  nidVerified: boolean;
  nidNumber?: string;
  holdingTaxNumber?: string;
  nidPropertyLocation?: string;
  nidStatus?: "unverified" | "pending" | "verified" | "rejected";
  nidSubmittedAt?: Date;
  nidReviewedAt?: Date;
  nidReviewedBy?: mongoose.Types.ObjectId;
  nidAdminNotes?: string;
  avatar?: string;
  location?: string;
  isDemoUser: boolean;
  tokenVersion: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordOtp?: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Record<string, unknown>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Do not return password by default in queries
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["STUDENT", "OWNER", "ADMIN", "SUPER_ADMIN", "STAFF"],
      default: "STUDENT",
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    nidNumber: { type: String, trim: true },
    holdingTaxNumber: { type: String, trim: true },
    nidPropertyLocation: { type: String, trim: true },
    nidStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    nidSubmittedAt: { type: Date },
    nidReviewedAt: { type: Date },
    nidReviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    nidAdminNotes: { type: String, trim: true },
    nidVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Dhaka, Bangladesh",
    },
    isDemoUser: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
    },
    resetPasswordOtp: {
      type: String,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe serialization (strips password and __v)
UserSchema.methods.toSafeObject = function (): Record<string, unknown> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.resetPasswordOtp;
  delete obj.refreshTokenHash;
  delete obj.__v;
  return obj;
};

// In development, delete cached model to allow schema hot reload
if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  delete (mongoose.models as Record<string, unknown>).User;
}

export const User: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>("User", UserSchema);

export default User;
