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
      
      // Seed/Ensure default accounts exist with fixed credentials
      console.log("⏳ Checking and ensuring default roles exist...");
      const adminPasswordHashed = await bcryptjs.hash("cmc@2026", 10);
      const staffPasswordHashed = await bcryptjs.hash("regxpertstaff@2026", 10);
      const clientPasswordHashed = await bcryptjs.hash("123456", 10);

      // Upsert admin user
      await User.findOneAndUpdate(
        { role: "admin" },
        {
          name: "Admin User",
          email: "harshachinnu637@gmail.com",
          password: adminPasswordHashed
        },
        { upsert: true, returnDocument: "after" }
      );

      // Upsert staff user
      await User.findOneAndUpdate(
        { role: "user" },
        {
          name: "Staff Operator",
          email: "staff@gmail.com",
          password: staffPasswordHashed
        },
        { upsert: true, returnDocument: "after" }
      );

      // Seed client if not exists
      const clientExists = await User.findOne({ role: "client" });
      if (!clientExists) {
        await User.create({
          name: "Client User",
          email: "client@gmail.com",
          password: clientPasswordHashed,
          role: "client"
        });
      }
      console.log("🟢 Default accounts verified and updated.");
      
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