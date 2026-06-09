import express from "express";
import Participant from "../models/Participant.js";
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

// 3. OPTIMIZED SEARCH ROUTE: Returns nothing by default, searches instantly via Regex when query exists
router.get("/", async (req, res) => {
  try {
    const { identifier } = req.query;
    
    // REQUIREMENT: Do not load anything if the search query is empty
    if (!identifier || identifier.trim() === "") {
      return res.json([]);
    }

    const safeSearch = identifier.trim();

    // Use Mongo $regex for partial instant matching ('i' makes it case-insensitive)
    const filteredParticipants = await Participant.find({
      $or: [
        { name: { $regex: safeSearch, $options: "i" } }, 
        { phone: { $regex: safeSearch, $options: "i" } }, 
        { regId: { $regex: safeSearch, $options: "i" } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(30); // Performance cap for instant dropdown responses
    
    return res.json(filteredParticipants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Update Route (Fixed variable references and Mongoose warning)
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

// 6. GET participants by specific Conference
router.get("/conference/:conferenceId", async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId?.trim();
    const participants = await Participant.find({
      $or: [
        { conferenceId: conferenceId },
        { conferenceName: conferenceId },
      ],
    }).sort({ createdAt: -1 });

    return res.json(participants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;