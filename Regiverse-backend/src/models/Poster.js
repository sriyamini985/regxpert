import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    posterNumber: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    presenterName: {
      type: String,
      required: true,
      trim: true,
    },
    coPresenters: {
      type: String,
      default: "",
      trim: true,
    },
    institution: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    conferenceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize search queries
posterSchema.index({ conferenceId: 1 });
posterSchema.index({ posterNumber: 1 });
posterSchema.index({ title: 1 });
posterSchema.index({ presenterName: 1 });
posterSchema.index({ institution: 1 });

const Poster = mongoose.models.Poster || mongoose.model("Poster", posterSchema);

export default Poster;
