import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================
   CREATE CONFERENCE
========================= */

router.post("/", async (req, res) => {
  try {

    if (!req.body.title || !req.body.slug) {

      return res.status(400).json({
        success: false,
        message: "Title and slug required",
      });
    }

    const existingConference =
      await Conference.findOne({
        slug: req.body.slug,
      });

    if (existingConference) {

      return res.status(400).json({
        success: false,
        message: "Conference slug already exists",
      });
    }

    const conference =
      await Conference.create({
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

/* =========================
   GET CONFERENCES
========================= */

router.get("/", async (req, res) => {
  try {

    const conferences =
      await Conference.find().sort({
        createdAt: -1,
      });

    const formatted =
      await Promise.all(

        conferences.map(async (c) => {

          const delegates =
            await Participant.countDocuments({
              conferenceId: c.slug,
            });

          return {
            ...c.toObject(),
            delegates,
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

/* =========================
   IMPORT EXCEL
========================= */

router.post(
  "/import-excel",
  upload.single("file"),
  async (req, res) => {

    try {

      const conferenceId =
        req.body.conferenceId;

      if (!conferenceId) {

        return res.status(400).json({
          success: false,
          message: "conferenceId missing",
        });
      }

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      /* =========================
         READ EXCEL
      ========================= */

      const workbook =
        XLSX.read(req.file.buffer, {
          type: "buffer",
        });

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const excelData =
        XLSX.utils.sheet_to_json(
          worksheet,
          { defval: "" }
        );

      console.log(
        "TOTAL ROWS:",
        excelData.length
      );

      /* =========================
         FORMAT DATA
      ========================= */

      const formatted =
        excelData.map((row, index) => {

          const participant = {

            regId:

              row["Registration ID"] ||

              row["Reg ID"] ||

              row["Abstract ID"] ||

              `REG-${index + 1}`,

            name:

              row["Name"] ||

              row["Full Name"] ||

              "",

            email:

              row["Email"] ||

              "",

            phone:

              String(
                row["Phone"] ||

                row["Mobile"] ||

                ""
              ),

            state:

              row["State"] ||

              "",

            category:

              row["Registration Type"] ||

              row["Category"] ||

              "",

            reference:

              row["Reference"] ||

              "",

            medicalCouncilNumber:

              row["MCI Number"] ||

              row["Medical Council Number"] ||

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

          return participant;
        });

      /* =========================
         REMOVE EMPTY ROWS
      ========================= */

      const cleaned =
        formatted.filter((p) =>

          p.name ||
          p.email ||
          p.phone
        );

      console.log(
        "VALID ROWS:",
        cleaned.length
      );

      /* =========================
         INSERT
      ========================= */

      const result =
        await Participant.insertMany(
          cleaned
        );

      res.status(200).json({
        success: true,
        inserted: result.length,
        message:
          `${result.length} delegates imported successfully`,
      });

    } catch (err) {

      console.log(
        "IMPORT ERROR:"
      );

      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;