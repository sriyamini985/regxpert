import express from "express";
import multer from "multer";
import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";
import { importExcel } from "../controllers/conferenceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. Excel Batch Roster Upload Route
router.post("/import-excel", upload.single("file"), importExcel);

// 2. GET ALL CONFERENCES (with dynamic delegate count calculation)
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
          title: conferenceName,
          slug: c.slug,
          delegates,
          isActive: c.isActive,
          createdAt: c.createdAt,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. CREATE A NEW CONFERENCE
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

// 4. TOGGLE WORKSPACE ACTIVE STATUS
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