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

    // 1. Validation: Ensure title exists
    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Conference name is required" });
    }

    const cleanTitle = title.trim();
    // 2. Generate unique name (Title + Year)
    const fullName = `${cleanTitle} ${year}`;
    // 3. Generate unique slug
    const slug = cleanTitle.toLowerCase().replace(/\s+/g, "") + year;

    // 4. Check if a conference with this specific name already exists
    const existing = await Conference.findOne({ name: fullName });

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    // 5. Create new conference
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
    const conferences = await Conference.find().sort({
      createdAt: -1,
    });

    const formatted = await Promise.all(
      conferences.map(async (c) => {
        const conferenceName = c.name || c.title || "";

        const delegates = await Participant.countDocuments({
          $or: [
            {
              conferenceId: c._id.toString(),
            },
            {
              conferenceName: conferenceName,
            },
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
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================================
   GET SINGLE CONFERENCE
========================================= */
router.get("/:conferenceId", async (req, res) => {
  try {
    const conference = await Conference.findOne({
      $or: [
        {
          _id: req.params.conferenceId,
        },
        {
          name: req.params.conferenceId,
        },
      ],
    });

    if (!conference) {
      return res.status(404).json({
        success: false,
        message: "Conference not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: conference,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================================
   IMPORT EXCEL (FIXED & OPTIMIZED)
========================================= */
router.post(
  "/import-excel",
  upload.single("file"),
  async (req, res) => {
    try {
      const { conferenceId } = req.body;

      // Ensure we don't process empty or stringified 'undefined' fields
      if (!conferenceId || conferenceId === "undefined" || conferenceId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "A valid conferenceId is required for importing records.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // 1. Fetch target conference info to extract the human-readable name string
      const targetConference = await Conference.findById(conferenceId);
      const actualConferenceName = targetConference ? targetConference.name : "Unknown Conference";

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      const formatted = excelData.map((row, index) => ({
        regId:
          row["Registration ID"] ||
          row["Reg ID"] ||
          row["Abstract ID"] ||
          `REG-${index + 1}`,

        name: row["Name"] || row["Full Name"] || "",
        email: row["Email"] || "",
        phone: String(row["Phone"] || row["Mobile"] || ""),
        state: row["State"] || "",
        category: row["Registration Type"] || row["Category"] || "",
        reference: row["Reference"] || "",
        medicalCouncilNumber:
          row["MCI Number"] ||
          row["Medical Council Number"] ||
          "",

        // 2. Clear, explicit value mappings
        conferenceId: String(conferenceId).trim(),
        conferenceName: actualConferenceName, // Resolves to descriptive title string

        printed: false,
        printType: "name",
        qrCode: `QR-${Date.now()}-${Math.random()}`,
        dynamicData: row,
      }));

      const cleaned = formatted.filter(
        (p) => p.name || p.email || p.phone
      );

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