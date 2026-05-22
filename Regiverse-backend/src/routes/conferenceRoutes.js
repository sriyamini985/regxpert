import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* CREATE CONFERENCE */
router.post("/", async (req, res) => {
  try {
    if (!req.body.title || !req.body.slug) {
      return res.status(400).json({
        success: false,
        message: "Title and slug required",
      });
    }

    const conference = await Conference.create({
      title: req.body.title,
      slug: req.body.slug,
    });

    res.status(201).json({
      success: true,
      data: conference,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* GET CONFERENCES */
router.get("/", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({
      createdAt: -1,
    });

    const formatted = await Promise.all(
      conferences.map(async (c) => {
        let count = 0;

        try {
          count = await Participant.countDocuments({
            conferenceId: c.slug,
          });
        } catch (err) {
          console.log("count error:", err.message);
        }

        return {
          ...c.toObject(),
          delegates: count,
        };
      })
    );

    res.status(200).json(formatted);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conferences",
      data: [],
    });
  }
});

/* IMPORT EXCEL */
router.post("/import-excel", upload.single("file"), async (req, res) => {
  try {
    const conferenceId = req.body.conferenceId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    const formatted = excelData.map((row) => {
      const normalized = {};

      Object.keys(row).forEach((key) => {
        normalized[key.trim().toLowerCase()] = row[key];
      });

      return {
        regId:
          normalized["abstract id"] ||
          normalized["reg id"] ||
          normalized["id"] ||
          "",

        name:
          normalized["name"] ||
          normalized["full name"] ||
          "",

        email: normalized["email"] || "",

        phone:
          normalized["phone"] ||
          normalized["mobile"] ||
          "",

        state: normalized["state"] || "",

        category: normalized["category"] || "",

        reference: normalized["reference"] || "",

        medicalCouncilNumber:
          normalized["medical council number"] || "",

        conferenceId,

        conferenceName: conferenceId,

        printed: false,

        printType: "name",

        qrCode: `QR-${Date.now()}-${Math.random()}`,

        dynamicData: row,
      };
    });

    const result = await Participant.insertMany(formatted);

    res.status(200).json({
      success: true,
      inserted: result.length,
      message: `${result.length} delegates imported`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;