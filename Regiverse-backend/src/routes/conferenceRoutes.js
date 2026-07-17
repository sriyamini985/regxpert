import express from "express";
import multer from "multer";
import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";
import SharedData from "../models/SharedData.js";
import BadgeTemplate from "../models/BadgeTemplate.js";
import Poster from "../models/Poster.js";
import { importExcel } from "../controllers/conferenceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

// 1. Excel Batch Roster Upload Route
router.post("/import-excel", requireAuth, requireRole(["admin"]), upload.single("file"), importExcel);

// 2. GET ALL CONFERENCES (with dynamic delegate count calculation)
// Public route required for staff login dropdown selection
router.get("/", async (req, res) => {
  try {
    const listWithCounts = await Conference.aggregate([
      {
        $lookup: {
          from: "participants",
          let: { confId: "$_id", confName: "$name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$conferenceId", { $toString: "$$confId" }] },
                    { $eq: ["$conferenceName", "$$confName" ] }
                  ]
                }
              }
            }
          ],
          as: "delegatesList"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          title: "$name",
          slug: 1,
          isActive: 1,
          createdAt: 1,
          delegates: { $size: "$delegatesList" }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return res.status(200).json(listWithCounts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. CREATE A NEW CONFERENCE
router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
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
router.patch("/:id/activate", requireAuth, requireRole(["admin"]), async (req, res) => {
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

// 5. DELETE A CONFERENCE (and all its associated participants/shared data)
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const conference = await Conference.findById(id);
    if (!conference) {
      return res.status(404).json({ error: "Conference workspace profile not found" });
    }

    const conferenceName = conference.name || conference.title || "";

    // Cascade delete: Delete all participants belonging to this conference
    await Participant.deleteMany({
      $or: [
        { conferenceId: id },
        { conferenceName: conferenceName }
      ]
    });

    // Cascade delete: Delete all shared data belonging to this conference
    await SharedData.deleteMany({ conferenceId: id });

    // Cascade delete: Delete all badge templates belonging to this conference
    await BadgeTemplate.deleteMany({ conferenceId: id });

    // Cascade delete: Delete all posters belonging to this conference
    await Poster.deleteMany({
      $or: [
        { conferenceId: id },
        { conferenceId: conference.slug }
      ]
    });

    // Delete the conference itself
    await Conference.findByIdAndDelete(id);

    res.json({ success: true, message: "Conference and all associated participants/shared data deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;