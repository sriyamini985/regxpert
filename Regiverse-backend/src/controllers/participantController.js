import Participant from "../models/Participant.js";
import { io } from "../server.js";
import { getIO } from "../socket.js";

// CREATE participant (from Excel later)
export const createParticipant = async (req, res) => {
  try {
    const participant = await Participant.create(req.body);
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SCAN QR
export const scanQR = async (req, res) => {
  try {
    const { qrCode, type } = req.body;

    const user = await Participant.findOne({ qrCode });
    console.log("QR scan request:", req.body);
    console.log("User found:", user);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🔥 SAME LOGIC FOR ALL SCANS
    if (type === "checkin") user.isCheckedIn = true;
    if (type === "food") user.foodScanned = true;
    if (type === "kit") user.kitbagCollected = true;
    if (type === "certificate") user.certificateGiven = true;

    if (type === "hall") user.hallEntries.push(new Date());
    if (type === "workshop") user.workshopScans.push(new Date().toISOString());

    await user.save();
    
  const io = getIO();

io.to(user.conferenceId).emit(
  "participant-updated",
  {
    participantId: user._id,
    conferenceId: user.conferenceId,
    scanType: type,
  }
);
    
    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};