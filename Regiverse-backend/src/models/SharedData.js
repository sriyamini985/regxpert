import mongoose from "mongoose";

const sharedDataSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: String,
      required: true,
    },

    createdBy: {
      type: String,
      enum: ["admin", "client"],
      required: true,
    },

    uploadedBy: {
      type: String,
      default: "",
    },

    data: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "SharedData",
  sharedDataSchema
);