import mongoose from "mongoose";
import dns from "dns";
import User from "../models/user.js";
import bcryptjs from "bcryptjs";

// Force Google Public DNS to bypass local DNS filtering of MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async (retries = 5) => {
  if (mongoose.connection.readyState >= 1) {
    console.log("🟢 MongoDB Connection already active");
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        tls: true,
        tlsAllowInvalidCertificates: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
      });
      console.log("🟢 MongoDB Connected");
      
      // Seed default accounts if collection is empty
      const count = await User.countDocuments();
      if (count === 0) {
        console.log("⏳ User collection is empty. Seeding default accounts...");
        const hashedDefaultPassword = await bcryptjs.hash("123456", 10);
        await User.insertMany([
          {
            name: "Admin User",
            email: "admin@gmail.com",
            password: hashedDefaultPassword,
            role: "admin"
          },
          {
            name: "Client User",
            email: "client@gmail.com",
            password: hashedDefaultPassword,
            role: "client"
          },
          {
            name: "Staff Operator",
            email: "user@gmail.com",
            password: hashedDefaultPassword,
            role: "user"
          }
        ]);
        console.log("🟢 Default accounts seeded successfully.");
      }
      
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