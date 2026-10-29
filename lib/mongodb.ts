import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;

  // Reset cache if connection drops
  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Connection disconnected. Resetting connection cache.");
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error event:", err);
    cached.conn = null;
    cached.promise = null;
  });
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI is not defined in environment variables. MongoDB backup will be bypassed.");
    return null;
  }

  // If already connected and readyState is 1 (connected), return the active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If readyState is disconnected (0) or disconnecting (3), reset cached promise to allow fresh connection
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[MongoDB] Successfully connected to database: "${m.connection.name}"`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error("[MongoDB] Connection attempt failed:", e);
    return null;
  }
}

export async function getMongoDb() {
  const conn = await connectToDatabase();
  if (!conn || !mongoose.connection.db) return null;
  return mongoose.connection.db;
}
