import express from "express";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { 
  createParticipant, 
  scanQR, 
  verifyAndScan, 
  scanFood, 
  checkInParticipant, 
  scanHall, 
  scanWorkshop 
} from "../controllers/participantController.js";
import {
  broadcastParticipantCreated,
  broadcastParticipantUpdated,
  broadcastParticipantDeleted,
} from "../socket.js";

const router = express.Router();

// 0. Image CORS Proxy Route
router.get("/proxy-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("URL parameter is required");
    }

    const decodedUrl = decodeURIComponent(url);

    // Fetch the image from the remote URL with a 4-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      throw fetchErr;
    }
  } catch (err) {
    console.error("Proxy image error:", err);
    return res.status(500).send(err.message);
  }
});

// 1. Verify and Scan Route (Kitbag / Certificate)
router.post("/verify-and-scan", verifyAndScan);

// 2. Food Scan Route (Day + Meal specific)
router.post("/scan-food", scanFood);

// 3. General Check-In Route
router.post("/check-in", checkInParticipant);

// 4. Hall Entry/Exit Scan Route
router.post("/scan-hall", scanHall);

// 5. Workshop Scan Route
router.post("/scan-workshop", scanWorkshop);

// 6. Create Participant Route (with validation & duplicate checks)
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim() === "") {
      return res.status(400).json({ success: false, message: "Participant name is required" });
    }
    const body = { ...req.body };
    let actualConferenceId = null;
    if (body.conferenceId) {
      const targetConference = await Conference.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(body.conferenceId) ? body.conferenceId : null },
          { slug: body.conferenceId },
          { name: body.conferenceId }
        ]
      }).catch(() => null);
      if (targetConference) {
        body.conferenceName = targetConference.name;
        body.conferenceId = targetConference._id.toString();
        actualConferenceId = targetConference._id.toString();
      }
    }

    // Check for duplicate participant (same phone or email under the same conference)
    if (body.phone || body.email) {
      const query = { conferenceId: actualConferenceId };
      const orConditions = [];
      if (body.phone && body.phone.trim() !== "") {
        orConditions.push({ phone: body.phone.trim() });
      }
      if (body.email && body.email.trim() !== "") {
        orConditions.push({ email: body.email.trim().toLowerCase() });
      }
      if (orConditions.length > 0) {
        query.$or = orConditions;
        const existing = await Participant.findOne(query);
        if (existing) {
          return res.status(409).json({
            success: false,
            message: `A delegate with this ${
              existing.phone === body.phone ? "phone number" : "email address"
            } is already registered for this conference.`
          });
        }
      }
    }

    const participant = await Participant.create(body);
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

// 7. Scoped instant participant search
router.get("/", async (req, res) => {
  try {
    const { identifier, conferenceId } = req.query;
    
    if (!identifier || identifier.trim() === "") {
      return res.json([]);
    }

    const safeSearch = identifier.trim();

    const query = {
      $or: [
        { regId: safeSearch },
        { phone: safeSearch },
        { email: safeSearch },
        { qrCode: safeSearch },
        { name: { $regex: safeSearch, $options: "i" } }, 
        { phone: { $regex: safeSearch, $options: "i" } }, 
        { regId: { $regex: safeSearch, $options: "i" } }
      ]
    };

    if (conferenceId && conferenceId.trim() !== "") {
      const param = conferenceId.trim();
      const targetConference = await Conference.findOne({
        $or: [
          { slug: param },
          { name: param },
          { _id: mongoose.Types.ObjectId.isValid(param) ? param : null }
        ]
      }).catch(() => null);

      if (targetConference) {
        query.conferenceId = targetConference._id.toString();
      } else {
        query.conferenceId = param;
      }
    }

    const filteredParticipants = await Participant.find(query)
      .sort({ createdAt: -1 })
      .limit(30);
    
    return res.json(filteredParticipants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. Update Participant Route
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

// 9. Delete Participant Route
router.delete("/:id", async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    const conferenceId = participant ? participant.conferenceId : null;
    await Participant.findByIdAndDelete(req.params.id);
    
    if (participant) {
      broadcastParticipantDeleted(req.params.id, conferenceId);
    }

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

// 10. GET participants by specific Conference
router.get("/conference/:conferenceId", async (req, res) => {
  try {
    const param = req.params.conferenceId?.trim();
    
    const queryConditions = [
      { conferenceId: param },
      { conferenceName: param }
    ];

    const targetConference = await Conference.findOne({
      $or: [
        { slug: param },
        { name: param }
      ]
    }).catch(() => null);

    if (targetConference) {
      queryConditions.push({ conferenceId: targetConference._id.toString() });
      queryConditions.push({ conferenceName: targetConference.name });
    }

    if (mongoose.Types.ObjectId.isValid(param)) {
      const targetByObjId = await Conference.findById(param).catch(() => null);
      if (targetByObjId) {
        queryConditions.push({ conferenceId: targetByObjId._id.toString() });
        queryConditions.push({ conferenceName: targetByObjId.name });
        if (targetByObjId.slug) {
          queryConditions.push({ conferenceId: targetByObjId.slug });
        }
      }
    }

    const participants = await Participant.find({
      $or: queryConditions,
    }).sort({ createdAt: -1 });

    return res.json(participants);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;