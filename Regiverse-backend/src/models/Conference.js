import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Conference =
  mongoose.models.Conference ||
  mongoose.model(
    "Conference",
    conferenceSchema
  );

export default Conference;