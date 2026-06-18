import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { broadcastBulkImport } from "../socket.js";
import xlsx from "xlsx";
import mongoose from "mongoose";

// Helper function to generate a random "ABCD123" format sequence
const generateCustomRegId = () => {
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
  return `RegID - ${alphaPart}${numPart}`;
};

export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, message: "Missing conference identifier context." });
    }

    const cleanConferenceId = String(conferenceId).trim();

    // Find target conference using slug, name, or ObjectId
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConferenceId) ? cleanConferenceId : undefined },
        { slug: cleanConferenceId },
        { name: cleanConferenceId }
      ].filter(Boolean)
    });

    const finalConferenceId = targetConference ? String(targetConference._id) : cleanConferenceId;
    const finalConferenceName = targetConference ? (targetConference.name || targetConference.title) : "Unknown Conference";

    // Read sheet buffer from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: "The uploaded sheet is empty." });
    }

    const targetedKeys = [
      "name", "fullname", "email", "emailid", "phone", "mobilenumber", 
      "mobile", "contact", "mcinumber", "mci", "medicalcouncilnumber", 
      "state", "category", "reference", "referredby", "registrationid", "regid", "id"
    ];

    const processedParticipants = [];

    // Map spreadsheet data
    rawRows.forEach((row, idx) => {
      const cleanRowMap = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        cleanRowMap[normalizedKey] = row[key];
      });

      const name = String(cleanRowMap["name"] || cleanRowMap["fullname"] || "").trim();
      const email = String(cleanRowMap["email"] || cleanRowMap["emailid"] || "").trim();
      const phone = String(cleanRowMap["phone"] || cleanRowMap["mobilenumber"] || cleanRowMap["mobile"] || cleanRowMap["contact"] || "").trim();
      
      if (!name && !email && !phone) return; // Skip empty rows

      const medicalCouncilNumber = String(cleanRowMap["mcinumber"] || cleanRowMap["mci"] || cleanRowMap["medicalcouncilnumber"] || "").trim();
      const state = String(cleanRowMap["state"] || "").trim();
      const category = String(cleanRowMap["category"] || "").trim();
      const reference = String(cleanRowMap["reference"] || cleanRowMap["referredby"] || "").trim();
      
      let regId = String(cleanRowMap["registrationid"] || cleanRowMap["regid"] || cleanRowMap["id"] || "").trim();
      if (!regId) {
        regId = generateCustomRegId();
      }

      const dynamicData = {};
      Object.keys(row).forEach((originalKey) => {
        const value = String(row[originalKey] || "").trim();
        const normalizedKey = originalKey.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!targetedKeys.includes(normalizedKey)) {
          dynamicData[originalKey] = row[originalKey];
        }

        // Auto-detect photo column or image URL value
        const isPhotoColumn = [
          "photo", "profilephoto", "participantphoto", "avatar", "image", 
          "picture", "pic", "photourl", "imagelink", "photolink"
        ].includes(normalizedKey);

        const isImageUrlValue = value.startsWith("http") && (
          value.toLowerCase().endsWith(".jpg") || value.toLowerCase().endsWith(".jpeg") || 
          value.toLowerCase().endsWith(".png") || value.toLowerCase().endsWith(".webp") || 
          value.toLowerCase().endsWith(".gif") || value.includes("/profile_photo/") ||
          value.includes("/uploads/")
        );

        if (isPhotoColumn || isImageUrlValue) {
          dynamicData["Photo"] = row[originalKey];
        }
      });

      processedParticipants.push({
        regId,
        name: name || "Unknown Delegate",
        email,
        phone,
        state,
        category,
        reference,
        medicalCouncilNumber,
        conferenceId: finalConferenceId,
        conferenceName: finalConferenceName,
        qrCode: regId || phone || name,
        dynamicData,
        status: "pending",
        isCheckedIn: false,
        printed: false,
        kitbagCollected: false,
        certificateGiven: false,
        foodLogs: {}
      });
    });

    if (processedParticipants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to map entries. Please verify spreadsheet is not empty.",
      });
    }

    // Filter out duplicates (by email or phone in this conference)
    const existingParticipants = await Participant.find({ conferenceId: finalConferenceId });
    const existingPhones = new Set(existingParticipants.map(p => p.phone?.trim()).filter(Boolean));
    const existingEmails = new Set(existingParticipants.map(p => p.email?.trim().toLowerCase()).filter(Boolean));

    const uniqueFormatted = [];
    let skippedCount = 0;
    
    const seenPhonesInExcel = new Set();
    const seenEmailsInExcel = new Set();

    processedParticipants.forEach(item => {
      const phone = item.phone?.trim();
      const email = item.email?.trim().toLowerCase();
      
      const isDuplicate = 
        (phone && (existingPhones.has(phone) || seenPhonesInExcel.has(phone))) ||
        (email && (existingEmails.has(email) || seenEmailsInExcel.has(email)));
        
      if (isDuplicate) {
        skippedCount++;
      } else {
        if (phone) seenPhonesInExcel.add(phone);
        if (email) seenEmailsInExcel.add(email);
        uniqueFormatted.push(item);
      }
    });

    if (uniqueFormatted.length === 0) {
      return res.status(400).json({
        success: false,
        message: `All ${processedParticipants.length} entries in the file were skipped as duplicates of existing records.`,
      });
    }

    const insertedRecords = await Participant.insertMany(uniqueFormatted);

    // Fire websocket broadcasts to sync dashboards
    broadcastBulkImport(finalConferenceId);
    broadcastBulkImport(cleanConferenceId);

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      skipped: skippedCount,
      message: `${insertedRecords.length} roster profiles imported successfully.${skippedCount > 0 ? ` Skipped ${skippedCount} duplicate records.` : ""}` 
    });

  } catch (err) {
    console.error("EXCEL IMPORT RUNTIME CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};