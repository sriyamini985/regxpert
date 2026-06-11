import express from "express";
import mongoose from "mongoose"; // 1. Added to validate MongoDB hex strings
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js"; // 2. Added to inspect active status properties
import { createParticipant, scanQR, verifyAndScan } from "../controllers/participantController.js";
import {
  broadcastParticipantCreated,
  broadcastParticipantUpdated,
  broadcastParticipantDeleted,
} from "../socket.js";

const router = express.Router();

// 1. Verify and Scan Route
router.post("/verify-and-scan", verifyAndScan);

// 2. Create Participant Route
router.post("/", async (req, res) => {
  try {
    const participant = await Participant.create(req.body);
    broadcastParticipantCreated(participant);

    return res.json({
      success: true,
      data: participant,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 3. OPTIMIZED SEARCH ROUTE: Scopes searches purely to the ACTIVATED conference
router.get("/", async (req, res) => {
  try {
    const { identifier, conferenceId } = req.query;
    
    // REQUIREMENT 1: Do not load anything if search string is empty
    if (!identifier || identifier.trim() === "") {
      return res.json([]);
    }

    // REQUIREMENT 2: Enforce conference context activation safety rules
    if (!conferenceId || conferenceId.trim() === "") {
      return res.status(400).json({ error: "Missing active conference context parameter." });
    }

    const safeSearch = identifier.trim();
    const incomingId = conferenceId.trim();

    // Look up the conference profile row to translate slug to ID and check status
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(incomingId) ? incomingId : undefined },
        { slug: incomingId }
      ].filter(Boolean)
    });

    if (!targetConference) {
      return res.json([]); // Return empty array if conference doesn't exist
    }

    // USER PANEL ACTIVATION GUARD: If the conference isn't active, return nothing
    const isLive = targetConference.isActive === true || targetConference.status === "active";
    if (!isLive) {
      return res.json([]); 
    }

    const finalConferenceId = String(targetConference._id);

    // Query filters check fields nested inside the true hex database identifier container
    const filteredParticipants = await Participant.find({
      conferenceId: finalConferenceId,
      $or: [
        { name: { $regex: safeSearch, $options: "i" } }, 
        { phone: { $regex: safeSearch, $options: "i" } }, 
        { regId: { $regex: safeSearch, $options: "i" } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(30);
    
    return res.json(filteredParticipants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Update Route 
router.put("/:id", async (req, res) => {
  try {
    const updatedParticipant = await Participant.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { returnDocument: 'after' }
    );

    if (!updatedParticipant) {
      return res.status(404).json({
        success: false,
        message: "Participant record not found",
      });
    }

    broadcastParticipantUpdated(updatedParticipant);

    return res.json({
      success: true,
      data: updatedParticipant,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 5. Delete Route
router.delete("/:id", async (req, res) => {
  try {
    await Participant.findByIdAndDelete(req.params.id);
    broadcastParticipantDeleted(req.params.id);

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 6. GET participants by specific Conference (With Admin Overrides)
router.get("/conference/:conferenceId", async (req, res) => {
  try {
    const incomingId = req.params.conferenceId?.trim();
    const { admin } = req.query; // Capture permission override parameter

    // Resolve workspace details dynamically from database
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(incomingId) ? incomingId : undefined },
        { slug: incomingId },
        { name: incomingId }
      ].filter(Boolean)
    });

    if (!targetConference) {
      return res.status(404).json({ error: "Conference workspace profile not found." });
    }

    // MANDATORY SPLIT: If it is NOT an admin request, verify activation status
    if (admin !== "true") {
      const isLive = targetConference.isActive === true || targetConference.status === "active";
      if (!isLive) {
        return res.json([]); // Return blank dataset if an external user targets this directly
      }
    }

    // Admin passes bypass verification -> load dataset seamlessly all the time
    const finalConferenceId = String(targetConference._id);
    const participants = await Participant.find({
      $or: [
        { conferenceId: finalConferenceId },
        { conferenceName: incomingId },
      ],
    }).sort({ createdAt: -1 });

    return res.json(participants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;