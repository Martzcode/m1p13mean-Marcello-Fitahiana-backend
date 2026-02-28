const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in the environment variables!");
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fails fast if unable to reach database
      family: 4 // Force IPv4 to avoid IPv6 routing issues on certain environments like Vercel/Node
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Rethrow or exit, but since it's serverless it's better to just log it so other requests can retry
  }
};

module.exports = connectDB;
