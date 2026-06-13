import mongoose from "mongoose";
import dns from "dns";

// Force Google Public DNS to bypass local DNS filtering of MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async (retries = 5) => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      console.log("🟢 MongoDB Connected");
      return;
    } catch (err) {
      console.error(`🔴 MongoDB attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt < retries) {
        const delay = attempt * 3000;
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  console.error("🔴 MongoDB Connection Failed after all retries. Server will run without DB.");
};

export default connectDB;