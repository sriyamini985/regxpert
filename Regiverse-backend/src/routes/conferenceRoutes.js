import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* =================================
   CREATE CONFERENCE
================================= */

router.post("/", async (req, res) => {

  try {

    const conference =
      await Conference.create({
        title: req.body.title,
        slug: req.body.slug,
      });

    res.json({
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

/* =================================
   GET ALL CONFERENCES
================================= */

router.get("/", async (req, res) => {

  try {

    const conferences =
      await Conference.find().sort({
        createdAt: -1,
      });

    const formatted =
      await Promise.all(
        conferences.map(async (c) => {

          const count =
            await Participant.countDocuments({
              conferenceId: c.slug,
            });

          return {
            ...c.toObject(),
            delegates: count,
          };
        })
      );

    res.json(formatted);

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =================================
   IMPORT EXCEL
================================= */

router.post(
  "/import-excel",
  upload.single("file"),

  async (req, res) => {

    try {

      const conferenceId =
        req.body.conferenceId;

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      /* READ EXCEL */

      const workbook = XLSX.read(
        req.file.buffer,
        {
          type: "buffer",
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const excelData =
        XLSX.utils.sheet_to_json(
          worksheet
        );

      /* FORMAT */

      const formatted =
        excelData.map((row) => {

          const normalized = {};

          Object.keys(row).forEach(
            (key) => {

              normalized[
                key.trim().toLowerCase()
              ] = row[key];
            }
          );

          return {

            regId:
              normalized["abstract id"] ||
              normalized["reg id"] ||
              normalized["registration id"] ||
              normalized["registration no"] ||
              normalized["delegate id"] ||
              normalized["id"] ||
              "",

            name:
              normalized["name"] ||
              normalized["delegate name"] ||
              normalized["full name"] ||
              "",

            email:
              normalized["email"] ||
              normalized["email address"] ||
              "",

            phone:
              normalized["phone"] ||
              normalized["mobile"] ||
              normalized["mobile number"] ||
              normalized["whatsapp number"] ||
              "",

            state:
              normalized["state"] ||
              normalized["city"] ||
              "",

            category:
              normalized["category"] ||
              normalized["delegate category"] ||
              "",

            reference:
              normalized["reference"] ||
              normalized["referred by"] ||
              "",

            medicalCouncilNumber:
              normalized[
                "medical council number"
              ] ||
              normalized["mci number"] ||
              normalized[
                "registration number"
              ] ||
              "",

            conferenceId,

            conferenceName:
              conferenceId,

            printed: false,

            printType: "name",

            qrCode:
              `QR-${Date.now()}-${Math.random()}`,

            dynamicData: row,
          };
        });

      /* SAVE */

      const result =
        await Participant.insertMany(
          formatted
        );

      res.json({
        success: true,
        inserted: result.length,
        message:
          `${result.length} delegates imported`,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;

