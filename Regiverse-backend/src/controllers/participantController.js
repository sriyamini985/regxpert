import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import { 
  broadcastParticipantCreated, 
  broadcastParticipantUpdated, 
  broadcastParticipantDeleted,
  broadcastBulkImport
} from "../socket.js";
import xlsx from "xlsx";

// Centralized helper function to find a participant by name, phone, email, qrCode, regId, or partial regId suffix (case-insensitive)
const findParticipantByIdentifier = async (identifier) => {
  console.log(`[SCAN DEBUG] Received identifier: "${identifier}" (Type: ${typeof identifier})`);
  if (!identifier) return null;
  let safeIdentifier = String(identifier).trim();
  if (safeIdentifier === "") return null;

  // Log char codes to detect hidden symbols
  const charCodes = [];
  for (let i = 0; i < Math.min(safeIdentifier.length, 100); i++) {
    charCodes.push(safeIdentifier.charCodeAt(i));
  }
  console.log(`[SCAN DEBUG] Cleaned safeIdentifier: "${safeIdentifier}" (CharCodes: ${charCodes.join(",")})`);

  // Multi-line or key-value format parser
  let nameFromQR = "";
  let regIdFromQR = "";
  let emailFromQR = "";
  let phoneFromQR = "";

  const lines = safeIdentifier.split(/[\n\r]+/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    const lowerLine = trimmedLine.toLowerCase();
    
    if (lowerLine.startsWith("reg id:") || lowerLine.startsWith("regid:")) {
      const parts = trimmedLine.split(":");
      if (parts[1]) regIdFromQR = parts.slice(1).join(":").trim();
    } else if (lowerLine.startsWith("name:")) {
      const parts = trimmedLine.split(":");
      if (parts[1]) nameFromQR = parts.slice(1).join(":").trim();
    } else if (lowerLine.startsWith("email:")) {
      const parts = trimmedLine.split(":");
      if (parts[1]) emailFromQR = parts.slice(1).join(":").trim();
    } else if (lowerLine.startsWith("phone:") || lowerLine.startsWith("mobile:") || lowerLine.startsWith("phone number:")) {
      const parts = trimmedLine.split(":");
      if (parts[1]) phoneFromQR = parts.slice(1).join(":").trim();
    }
  }

  console.log(`[SCAN DEBUG] Parsed details: regIdFromQR="${regIdFromQR}", nameFromQR="${nameFromQR}", emailFromQR="${emailFromQR}", phoneFromQR="${phoneFromQR}"`);

  const conditions = [];

  // 1. If structured attributes were successfully parsed:
  if (regIdFromQR) {
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${regIdFromQR}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(regIdFromQR + "\\s*$", "i") } });
  }
  if (nameFromQR) {
    conditions.push({ name: { $regex: new RegExp(`^\\s*${nameFromQR}\\s*$`, "i") } });
  }
  if (emailFromQR) {
    conditions.push({ email: { $regex: new RegExp(`^\\s*${emailFromQR}\\s*$`, "i") } });
  }
  if (phoneFromQR) {
    conditions.push({ phone: phoneFromQR });
  }

  // 2. Also match against raw identifier as fallback (cleaning common prefix labels)
  if (safeIdentifier) {
    let cleanRaw = safeIdentifier;
    if (safeIdentifier.toLowerCase().startsWith("name:")) {
      cleanRaw = safeIdentifier.substring(5).trim();
    } else if (safeIdentifier.toLowerCase().startsWith("reg id:") || safeIdentifier.toLowerCase().startsWith("regid:")) {
      cleanRaw = safeIdentifier.split(":").slice(1).join(":").trim();
    }

    conditions.push({ phone: cleanRaw });
    conditions.push({ email: { $regex: new RegExp(`^\\s*${cleanRaw}\\s*$`, "i") } });
    conditions.push({ qrCode: { $regex: new RegExp(`^\\s*${cleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${cleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(cleanRaw + "\\s*$", "i") } });
    conditions.push({ name: { $regex: new RegExp(`^\\s*${cleanRaw}\\s*$`, "i") } });
  }

  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    conditions.push({ _id: safeIdentifier });
  }
  
  if (regIdFromQR && mongoose.Types.ObjectId.isValid(regIdFromQR)) {
    conditions.push({ _id: regIdFromQR });
  }

  console.log(`[SCAN DEBUG] Generated ${conditions.length} query conditions:`, JSON.stringify(conditions));

  if (conditions.length === 0) return null;
  const result = await Participant.findOne({ $or: conditions });
  console.log(`[SCAN DEBUG] Query result:`, result ? `Found (ID: ${result._id}, Name: "${result.name}")` : "Not Found");
  return result;
};

// 1. BULK EXCEL IMPORT CONTROLLER
export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conference identifier context." });
    }

    const cleanConferenceId = String(conferenceId).trim();

    // Parse the uploaded excel sheet buffer directly from memory
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, msg: "The uploaded sheet is empty." });
    }

    // Map rows cleanly to fit schema profile fields
    const processedParticipants = rawRows.map((row) => ({
      name: row.Name || row.name || "Unknown Delegate",
      email: row.Email || row.email || "",
      company: row.Company || row.company || "",
      phone: String(row.Phone || row.phone || ""),
      regId: String(row.RegId || row.regId || row.id || ""),
      qrCode: String(row.QrCode || row.qrcode || row.RegId || row.regId || ""),
      status: "pending",
      conferenceId: cleanConferenceId,
      isCheckedIn: false,
      printed: false,
      kitbagCollected: false,
      certificateGiven: false,
      foodLogs: {}
    }));

    // Save batch items directly to MongoDB
    const insertedRecords = await Participant.insertMany(processedParticipants);

    // Alert the workspace dashboard sockets that a bulk load completed
    broadcastBulkImport(cleanConferenceId);

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      msg: "Roster imported successfully." 
    });

  } catch (err) {
    console.error("EXCEL IMPORT RUNTIME CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. CREATE PARTICIPANT
export const createParticipant = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Participant name is required" });
    }
    const participant = await Participant.create(req.body);
    broadcastParticipantCreated(participant);
    res.json(participant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. BASIC SCAN (General check-in)
export const scanQR = async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    user.isCheckedIn = true;
    await user.save();
    
    broadcastParticipantUpdated(user);
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. VERIFY AND SCAN (Restricted items: Kitbag/Certificate)
export const verifyAndScan = async (req, res) => {
  try {
    const { identifier, scanType } = req.body;
    const user = await findParticipantByIdentifier(identifier);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

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

    if (scanType === "kitbag") user.kitbagCollected = true;
    if (scanType === "certificate") user.certificateGiven = true;

    await user.save();
    broadcastParticipantUpdated(user);

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. FOOD SCAN (Day-specific meals)
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

    // Check if already collected
    if (user.foodLogs && user.foodLogs.get(mealType)) {
      return res.status(409).json({
        msg: `Already collected ${meal} on Day ${day}.`,
        alreadyScanned: true,
        user
      });
    }

    user.foodLogs.set(mealType, true);
    await user.save();

    broadcastParticipantUpdated(user);

    res.json({ success: true, message: `${meal} on Day ${day} logged successfully.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. GENERAL CHECK-IN (marks isCheckedIn = true)
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

    broadcastParticipantUpdated(user);
    res.json({ success: true, message: `${user.name} checked in successfully.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. PATH ENTRY / EXIT SCAN
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
    broadcastParticipantUpdated(user);

    res.json({ 
      success: true, 
      message: `Hall ${mode === "entry" ? "Entry" : "Exit"} logged successfully for ${user.name}.`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. WORKSHOP SCAN
export const scanWorkshop = async (req, res) => {
  try {
    const { identifier, workshop } = req.body;
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
    
    broadcastParticipantUpdated(user);

    res.json({ 
      success: true, 
      message: `Checked in for Workshop ${workshopNum} successfully.`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};