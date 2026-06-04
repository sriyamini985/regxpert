import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // Add this!
  },
  { timestamps: true }
);

export default mongoose.model("Conference", conferenceSchema);