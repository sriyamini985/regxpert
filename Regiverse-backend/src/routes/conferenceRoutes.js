import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";
import { broadcastBulkImport } from "../socket.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================================
   CREATE CONFERENCE
========================================= */
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const year = new Date().getFullYear();

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Conference name is required" });
    }

    const cleanTitle = title.trim();
    const fullName = `${cleanTitle} ${year}`;
    const slug = cleanTitle.toLowerCase().replace(/\s+/g, "") + year;

    const existing = await Conference.findOne({ name: fullName });

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const conference = await Conference.create({
      name: fullName,
      slug: slug,
    });

    return res.status(201).json({ success: true, data: conference });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================
   GET ALL CONFERENCES
========================================= */
router.get("/", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ createdAt: -1 });

    const formatted = await Promise.all(
      conferences.map(async (c) => {
        const conferenceName = c.name || c.title || "";

        const delegates = await Participant.countDocuments({
          $or: [
            { conferenceId: c._id.toString() },
            { conferenceName: conferenceName },
          ],
        });

        return {
          _id: c._id,
          name: conferenceName,
          delegates,
          createdAt: c.createdAt,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================
   GET SINGLE CONFERENCE
========================================= */
router.get("/:conferenceId", async (req, res) => {
  try {
    const conference = await Conference.findOne({
      $or: [
        { _id: req.params.conferenceId },
        { name: req.params.conferenceId },
      ],
    });

    if (!conference) {
      return res.status(404).json({ success: false, message: "Conference not found" });
    }

    return res.status(200).json({ success: true, data: conference });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================================
   IMPORT EXCEL (WITH SMART AUTOMATIC REGID GENERATION)
========================================================================= */
router.post(
  "/import-excel",
  upload.single("file"),
  async (req, res) => {
    try {
      let conferenceId = req.body.conferenceId || req.query.conferenceId;

      if (!conferenceId || conferenceId === "undefined" || conferenceId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "A valid conferenceId is required for importing records.",
        });
      }

      conferenceId = String(conferenceId).trim();

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const targetConference = await Conference.findById(conferenceId).catch(() => null);
      const actualConferenceName = targetConference ? targetConference.name : "Unknown Conference";

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (rawRows.length <= 1) {
        return res.status(400).json({
          success: false,
          message: "The uploaded file appears to be empty or contains no readable data rows.",
        });
      }

      // Step 1: Analyze headers
      const headers = rawRows[0].map(h => String(h).toLowerCase().trim());
      
      const nameIdx = headers.findIndex(h => h.includes("name") || h === "name");
      const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("e-mail") || h === "mail");
      const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("mobile") || h.includes("number") || h === "contact");
      
      const regIdIdx = headers.findIndex(h => 
        h.includes("reg") || 
        h.includes("id") || 
        h.includes("sl.no") || 
        h.includes("sl no") || 
        h.includes("si.no") || 
        h.includes("no")
      );
      
      const catIdx = headers.findIndex(h => h.includes("type") || h.includes("category") || h.includes("cat"));
      const stateIdx = headers.findIndex(h => h.includes("state") || h.includes("city") || h.includes("address"));
      const refIdx = headers.findIndex(h => h.includes("reference") || h.includes("referred") || h.includes("ref"));
      const mciIdx = headers.findIndex(h => h.includes("mci") || h.includes("medical") || h.includes("council"));

      const formatted = [];

      // Helper function to generate a random "ABCD123" format sequence
      const generateCustomRegId = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let alphaPart = "";
        let numPart = "";
        
        // Generate 4 random letters
        for (let j = 0; j < 4; j++) {
          alphaPart += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        // Generate 3 random numbers
        for (let k = 0; k < 3; k++) {
          numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return `RegID - ${alphaPart}${numPart}`;
      };

      // Step 2: Loop through data rows
      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue; 

        const rawName = nameIdx !== -1 ? row[nameIdx] : "";
        const rawEmail = emailIdx !== -1 ? row[emailIdx] : "";
        const rawPhone = phoneIdx !== -1 ? row[phoneIdx] : "";
        const rawRegId = regIdIdx !== -1 ? row[regIdIdx] : "";
        const rawCat = catIdx !== -1 ? row[catIdx] : "";
        const rawState = stateIdx !== -1 ? row[stateIdx] : "";
        const rawRef = refIdx !== -1 ? row[refIdx] : "";
        const rawMci = mciIdx !== -1 ? row[mciIdx] : "";

        const nameValue = String(rawName || "").trim();
        const emailValue = String(rawEmail || "").trim();
        const phoneValue = String(rawPhone || "").trim();

        if (!nameValue && !emailValue && !phoneValue) continue;

        // NEW LOGIC: Check if Excel has a valid Reg ID, otherwise generate "RegID - ABCD123"
        let regIdValue = String(rawRegId || "").trim();
        if (!regIdValue) {
          regIdValue = generateCustomRegId();
        }

        const catValue = String(rawCat || "").trim();
        const stateValue = String(rawState || "").trim();
        const refValue = String(rawRef || "").trim();
        const mciValue = String(rawMci || "").trim();

        const fallbackObj = {};
        headers.forEach((h, idx) => {
          if (h) fallbackObj[h] = row[idx] || "";
        });

        formatted.push({
          regId: regIdValue,
          name: nameValue,
          email: emailValue,
          phone: phoneValue,
          state: stateValue,
          category: catValue,
          reference: refValue,
          medicalCouncilNumber: mciValue,
          conferenceId: conferenceId,
          conferenceName: actualConferenceName,
          printed: false,
          printType: "name",
          qrCode: `QR-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
          dynamicData: fallbackObj
        });
      }

      if (formatted.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to map entries. Please verify column headers exist in row 1.",
        });
      }

      const result = await Participant.insertMany(formatted);
      broadcastBulkImport(conferenceId);

      return res.status(200).json({
        success: true,
        inserted: result.length,
        message: `${result.length} delegates imported successfully.`,
      });
    } catch (err) {
      console.error("Critical Import Exception:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;