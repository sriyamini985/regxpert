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
   IMPORT EXCEL (FIXED: CASE-INSENSITIVE MAPPING & FOOLPROOF PARAMETER CHECK)
========================================================================= */
router.post(
  "/import-excel",
  upload.single("file"),
  async (req, res) => {
    try {
      // 1. Safe extraction check (handles body fields or fallback query strings safely)
      let conferenceId = req.body.conferenceId || req.query.conferenceId;

      if (!conferenceId || conferenceId === "undefined" || conferenceId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "A valid conferenceId is required for importing records.",
        });
      }

      conferenceId = String(conferenceId).trim();

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Fetch target conference to find its descriptive name string
      const targetConference = await Conference.findById(conferenceId).catch(() => null);
      const actualConferenceName = targetConference ? targetConference.name : "Unknown Conference";

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const formatted = excelData.map((row, index) => {
        // 2. Map all row object keys to lowercase to stop case-sensitive header mismatches
        const cleanRow = {};
        Object.keys(row).forEach((key) => {
          cleanRow[key.toLowerCase().trim()] = row[key];
        });

        // 3. Fallback checking for headers (Matches NAME, Name, Email, email, Phone, phone, etc.)
        const nameValue = cleanRow["name"] || cleanRow["full name"] || cleanRow["delegate name"] || cleanRow["participant name"] || "";
        const emailValue = cleanRow["email"] || cleanRow["e-mail"] || "";
        const phoneValue = cleanRow["phone"] || cleanRow["mobile"] || cleanRow["phone number"] || "";
        const regIdValue = cleanRow["registration id"] || cleanRow["reg id"] || cleanRow["abstract id"] || cleanRow["si.no"] || cleanRow["sl.no"] || `REG-${index + 1}`;
        const catValue = cleanRow["registration type"] || cleanRow["category"] || cleanRow["type"] || "";
        const stateValue = cleanRow["state"] || cleanRow["city"] || "";
        const refValue = cleanRow["reference"] || cleanRow["referred by"] || "";
        const mciValue = cleanRow["mci number"] || cleanRow["medical council number"] || cleanRow["mci no"] || "";

        return {
          regId: String(regIdValue).trim(),
          name: String(nameValue).trim(),
          email: String(emailValue).trim(),
          phone: String(phoneValue).trim(),
          state: String(stateValue).trim(),
          category: String(catValue).trim(),
          reference: String(refValue).trim(),
          medicalCouncilNumber: String(mciValue).trim(),

          // Now safely matched and passed to MongoDB strings
          conferenceId: conferenceId,
          conferenceName: actualConferenceName,

          printed: false,
          printType: "name",
          qrCode: `QR-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
          dynamicData: row,
        };
      });

      // Filter out any completely empty spacer lines
      const cleaned = formatted.filter((p) => p.name || p.email || p.phone);

      if (cleaned.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid participant rows could be read from your spreadsheet headers.",
        });
      }

      const result = await Participant.insertMany(cleaned);

      broadcastBulkImport(conferenceId);

      return res.status(200).json({
        success: true,
        inserted: result.length,
        message: `${result.length} delegates imported successfully`,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;