import Participant from "../models/Participant.js";
import { getIO } from "../socket.js";

// CREATE participant
export const createParticipant = async (req, res) => {
  try {
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
    const user = await Participant.findOne({
      $or: [{ phone: identifier }, { qrCode: identifier }, { regId: identifier }]
    });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    user.isCheckedIn = true; // CHANGED from checkedIn
    await user.save();
    
    getIO().to(user.conferenceId).emit("participant-updated", { participantId: user._id });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// VERIFY AND SCAN (Restricted items: Kitbag/Certificate)
export const verifyAndScan = async (req, res) => {
  try {
    const { identifier, scanType } = req.body;

    const user = await Participant.findOne({
      $or: [{ phone: identifier }, { qrCode: identifier }, { regId: identifier }, { name: identifier }]
    });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    // Access Logic: Check if blocked
    const blockKey = `block${scanType.charAt(0).toUpperCase() + scanType.slice(1)}`;
    if (user[blockKey] === true) {
      return res.status(403).json({ 
        msg: `Access Denied: ${scanType} is restricted.`,
        blocked: true 
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

// FOOD SCAN (Day-specific meals)
export const scanFood = async (req, res) => {
  try {
    const { qrCode, mealType } = req.body; // e.g., mealType: "day1-lunch"
    const user = await Participant.findOne({ qrCode });

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    if (!user.foodLogs) user.foodLogs = {};
    user.foodLogs[mealType] = true;
    
    await user.save();

    // Broadcast to dashboard
    getIO().to(user.conferenceId).emit("food-updated", { 
      participantId: user._id, 
      meal: mealType 
    });

    res.json({ success: true, message: "Food logged successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};