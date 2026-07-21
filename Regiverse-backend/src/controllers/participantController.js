import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { 
  broadcastParticipantCreated, 
  broadcastParticipantUpdated, 
  broadcastParticipantDeleted,
  broadcastBulkImport
} from "../socket.js";

// Centralized helper function to find a participant by name, phone, email, qrCode, regId, or partial regId suffix (case-insensitive)
const findParticipantByIdentifier = async (identifier, conferenceIdOrSlug) => {
  console.log(`[SCAN DEBUG] Received identifier: "${identifier}" (Type: ${typeof identifier}), conferenceIdOrSlug: "${conferenceIdOrSlug}"`);
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
    
    if (lowerLine.startsWith("reg id:") || lowerLine.startsWith("regid:") || lowerLine.startsWith("id:") || lowerLine.startsWith("id :")) {
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

  // Resolve conference filter if specified
  let conferenceFilter = {};
  if (conferenceIdOrSlug) {
    const cleanConf = String(conferenceIdOrSlug).trim();
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConf) ? cleanConf : undefined },
        { slug: cleanConf },
        { name: cleanConf }
      ].filter(Boolean)
    });
    if (targetConference) {
      conferenceFilter = { conferenceId: String(targetConference._id) };
    } else {
      conferenceFilter = {
        $or: [
          { conferenceId: cleanConf },
          { conferenceName: cleanConf }
        ]
      };
    }
  }

  // --- FAST-PATH EXACT INDEXED MATCHES ---
  let cleanRaw = safeIdentifier;
  if (safeIdentifier.toLowerCase().startsWith("name:")) {
    cleanRaw = safeIdentifier.substring(5).trim();
  } else {
    const prefixRegex = /^(?:reg\s*id|regid|id)\s*[-\s:]*/i;
    cleanRaw = safeIdentifier.replace(prefixRegex, "").trim();
  }

  const exactConditions = [];
  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    exactConditions.push({ _id: safeIdentifier });
  }
  if (cleanRaw) {
    exactConditions.push({ regId: cleanRaw });
    exactConditions.push({ regId: safeIdentifier });
    exactConditions.push({ qrCode: cleanRaw });
    exactConditions.push({ qrCode: safeIdentifier });
    exactConditions.push({ phone: cleanRaw });
    exactConditions.push({ email: cleanRaw });
  }
  if (regIdFromQR) {
    exactConditions.push({ regId: regIdFromQR });
    if (mongoose.Types.ObjectId.isValid(regIdFromQR)) {
      exactConditions.push({ _id: regIdFromQR });
    }
  }
  if (phoneFromQR) {
    exactConditions.push({ phone: phoneFromQR });
  }
  if (emailFromQR) {
    exactConditions.push({ email: emailFromQR });
  }

  if (exactConditions.length > 0) {
    let exactQuery = { $or: exactConditions };
    if (conferenceIdOrSlug) {
      if (conferenceFilter.$or) {
        exactQuery = {
          $and: [
            { $or: exactConditions },
            { $or: conferenceFilter.$or }
          ]
        };
      } else {
        exactQuery = {
          ...conferenceFilter,
          $or: exactConditions
        };
      }
    }
    const exactResult = await Participant.findOne(exactQuery);
    if (exactResult) {
      console.log(`[SCAN DEBUG] Fast-path exact match found: (ID: ${exactResult._id}, Name: "${exactResult.name}")`);
      return exactResult;
    }
  }
  // ----------------------------------------
  const escapeRegExp = (string) => string ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
  const conditions = [];

  // 1. If structured attributes were successfully parsed:
  if (regIdFromQR) {
    const escapedRegId = escapeRegExp(regIdFromQR);
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedRegId}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(escapedRegId + "\\s*$", "i") } });
  }
  if (nameFromQR) {
    const escapedName = escapeRegExp(nameFromQR);
    conditions.push({ name: { $regex: new RegExp(`^\\s*${escapedName}\\s*$`, "i") } });
  }
  if (emailFromQR) {
    const escapedEmail = escapeRegExp(emailFromQR);
    conditions.push({ email: { $regex: new RegExp(`^\\s*${escapedEmail}\\s*$`, "i") } });
  }
  if (phoneFromQR) {
    conditions.push({ phone: phoneFromQR });
  }

  // 2. Also match against raw identifier as fallback (cleaning common prefix labels)
  if (safeIdentifier) {
    const escapedCleanRaw = escapeRegExp(cleanRaw);
    conditions.push({ phone: cleanRaw });
    conditions.push({ email: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ qrCode: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(escapedCleanRaw + "\\s*$", "i") } });
    // Exact full-name match
    conditions.push({ name: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    // Substring / contains match on name (allows partial name scans like "Rohit" → "Dr. Rohit Agarwal")
    // Only trigger for inputs >= 3 characters to avoid false positives
    if (cleanRaw.length >= 3) {
      conditions.push({ name: { $regex: new RegExp(escapedCleanRaw, "i") } });
    }
  }

  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    conditions.push({ _id: safeIdentifier });
  }
  
  if (regIdFromQR && mongoose.Types.ObjectId.isValid(regIdFromQR)) {
    conditions.push({ _id: regIdFromQR });
  }

  console.log(`[SCAN DEBUG] Generated ${conditions.length} query conditions fallback:`, JSON.stringify(conditions));

  if (conditions.length === 0) return null;
  
  let query = { $or: conditions };
  if (conferenceIdOrSlug) {
    if (conferenceFilter.$or) {
      query = {
        $and: [
          { $or: conditions },
          { $or: conferenceFilter.$or }
        ]
      };
    } else {
      query = {
        ...conferenceFilter,
        $or: conditions
      };
    }
  }

  const result = await Participant.findOne(query);
  console.log(`[SCAN DEBUG] Query result fallback:`, result ? `Found (ID: ${result._id}, Name: "${result.name}")` : "Not Found");
  return result;
};

// Same as findParticipantByIdentifier but returns ALL matches (for disambiguation when multiple share the same qrCode/regId)
const findAllParticipantsByIdentifier = async (identifier, conferenceIdOrSlug) => {
  if (!identifier) return [];
  let safeIdentifier = String(identifier).trim();
  if (safeIdentifier === "") return [];

  // Resolve conference filter
  let conferenceFilter = {};
  if (conferenceIdOrSlug) {
    const cleanConf = String(conferenceIdOrSlug).trim();
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConf) ? cleanConf : undefined },
        { slug: cleanConf },
        { name: cleanConf }
      ].filter(Boolean)
    });
    if (targetConference) {
      conferenceFilter = { conferenceId: String(targetConference._id) };
    }
  }

  // Strip prefix labels
  let cleanRaw = safeIdentifier;
  if (safeIdentifier.toLowerCase().startsWith("name:")) {
    cleanRaw = safeIdentifier.substring(5).trim();
  } else {
    const prefixRegex = /^(?:reg\s*id|regid|id)\s*[-\s:]*/i;
    cleanRaw = safeIdentifier.replace(prefixRegex, "").trim();
  }

  const conditions = [];
  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) conditions.push({ _id: safeIdentifier });
  if (cleanRaw) {
    conditions.push({ regId: cleanRaw });
    conditions.push({ regId: safeIdentifier });
    conditions.push({ qrCode: cleanRaw });
    conditions.push({ qrCode: safeIdentifier });
    conditions.push({ phone: cleanRaw });
    conditions.push({ email: cleanRaw });
    
    // Fallback regex matching for regId/qrCode to ensure prefix-based identifiers are resolved
    const escapedCleanRaw = cleanRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedSafe = safeIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedSafe}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(escapedCleanRaw + "\\s*$", "i") } });
  }

  if (conditions.length === 0) return [];

  const query = conferenceFilter.conferenceId
    ? { ...conferenceFilter, $or: conditions }
    : { $or: conditions };

  return await Participant.find(query).lean();
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
    const { identifier, conferenceId } = req.body;
    const user = await findParticipantByIdentifier(identifier, conferenceId);

    if (!user) return res.status(404).json({ msg: "Participant not found" });

    if (user.isCheckedIn) {
      const scanDate = user.checkInTime ? new Date(user.checkInTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `${user.name} has already checked in. (First checked in on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyCheckedIn: true,
        user
      });
    }

    user.isCheckedIn = true;
    user.checkInTime = new Date();
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
    const { identifier, scanType, conferenceId, participantId } = req.body;
    let user;

    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      // Explicit selection by operator
      user = await Participant.findById(participantId);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    } else {
      // General scan lookup
      const allMatches = await findAllParticipantsByIdentifier(identifier, conferenceId);

      if (allMatches.length === 0) {
        return res.status(404).json({ msg: "Participant not found" });
      }

      if (allMatches.length > 1) {
        // Return multiple matches for disambiguation
        return res.status(300).json({
          multipleMatches: true,
          msg: `Multiple participants found for "${identifier}". Please select the correct person.`,
          participants: allMatches.map(p => ({
            _id: p._id,
            name: p.name,
            regId: p.regId,
            phone: p.phone || "",
            category: p.category || "",
            isCheckedIn: p.isCheckedIn || false,
            printed: p.printed || false,
            kitbagCollected: p.kitbagCollected || false,
            certificateGiven: p.certificateGiven || false,
            foodLogs: p.foodLogs || {},
            workshopScans: p.workshopScans || []
          }))
        });
      }

      user = await Participant.findById(allMatches[0]._id);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    }

    // Determine the corresponding block key and field mapping dynamically
    let isKitbag = false;
    let isCertificate = false;
    let blockKey;

    if (typeof scanType === "string" && scanType.startsWith("kitbag")) {
      isKitbag = true;
      blockKey = "blockKitbag";
    } else if (typeof scanType === "string" && scanType.startsWith("certificate")) {
      isCertificate = true;
      blockKey = "blockCertificate";
    } else {
      blockKey = `block${scanType.charAt(0).toUpperCase() + scanType.slice(1)}`;
    }

    if (user[blockKey] === true) {
      return res.status(403).json({ 
        msg: `Access Denied: ${scanType} is restricted.`,
        blocked: true,
        user
      });
    }

    // Check if already collected (Duplicate scanning warning)
    if (isKitbag && user.kitbagCollected) {
      const scanDate = user.kitbagCollectedTime ? new Date(user.kitbagCollectedTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `Kitbag has already been collected by this participant. (Collected on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyScanned: true,
        user
      });
    }
    if (isCertificate && user.certificateGiven) {
      const scanDate = user.certificateGivenTime ? new Date(user.certificateGivenTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `Certificate has already been issued to this participant. (Issued on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyScanned: true,
        user
      });
    }

    if (isKitbag) {
      user.kitbagCollected = true;
      user.kitbagCollectedTime = new Date();
    }
    if (isCertificate) {
      user.certificateGiven = true;
      user.certificateGivenTime = new Date();
    }

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
    const { identifier, mealType, conferenceId, participantId } = req.body;
    let user;

    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      // Explicit selection by operator
      user = await Participant.findById(participantId);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    } else {
      // General scan lookup
      const allMatches = await findAllParticipantsByIdentifier(identifier, conferenceId);

      if (allMatches.length === 0) {
        return res.status(404).json({ msg: "Participant not found" });
      }

      if (allMatches.length > 1) {
        // Return multiple matches for disambiguation
        return res.status(300).json({
          multipleMatches: true,
          msg: `Multiple participants found for "${identifier}". Please select the correct person.`,
          participants: allMatches.map(p => ({
            _id: p._id,
            name: p.name,
            regId: p.regId,
            phone: p.phone || "",
            category: p.category || "",
            isCheckedIn: p.isCheckedIn || false,
            printed: p.printed || false,
            kitbagCollected: p.kitbagCollected || false,
            certificateGiven: p.certificateGiven || false,
            foodLogs: p.foodLogs || {},
            workshopScans: p.workshopScans || []
          }))
        });
      }

      user = await Participant.findById(allMatches[0]._id);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    }

    // Parse day and meal from mealType (e.g., "day1-lunch")
    const [dayPart, mealPart] = mealType.split("-");
    const day = dayPart.replace("day", "");
    const meal = mealPart.charAt(0).toUpperCase() + mealPart.slice(1);
    const blockKey = `blockDay${day}${meal}`;

    if (user[blockKey] === true) {
      return res.status(403).json({
        msg: `Access Denied: ${meal} on Day ${day} is restricted for this participant.`,
        blocked: true,
        user
      });
    }

    // Check if already collected
    if (user.foodLogs && user.foodLogs.get(mealType)) {
      const scanTime = user.foodScanTimes ? user.foodScanTimes.get(mealType) : null;
      const scanDate = scanTime ? new Date(scanTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `Already collected ${meal} on Day ${day}. (Collected on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyScanned: true,
        user
      });
    }

    if (!user.foodLogs) {
      user.foodLogs = new Map();
    }
    user.foodLogs.set(mealType, true);
    user.markModified("foodLogs");

    if (!user.foodScanTimes) {
      user.foodScanTimes = new Map();
    }
    user.foodScanTimes.set(mealType, new Date());
    user.markModified("foodScanTimes");

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
    const { identifier, conferenceId } = req.body;
    const user = await findParticipantByIdentifier(identifier, conferenceId);

    if (!user) return res.status(404).json({ msg: "Participant not found" });
    if (user.isCheckedIn) {
      const scanDate = user.checkInTime ? new Date(user.checkInTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `${user.name} has already checked in. (First checked in on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyCheckedIn: true,
        user
      });
    }

    user.isCheckedIn = true;
    user.checkInTime = new Date();
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
    const { identifier, mode, conferenceId, participantId } = req.body; // mode: "entry" or "exit"

    let user;

    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      // Operator explicitly confirmed which person to log (disambiguation flow)
      user = await Participant.findById(participantId);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    } else {
      // First check if multiple participants share the same scanned identifier
      const allMatches = await findAllParticipantsByIdentifier(identifier, conferenceId);

      if (allMatches.length === 0) {
        return res.status(404).json({ msg: "Participant not found" });
      }

      if (allMatches.length > 1) {
        // Multiple people share the same QR/regId — ask the operator to pick the correct one
        return res.status(300).json({
          multipleMatches: true,
          msg: `Multiple participants found for "${identifier}". Please select the correct person.`,
          participants: allMatches.map(p => ({
            _id: p._id,
            name: p.name,
            regId: p.regId,
            phone: p.phone || "",
            category: p.category || "",
            hallEntries: p.hallEntries || [],
            hallExits: p.hallExits || []
          }))
        });
      }

      user = await Participant.findById(allMatches[0]._id);
      if (!user) return res.status(404).json({ msg: "Participant not found" });
    }

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
    const { identifier, workshop, conferenceId } = req.body;
    const user = await findParticipantByIdentifier(identifier, conferenceId);
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
      const scanTime = user.workshopScanTimes ? user.workshopScanTimes.get(workshop) : null;
      const scanDate = scanTime ? new Date(scanTime) : new Date(user.updatedAt);
      return res.status(409).json({
        msg: `Already attended Workshop ${workshopNum}. (Checked in on ${scanDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })})`,
        alreadyScanned: true,
        user
      });
    }

    user.workshopScans.push(workshop);
    if (!user.workshopScanTimes) {
      user.workshopScanTimes = new Map();
    }
    user.workshopScanTimes.set(workshop, new Date());
    user.markModified("workshopScanTimes");

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