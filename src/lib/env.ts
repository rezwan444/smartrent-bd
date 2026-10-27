import { z } from "zod";

/**
 * Environment Variables Schema
 * Validates required configuration at runtime without leaking secrets.
 */
const envSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .startsWith("mongodb", "MONGODB_URI must be a valid mongodb connection string"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters long"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

/**
 * Retrieves validated environment variables.
 * Caches validated config for performance.
 */
export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const isTest = process.env.NODE_ENV === "test" || !process.env.MONGODB_URI;

  const result = envSchema.safeParse({
    MONGODB_URI:
      process.env.MONGODB_URI ||
      (isTest ? "mongodb://localhost:27017/smartrent_bd_test" : undefined),
    AUTH_SECRET:
      process.env.AUTH_SECRET ||
      (isTest ? "test-secret-key-at-least-16-chars-for-unit-testing" : undefined),
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    // Collect error keys only, never log secret values
    const missingOrInvalid = result.error.issues.map((issue) => issue.path.join("."));
    const message = `[Env Config Error] Invalid environment variables: ${missingOrInvalid.join(", ")}`;
    console.error(message);
    throw new Error(message);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
