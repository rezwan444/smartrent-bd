import mongoose from "mongoose";
import { getEnv } from "./env.ts";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const CONNECTION_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

/**
 * Connects to MongoDB Atlas using Mongoose with connection caching.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const env = getEnv();
    const uri = env.MONGODB_URI;

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    // Safely rethrow without revealing URI or credentials
    const safeErrorMessage =
      error instanceof Error ? error.message : "Failed to connect to MongoDB";
    console.error("[MongoDB Connection Error]:", safeErrorMessage);
    throw new Error(`Database connection failed: ${safeErrorMessage}`);
  }

  return cached.conn;
}

export interface DatabaseHealth {
  isConnected: boolean;
  state: string;
  host?: string;
  name?: string;
  latencyMs?: number;
}

/**
 * Safely inspects MongoDB connectivity without leaking connection string.
 */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now();
  try {
    const conn = await connectToDatabase();
    const stateCode = conn.connection.readyState;
    const isConnected = stateCode === 1;

    // Run a quick ping to measure round-trip latency
    if (isConnected && conn.connection.db) {
      await conn.connection.db.admin().ping();
    }
    const latencyMs = Date.now() - startTime;

    return {
      isConnected,
      state: CONNECTION_STATES[stateCode] || "unknown",
      host: conn.connection.host || undefined,
      name: conn.connection.name || undefined,
      latencyMs,
    };
  } catch {
    const stateCode = mongoose.connection.readyState;
    return {
      isConnected: false,
      state: CONNECTION_STATES[stateCode] || "disconnected",
      latencyMs: Date.now() - startTime,
    };
  }
}
