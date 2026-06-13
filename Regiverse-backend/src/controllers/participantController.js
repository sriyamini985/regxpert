import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import { getIO, broadcastFoodUpdate } from "../socket.js";

// Centralized helper function to find a participant by name, phone, email, qrCode, regId, or partial regId suffix (case-insensitive)
const findParticipantByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const safeIdentifier = String(identifier).trim();
  if (safeIdentifier === "") return null;

  const conditions = [
    { phone: safeIdentifier },
    { email: { $regex: new RegExp(`^${safeIdentifier}$`, "i") } },
    { qrCode: { $regex: new RegExp(`^${safeIdentifier}$`, "i") } },
    { regId: { $regex: new RegExp(`^${safeIdentifier}$`, "i") } },
    { regId: { $regex: new RegExp(safeIdentifier + "$", "i") } }, // matches suffix like "KHFR480" for "RegID - KHFR480"
    { name: { $regex: new RegExp(`^${safeIdentifier}$`, "i") } }
  ];

  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    conditions.push({ _id: safeIdentifier });
  }

  return await Participant.findOne({ $or: conditions });
};

// CREATE participant
export const createParticipant = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Participant name is required" });
    }
    const participant = await Participant.create(req.body);
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BASIC SCAN (General check-in)
export const scanQR = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    user.isCheckedIn = true; 
    await user.save();
    
    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 1. VERIFY AND SCAN (Kitbag / Certificate)
export const verifyAndScan = async (req, res) => {
  try {
    const { identifier, scanType } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    // Access Logic: Check if blocked
    const blockKey = `block${scanType.charAt(0).toUpperCase() + scanType.slice(1)}`;
    if (user[blockKey] === true) {
      return res.status(403).json({ 
        msg: `Access Denied: ${scanType} is restricted.`,
        blocked: true 
      });
    }

    // Check if already collected (Duplicate scanning warning)
    if (scanType === "kitbag" && user.kitbagCollected) {
      return res.status(409).json({
        msg: "Kitbag has already been collected by this participant.",
        alreadyScanned: true,
        user
      });
    }
    if (scanType === "certificate" && user.certificateGiven) {
      return res.status(409).json({
        msg: "Certificate has already been issued to this participant.",
        alreadyScanned: true,
        user
      });
    }

    // Update Logic
    if (scanType === "kitbag") user.kitbagCollected = true;
    if (scanType === "certificate") user.certificateGiven = true;

    await user.save();
    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. FOOD SCAN (Day-specific meals) - called with { identifier, mealType: "day1-lunch" }
export const scanFood = async (req, res) => {
  try {
    const { identifier, mealType } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    // Parse day and meal from mealType (e.g., "day1-lunch")
    const [dayPart, mealPart] = mealType.split("-");
    const day = dayPart.replace("day", "");
    const meal = mealPart.charAt(0).toUpperCase() + mealPart.slice(1);
    const blockKey = `blockDay${day}${meal}`;

    if (user[blockKey] === true) {
      return res.status(403).json({
        msg: `Access Denied: ${meal} on Day ${day} is restricted for this participant.`,
        blocked: true
      });
    }

    // Check if already collected (Mongoose Map uses .get())
    if (user.foodLogs && user.foodLogs.get(mealType)) {
      return res.status(409).json({
        msg: `Already collected ${meal} on Day ${day}.`,
        alreadyScanned: true,
        user
      });
    }

    // Mark as collected using Mongoose Map .set()
    user.foodLogs.set(mealType, true);
    await user.save();

    // Broadcast real-time update
    broadcastFoodUpdate(user, mealType);

    res.json({ success: true, message: `${meal} on Day ${day} logged successfully.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GENERAL CHECK-IN (marks isCheckedIn = true)
export const checkInParticipant = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });
    if (user.isCheckedIn) {
      return res.status(409).json({ msg: `${user.name} has already checked in.`, alreadyCheckedIn: true, user });
    }

    user.isCheckedIn = true;
    await user.save();

    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });
    res.json({ success: true, message: `${user.name} checked in successfully.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. HALL SCAN (Entry / Exit)
export const scanHall = async (req, res) => {
  try {
    const { identifier, mode } = req.body; // mode: "entry" or "exit"
    const user = await findParticipantByIdentifier(identifier);
    if (!user) return res.status(404).json({ msg: "Participant not found" });

    const now = new Date();
    const THRESHOLD_MS = 30000;

    if (mode === "entry") {
      const lastEntry = user.hallEntries && user.hallEntries.length > 0 ? new Date(user.hallEntries[user.hallEntries.length - 1]) : null;
      if (lastEntry && (now - lastEntry < THRESHOLD_MS)) {
        return res.status(409).json({
          msg: `Duplicate scan: Entry was already logged recently.`,
          alreadyScanned: true,
          user
        });
      }
      user.hallEntries.push(now);
    } else if (mode === "exit") {
      const lastExit = user.hallExits && user.hallExits.length > 0 ? new Date(user.hallExits[user.hallExits.length - 1]) : null;
      if (lastExit && (now - lastExit < THRESHOLD_MS)) {
        return res.status(409).json({
          msg: `Duplicate scan: Exit was already logged recently.`,
          alreadyScanned: true,
          user
        });
      }
      user.hallExits.push(now);
    } else {
      return res.status(400).json({ msg: "Invalid scan mode" });
    }

    await user.save();
    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });

    res.json({ 
      success: true, 
      message: `Hall ${mode === "entry" ? "Entry" : "Exit"} logged successfully for ${user.name}.`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. WORKSHOP SCAN (Attended workshops 1-5)
export const scanWorkshop = async (req, res) => {
  try {
    const { identifier, workshop } = req.body; // workshop: "workshop1", "workshop2", etc.
    const user = await findParticipantByIdentifier(identifier);
    if (!user) return res.status(404).json({ msg: "Participant not found" });

    const match = workshop.match(/^workshop(\d)$/);
    if (!match) return res.status(400).json({ msg: "Invalid workshop identifier" });
    
    const workshopNum = match[1];
    const blockKey = `blockWorkshop${workshopNum}`;

    if (user[blockKey] === true) {
      return res.status(403).json({
        msg: `Access Denied: Participant is blocked from Workshop ${workshopNum}.`,
        blocked: true
      });
    }

    if (user.workshopScans && user.workshopScans.includes(workshop)) {
      return res.status(409).json({
        msg: `Already attended Workshop ${workshopNum}.`,
        alreadyScanned: true,
        user
      });
    }

    user.workshopScans.push(workshop);
    await user.save();
    
    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });

    res.json({ 
      success: true, 
      message: `Checked in for Workshop ${workshopNum} successfully.`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};