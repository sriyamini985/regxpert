import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js"; // <-- Make sure this model is imported!
import { getIO } from "../socket.js";
import xlsx from "xlsx";
import mongoose from "mongoose";

export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conference identifier context." });
    }

    const cleanConferenceId = String(conferenceId).trim();

    // 1. SMART RESOLUTION: Find the actual conference row using either the slug or the Object ID
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConferenceId) ? cleanConferenceId : undefined },
        { slug: cleanConferenceId },
        { name: cleanConferenceId }
      ].filter(Boolean)
    });

    // Fall back to whatever was provided if the database profile lookup fails
    const finalConferenceId = targetConference ? String(targetConference._id) : cleanConferenceId;
    const finalConferenceName = targetConference ? (targetConference.name || targetConference.title) : "";

    // 2. Read sheet buffer from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, msg: "The uploaded sheet is empty." });
    }

    const targetedKeys = [
      "name", "fullname", "email", "emailid", "phone", "mobilenumber", 
      "mobile", "contact", "mcinumber", "mci", "medicalcouncilnumber", 
      "state", "category", "reference", "referredby", "registrationid", "regid", "id"
    ];

    // 3. Map spreadsheet data to database structure
    const processedParticipants = rawRows.map((row) => {
      const cleanRowMap = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        cleanRowMap[normalizedKey] = row[key];
      });

      const name = cleanRowMap["name"] || cleanRowMap["fullname"] || "Unknown Delegate";
      const email = cleanRowMap["email"] || cleanRowMap["emailid"] || "";
      const phone = String(cleanRowMap["phone"] || cleanRowMap["mobilenumber"] || cleanRowMap["mobile"] || cleanRowMap["contact"] || "");
      const medicalCouncilNumber = String(cleanRowMap["mcinumber"] || cleanRowMap["mci"] || cleanRowMap["medicalcouncilnumber"] || "");
      const state = cleanRowMap["state"] || "";
      const category = cleanRowMap["category"] || "";
      const reference = cleanRowMap["reference"] || cleanRowMap["referredby"] || "";
      const regId = String(cleanRowMap["registrationid"] || cleanRowMap["regid"] || cleanRowMap["id"] || "");

      const dynamicData = {};
      Object.keys(row).forEach((originalKey) => {
        const normalizedKey = originalKey.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!targetedKeys.includes(normalizedKey)) {
          dynamicData[originalKey] = row[originalKey];
        }
      });

      return {
        regId,
        name,
        email,
        phone,
        state,
        category,
        reference,
        medicalCouncilNumber,
        conferenceId: finalConferenceId,     // Stores the true MongoDB hex ID string
        conferenceName: finalConferenceName, // Stores legible conference name 
        qrCode: regId || phone || name,
        dynamicData,
        status: "pending",
        isCheckedIn: false,
        isBadgePrinted: false,
        kitbagCollected: false,
        certificateGiven: false,
        foodLogs: {}
      };
    });

    // 4. Save to MongoDB
    const insertedRecords = await Participant.insertMany(processedParticipants);

    // 5. Fire WebSocket broadcasts to BOTH channels (the true ID and the URL text slug)
    const io = getIO();
    io.to(cleanConferenceId).emit("conferenceDataUpdated", { conferenceId: cleanConferenceId });
    io.to(finalConferenceId).emit("conferenceDataUpdated", { conferenceId: finalConferenceId });
    io.to(cleanConferenceId).emit("statsUpdated");
    io.to(finalConferenceId).emit("statsUpdated");

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      msg: `${insertedRecords.length} roster profiles imported successfully.` 
    });

  } catch (err) {
    console.error("EXCEL IMPORT RUNTIME CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};