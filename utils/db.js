import mongoose from "mongoose";
import dotenv from "dotenv";

mongoose.set("bufferCommands", false);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("✅ MongoDB connected");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false, // VERY IMPORTANT
    });
  }

  cached.conn = await cached.promise;
  
  return cached.conn;
  
}
