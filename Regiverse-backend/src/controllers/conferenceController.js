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
  return `ID - ${alphaPart}${numPart}`;
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
      "state", "category", "reference", "referredby", 
      "registrationid", "regid", "id", "registrationno", "registrationnumber",
      "regno", "regnum", "slno", "serialno", "sno",
      "firstname", "lastname", "first", "last", "delegatename", "attendeename",
      "participantname", "doctorname", "delegate", "attendee", "participant",
      "emailaddress", "mail", "mobileno", "phonenumber", "contactno", "contactnumber"
    ];

    const processedParticipants = [];

    // Map spreadsheet data
    rawRows.forEach((row, idx) => {
      const cleanRowMap = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        cleanRowMap[normalizedKey] = row[key];
      });

      let name = String(
        cleanRowMap["name"] || cleanRowMap["fullname"] || 
        cleanRowMap["delegatename"] || cleanRowMap["attendeename"] || 
        cleanRowMap["participantname"] || cleanRowMap["doctorname"] || 
        cleanRowMap["delegate"] || cleanRowMap["attendee"] || 
        cleanRowMap["participant"] || ""
      ).trim();

      if (!name) {
        const firstName = String(cleanRowMap["firstname"] || cleanRowMap["first"] || "").trim();
        const lastName = String(cleanRowMap["lastname"] || cleanRowMap["last"] || "").trim();
        if (firstName || lastName) {
          name = `${firstName} ${lastName}`.trim();
        }
      }

      const email = String(
        cleanRowMap["email"] || cleanRowMap["emailid"] || 
        cleanRowMap["emailaddress"] || cleanRowMap["mail"] || ""
      ).trim();

      const phone = String(
        cleanRowMap["phone"] || cleanRowMap["mobilenumber"] || 
        cleanRowMap["mobile"] || cleanRowMap["contact"] || 
        cleanRowMap["mobileno"] || cleanRowMap["phonenumber"] || 
        cleanRowMap["contactno"] || cleanRowMap["contactnumber"] || ""
      ).trim();

      // If still all empty, use the first key of the row as a fallback name
      if (!name && !email && !phone) {
        const keys = Object.keys(row);
        if (keys.length > 0) {
          name = String(row[keys[0]] || "").trim();
        }
      }

      if (!name && !email && !phone) return; // Skip empty rows

      const medicalCouncilNumber = String(cleanRowMap["mcinumber"] || cleanRowMap["mci"] || cleanRowMap["medicalcouncilnumber"] || "").trim();
      const state = String(cleanRowMap["state"] || "").trim();
      const category = String(cleanRowMap["category"] || "").trim();
      const reference = String(cleanRowMap["reference"] || cleanRowMap["referredby"] || "").trim();
      
      let regId = String(
        cleanRowMap["registrationid"] || cleanRowMap["regid"] || 
        cleanRowMap["registrationno"] || cleanRowMap["registrationnumber"] ||
        cleanRowMap["regno"] || cleanRowMap["regnum"] ||
        cleanRowMap["slno"] || cleanRowMap["serialno"] || cleanRowMap["sno"] ||
        cleanRowMap["id"] || ""
      ).trim();
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

    // Filter out duplicates (by email, phone, custom regId, or name fallback in this conference)
    const isPlaceholder = (val) => {
      if (!val) return true;
      const clean = String(val).trim().toLowerCase();
      return (
        clean === "" ||
        clean === "-" ||
        clean === "n/a" ||
        clean === "na" ||
        clean === "null" ||
        clean === "undefined" ||
        clean === "none" ||
        clean === "no" ||
        clean === "0" ||
        clean === "0000000000" ||
        clean === "1234567890"
      );
    };

    const cleanName = (n) => {
      if (!n) return "";
      return String(n)
        .toLowerCase()
        .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
    };

    const namesAreSimilar = (name1, name2) => {
      const n1 = cleanName(name1);
      const n2 = cleanName(name2);
      if (!n1 || !n2) return false;
      if (n1 === n2) return true;
      if (n1.includes(n2) || n2.includes(n1)) return true;
      
      const words1 = name1.toLowerCase().replace(/^(dr|prof|mr|mrs|ms)\.?\s+/g, "").trim().split(/\s+/).filter(Boolean);
      const words2 = name2.toLowerCase().replace(/^(dr|prof|mr|mrs|ms)\.?\s+/g, "").trim().split(/\s+/).filter(Boolean);
      if (words1.length > 0 && words2.length > 0) {
        const first1 = words1[0];
        const last1 = words1[words1.length - 1];
        const first2 = words2[0];
        const last2 = words2[words2.length - 1];
        if (first1 === first2 && last1 === last2) {
          return true;
        }
      }
      return false;
    };

    const existingParticipants = await Participant.find({ conferenceId: finalConferenceId });

    const uniqueFormatted = [];
    let skippedCount = 0;

    processedParticipants.forEach(item => {
      const phone = item.phone?.trim();
      const email = item.email?.trim().toLowerCase();
      const regId = item.regId?.trim();
      const name = item.name?.trim().toLowerCase();
      
      const hasPhone = phone && !isPlaceholder(phone);
      const hasEmail = email && !isPlaceholder(email);
      
      // Auto-generated regIds start with "RegID - " or "ID - "
      const isAutoRegId = regId && (regId.startsWith("RegID - ") || regId.startsWith("ID - "));
      
      let isDuplicate = false;

      const checkMatch = (other) => {
        const nameMatches = namesAreSimilar(other.name, item.name);
        
        const otherRegId = other.regId?.trim();
        const hasOtherRegId = otherRegId && !otherRegId.startsWith("RegID - ") && !otherRegId.startsWith("ID - ") && !isPlaceholder(otherRegId);
        const hasItemRegId = regId && !isAutoRegId && !isPlaceholder(regId);

        const differentUniqueIds = hasOtherRegId && hasItemRegId && otherRegId !== regId;

        return nameMatches && !differentUniqueIds;
      };

      // 1. Check existing in DB
      const dbMatch = existingParticipants.find(checkMatch);

      if (dbMatch) {
        isDuplicate = true;
      } else {
        // 2. Check seen in Excel
        const seenMatch = uniqueFormatted.find(checkMatch);
        if (seenMatch) {
          isDuplicate = true;
        }
      }
        
      if (isDuplicate) {
        skippedCount++;
      } else {
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