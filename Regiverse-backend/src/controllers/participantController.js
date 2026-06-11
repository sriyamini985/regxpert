import Participant from "../models/Participant.js";
import { getIO } from "../socket.js";
import xlsx from "xlsx"; // Added standard parsing fallback for your import endpoint

// 1. BULK EXCEL IMPORT CONTROLLER (Fixes the 500 Error)
export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conference identifier context." });
    }

    // Force string identifier representation to match "meta2026" safely
    const cleanConferenceId = String(conferenceId).trim();

    // Parse the uploaded excel sheet buffer directly from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, msg: "The uploaded sheet is empty." });
    }

    // Map rows cleanly to fit your schema profile fields
    const processedParticipants = rawRows.map((row) => ({
      name: row.Name || row.name || "Unknown Delegate",
      email: row.Email || row.email || "",
      company: row.Company || row.company || "",
      phone: String(row.Phone || row.phone || ""),
      regId: String(row.RegId || row.regId || row.id || ""),
      qrCode: String(row.QrCode || row.qrcode || row.RegId || row.regId || ""),
      status: "pending",
      conferenceId: cleanConferenceId, // Explicitly strings matched to target workspace channel
      isCheckedIn: false,
      isBadgePrinted: false,
      kitbagCollected: false,
      certificateGiven: false,
      foodLogs: {}
    }));

    // Save batch items directly to MongoDB
    const insertedRecords = await Participant.insertMany(processedParticipants);

    // Alert the workspace dashboard sockets that a bulk load completed
    getIO().to(cleanConferenceId).emit("conferenceDataUpdated", { conferenceId: cleanConferenceId });

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      msg: "Roster imported successfully." 
    });

  } catch (err) {
    console.error("EXCEL IMPORT RUNTIME CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. CREATE PARTICIPANT
export const createParticipant = async (req, res) => {
  try {
    const participant = await Participant.create(req.body);
    
    if (participant.conferenceId) {
      const roomKey = String(participant.conferenceId);
      getIO().to(roomKey).emit("participantCreated", participant);
    }

    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. BASIC SCAN (General check-in)
export const scanQR = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await Participant.findOne({
      $or: [{ phone: identifier }, { qrCode: identifier }, { regId: identifier }]
    });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    user.isCheckedIn = true;
    await user.save();
    
    const roomKey = String(user.conferenceId);
    getIO().to(roomKey).emit("participantUpdated", user);
    getIO().to(roomKey).emit("conferenceDataUpdated", { conferenceId: roomKey });
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. VERIFY AND SCAN (Restricted items: Kitbag/Certificate)
export const verifyAndScan = async (req, res) => {
  try {
    const { identifier, scanType } = req.body;

    const user = await Participant.findOne({
      $or: [{ phone: identifier }, { qrCode: identifier }, { regId: identifier }, { name: identifier }]
    });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    const blockKey = `block${scanType.charAt(0).toUpperCase() + scanType.slice(1)}`;
    if (user[blockKey] === true) {
      return res.status(403).json({ 
        msg: `Access Denied: ${scanType} is restricted.`,
        blocked: true 
      });
    }

    if (scanType === "kitbag") user.kitbagCollected = true;
    if (scanType === "certificate") user.certificateGiven = true;

    await user.save();
    
    const roomKey = String(user.conferenceId);
    getIO().to(roomKey).emit("participantUpdated", user);
    getIO().to(roomKey).emit("conferenceDataUpdated", { conferenceId: roomKey });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. FOOD SCAN (Day-specific meals)
export const scanFood = async (req, res) => {
  try {
    const { qrCode, mealType } = req.body; 
    const user = await Participant.findOne({ qrCode });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    if (!user.foodLogs) user.foodLogs = {};
    user.set(`foodLogs.${mealType}`, true); 
    
    await user.save();

    const roomKey = String(user.conferenceId);
    getIO().to(roomKey).emit("participantUpdated", user);
    getIO().to(roomKey).emit("conferenceDataUpdated", { conferenceId: roomKey });

    res.json({ success: true, message: "Food logged successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};