import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false }, // Tracks workspace deployment status
    bannerImage: { type: String }, // Stored as base64 string
    totalDays: { type: Number, default: 5 }, // Configurable event days (e.g., 5 or 9)
    startDate: { type: Date },
    currentDay: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Gracefully handles remounts in development mode
const Conference = mongoose.models.Conference || mongoose.model("Conference", conferenceSchema);

export default Conference;