const mongoose = require('mongoose');

// Global cache for serverless environments
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in the environment variables!");
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Fails fast if unable to reach database
        family: 4 // Force IPv4 to avoid IPv6 routing issues on certain environments like Vercel/Node
      }).then((mongoose) => {
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        console.log(`Database: ${mongoose.connection.name}`);
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise so next attempt can retry
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
