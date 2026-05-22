import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC DETAILS
    ========================= */

    regId: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    reference: {
      type: String,
      default: "",
    },

    medicalCouncilNumber: {
      type: String,
      default: "",
    },
    conferenceId: {
      type: String,
      default: "",
    },
    conferenceName: {
      type: String,
      default: "",
    },
        printed: {
      type: Boolean,
      default: false,
    },

    /* =========================
       PRINT
    ========================= */

    printType: {
      type: String,
      enum: ["qr", "name"],
      default: "name",
    },

    qrCode: {
      type: String,
      default: "",
    },

    /* =========================
       SCANNING
    ========================= */

    isCheckedIn: {
      type: Boolean,
      default: false,
    },

    foodScanned: {
      type: Boolean,
      default: false,
    },

    kitbagCollected: {
      type: Boolean,
      default: false,
    },

    certificateGiven: {
      type: Boolean,
      default: false,
    },

    workshopScans: {
      type: [String],
      default: [],
    },

    hallEntries: {
      type: [Date],
      default: [],
    },

    /* =========================
       BLOCK ACCESS
    ========================= */

    blockKitbag: {
      type: Boolean,
      default: false,
    },

    blockCertificate: {
      type: Boolean,
      default: false,
    },

    blockDay1Breakfast: {
      type: Boolean,
      default: false,
    },

    blockDay1Lunch: {
      type: Boolean,
      default: false,
    },

    blockDay1Dinner: {
      type: Boolean,
      default: false,
    },

    blockDay2Breakfast: {
      type: Boolean,
      default: false,
    },

    blockDay2Lunch: {
      type: Boolean,
      default: false,
    },

    blockDay2Dinner: {
      type: Boolean,
      default: false,
    },

    blockDay3Breakfast: {
      type: Boolean,
      default: false,
    },

    blockDay3Lunch: {
      type: Boolean,
      default: false,
    },

    blockDay3Dinner: {
      type: Boolean,
      default: false,
    },

    blockDay4Breakfast: {
      type: Boolean,
      default: false,
    },

    blockDay4Lunch: {
      type: Boolean,
      default: false,
    },

    blockDay4Dinner: {
      type: Boolean,
      default: false,
    },

    blockDay5Breakfast: {
      type: Boolean,
      default: false,
    },

    blockDay5Lunch: {
      type: Boolean,
      default: false,
    },

    blockDay5Dinner: {
      type: Boolean,
      default: false,
    },

    blockWorkshop1: {
      type: Boolean,
      default: false,
    },

    blockWorkshop2: {
      type: Boolean,
      default: false,
    },

    blockWorkshop3: {
      type: Boolean,
      default: false,
    },

    blockWorkshop4: {
      type: Boolean,
      default: false,
    },

    blockWorkshop5: {
      type: Boolean,
      default: false,
    },

    /* =========================
       STORE FULL EXCEL/CSV DATA
    ========================= */

    dynamicData: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Participant =
  mongoose.models.Participant ||
  mongoose.model(
    "Participant",
    participantSchema
  );
export default mongoose.model("Participant", participantSchema);
export default Participant;