import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { getIO } from "../socket.js";
import xlsx from "xlsx";
import mongoose from "mongoose";


// src/controllers/dashboardController.js

export const getDashboardStats = async (req, res) => {
  try {
    const { conferenceId } = req.query;
    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conferenceId parameter" });
    }
    const cleanConferenceId = String(conferenceId).trim();
    
    // Resolve conference details (slug, name, or ObjectId)
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConferenceId) ? cleanConferenceId : undefined },
        { slug: cleanConferenceId },
        { name: cleanConferenceId }
      ].filter(Boolean)
    });
    
    const finalConferenceId = targetConference ? String(targetConference._id) : cleanConferenceId;

    // Run parallel count optimizations using indexes
    const [
      total,
      checkedIn,
      printed,
      kitbagCollected,
      certificateGiven,
      hallEntriesCount,
      hallExitsCount,
      workshopScansCount,
      foodLogsGrouped
    ] = await Promise.all([
      Participant.countDocuments({ conferenceId: finalConferenceId }),
      Participant.countDocuments({ conferenceId: finalConferenceId, isCheckedIn: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, printed: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, kitbagCollected: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, certificateGiven: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, "hallEntries.0": { $exists: true } }),
      Participant.countDocuments({ conferenceId: finalConferenceId, "hallExits.0": { $exists: true } }),
      Participant.countDocuments({ conferenceId: finalConferenceId, "workshopScans.0": { $exists: true } }),
      Participant.aggregate([
        { $match: { conferenceId: finalConferenceId } },
        { $project: { foodLogsArray: { $objectToArray: "$foodLogs" } } },
        { $unwind: "$foodLogsArray" },
        { $match: { "foodLogsArray.v": true } },
        { $group: { _id: "$foodLogsArray.k", count: { $sum: 1 } } }
      ])
    ]);

    // Construct day-specific meal stats
    const food = {};
    for (let d = 1; d <= 5; d++) {
      food[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
    }
    
    foodLogsGrouped.forEach(item => {
      if (item._id) {
        const [dayPart, mealPart] = item._id.split("-");
        if (food[dayPart] && mealPart) {
          food[dayPart][mealPart] = item.count;
        }
      }
    });

    return res.json({
      success: true,
      stats: {
        total,
        checkedIn,
        printed,
        kitbagCollected,
        certificateGiven,
        hallEntriesCount,
        hallExitsCount,
        workshopScansCount,
        food
      }
    });
  } catch (error) {
    console.error("Dashboard stats aggregation error:", error);
    return res.status(500).json({ error: error.message });
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