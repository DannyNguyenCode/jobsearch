import mongoose from "mongoose";

const MONGODB_DB = process.env.MONGODB_DB ?? "jobtrackerhub";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cache;

export async function dbConnect() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { dbName: MONGODB_DB });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export function resetDbCache() {
  cache.conn = null;
  cache.promise = null;
}

export async function pingMongoAtlas() {
  const conn = await dbConnect();
  if (conn.connection.readyState !== 1) {
    throw new Error("MongoDB Atlas is not connected.");
  }
  const ping = await conn.connection.db?.admin().command({ ping: 1 });
  if (!ping || ping.ok !== 1) {
    throw new Error("MongoDB Atlas ping failed.");
  }
  return { ok: true as const, database: conn.connection.name || MONGODB_DB };
}
