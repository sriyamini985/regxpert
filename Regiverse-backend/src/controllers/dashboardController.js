import Participant from "../models/Participant.js";
import { getIO } from "../socket.js";
import xlsx from "xlsx";


// src/controllers/dashboardController.js

export const getDashboardStats = async (req, res) => {
  try {
    // Your database logic here (e.g., counting participants, active conferences)
    res.json({ success: true, msg: "Stats fetched" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    // 1. Check if Multer successfully caught the file
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file was received by the server." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing workspace/conference ID." });
    }

    const cleanConferenceId = String(conferenceId).trim();

    // 2. Read the Excel file directly from memory buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, msg: "The uploaded sheet is empty." });
    }

    // 3. Map the rows to match your database schema.
    // This allows "any data" by looking for multiple possible column headers (e.g., Name, name, NAME)
    const processedParticipants = rawRows.map((row) => ({
      name: row.Name || row.name || row.NAME || "Unknown Delegate",
      email: row.Email || row.email || row.EMAIL || "",
      company: row.Company || row.company || row.COMPANY || "",
      phone: String(row.Phone || row.phone || row.PHONE || ""),
      regId: String(row.RegId || row.regId || row.id || ""),
      qrCode: String(row.QrCode || row.qrcode || row.RegId || row.regId || ""),
      
      // Default Event States
      status: "pending",
      conferenceId: cleanConferenceId,
      isCheckedIn: false,
      isBadgePrinted: false,
      kitbagCollected: false,
      certificateGiven: false,
      foodLogs: {}
    }));

    // 4. Save to MongoDB
    const insertedRecords = await Participant.insertMany(processedParticipants);

    // 5. Notify the frontend dashboard to update its charts instantly
    getIO().to(cleanConferenceId).emit("conferenceDataUpdated", { conferenceId: cleanConferenceId });

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      msg: "Data imported successfully!" 
    });

  } catch (err) {
    console.error("EXCEL IMPORT CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};