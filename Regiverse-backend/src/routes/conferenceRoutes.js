import express from "express";
import multer from "multer";
import Conference from "../models/Conference.js";
import { importExcel } from "../controllers/conferenceController.js";

const router = express.Router();

// 1. Configure Multer to hold the uploaded file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// 2. Excel Batch Roster Upload Route (Points to your custom spreadsheet parser file)
router.post("/import-excel", upload.single("file"), importExcel);

// 3. GET ALL CONFERENCES
router.get("/", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ createdAt: -1 });
    res.json(conferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. CREATE A NEW CONFERENCE
router.post("/", async (req, res) => {
  try {
    const { title, name, slug } = req.body;
    const newConference = await Conference.create({
      name: title || name,
      slug,
      isActive: false
    });
    res.status(201).json(newConference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. TOGGLE WORKSPACE ACTIVE STATUS
router.patch("/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const conference = await Conference.findById(id);
    if (!conference) {
      return res.status(404).json({ error: "Conference workspace profile not found" });
    }
    conference.isActive = !conference.isActive;
    await conference.save();
    res.json(conference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;