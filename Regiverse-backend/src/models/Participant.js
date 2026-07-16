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

    printLogs: {
      type: [
        {
          timestamp: { type: Date, default: Date.now },
          staffMember: { type: String, default: "" }
        }
      ],
      default: []
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

    // ADDED: Tracks dynamic meal scans (e.g., {"day1-lunch": true, "day2-dinner": true})
    foodLogs: {
      type: Map,
      of: Boolean,
      default: {},
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

    hallExits: {
      type: [Date],
      default: [],
    },

    checkInTime: {
      type: Date,
    },

    kitbagCollectedTime: {
      type: Date,
    },

    certificateGivenTime: {
      type: Date,
    },

    foodScanTimes: {
      type: Map,
      of: Date,
      default: {},
    },

    workshopScanTimes: {
      type: Map,
      of: Date,
      default: {},
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

// Performance Indexes for faster roster lookup and dashboard aggregation
participantSchema.index({ conferenceId: 1 });
participantSchema.index({ conferenceName: 1 });
participantSchema.index({ regId: 1 });
participantSchema.index({ phone: 1 });
participantSchema.index({ email: 1 });
participantSchema.index({ qrCode: 1 });
participantSchema.index({ name: 1 });

// Auto-generate regId and qrCode on save if not provided
participantSchema.pre("save", function () {
  if (!this.regId || this.regId.trim() === "") {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let alphaPart = "";
    let numPart = "";
    for (let j = 0; j < 4; j++) {
      alphaPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let k = 0; k < 3; k++) {
      numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    this.regId = `ID - ${alphaPart}${numPart}`;
  }

  if (!this.qrCode || this.qrCode.trim() === "") {
    this.qrCode = `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
});

const Participant =
  mongoose.models.Participant ||
  mongoose.model("Participant", participantSchema);

export default Participant;

