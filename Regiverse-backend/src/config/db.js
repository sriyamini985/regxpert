import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => {
    console.error("🔴 MongoDB Connection Failed:");
    console.error(err.message);
  });

mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected event fired");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ Mongoose runtime error:", err);
});

export default connectDB;