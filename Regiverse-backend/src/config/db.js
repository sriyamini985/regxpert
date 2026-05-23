import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 MongoDB Connected");
  } catch (err) {
    console.error("🔴 MongoDB Connection Failed:", err);
  }
};

export default connectDB;