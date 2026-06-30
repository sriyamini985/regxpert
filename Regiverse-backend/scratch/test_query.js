import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const ConferenceSchema = new mongoose.Schema({}, { strict: false });
const Conference = mongoose.model("Conference", ConferenceSchema, "conferences");

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema, "participants");

const findParticipantByIdentifier = async (identifier, conferenceIdOrSlug) => {
  if (!identifier) return null;
  let safeIdentifier = String(identifier).trim();
  if (safeIdentifier === "") return null;

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
    }
  }

  // --- FAST-PATH EXACT INDEXED MATCHES ---
  // Match prefix like "reg id:", "regid:", "id:", "id -", "id :", case-insensitive, with optional spaces/dashes/colons
  const prefixRegex = /^(?:reg\s*id|regid|id)\s*[-\s:]*/i;
  let cleanRaw = safeIdentifier.replace(prefixRegex, "").trim();

  // Multi-line parser check
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

  const exactConditions = [];
  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    exactConditions.push({ _id: safeIdentifier });
  }
  if (cleanRaw) {
    exactConditions.push({ regId: cleanRaw });
    exactConditions.push({ qrCode: cleanRaw });
    exactConditions.push({ phone: cleanRaw });
    exactConditions.push({ email: cleanRaw });
  }
  if (regIdFromQR) {
    exactConditions.push({ regId: regIdFromQR });
    if (mongoose.Types.ObjectId.isValid(regIdFromQR)) {
      exactConditions.push({ _id: regIdFromQR });
    }
  }

  if (exactConditions.length > 0) {
    let exactQuery = {
      ...conferenceFilter,
      $or: exactConditions
    };
    const exactResult = await Participant.findOne(exactQuery);
    if (exactResult) {
      return exactResult;
    }
  }

  // ----------------------------------------
  const escapeRegExp = (string) => string ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
  const conditions = [];

  if (regIdFromQR) {
    const escapedRegId = escapeRegExp(regIdFromQR);
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedRegId}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(escapedRegId + "\\s*$", "i") } });
  }

  if (safeIdentifier) {
    const escapedCleanRaw = escapeRegExp(cleanRaw);
    conditions.push({ phone: cleanRaw });
    conditions.push({ email: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ qrCode: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(escapedCleanRaw + "\\s*$", "i") } });
    conditions.push({ name: { $regex: new RegExp(`^\\s*${escapedCleanRaw}\\s*$`, "i") } });
  }

  let query = {
    ...conferenceFilter,
    $or: conditions
  };

  const result = await Participant.findOne(query);
  return result;
};

async function test() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  const sample = await Participant.findOne({ regId: /^ID -/ });
  if (sample) {
    console.log(`Found sample in DB: name="${sample.name}", regId="${sample.regId}"`);
    
    // Test matching with raw suffix
    const suffix = sample.regId.replace("ID - ", "");
    console.log(`Test raw suffix "${suffix}":`, !!(await findParticipantByIdentifier(suffix, sample.conferenceId)));

    // Test matching with "ID: " prefix
    const colonPrefix = `ID: ${suffix}`;
    console.log(`Test "ID: " prefix "${colonPrefix}":`, !!(await findParticipantByIdentifier(colonPrefix, sample.conferenceId)));

    // Test matching with "ID : " prefix
    const colonPrefix2 = `ID : ${suffix}`;
    console.log(`Test "ID : " prefix "${colonPrefix2}":`, !!(await findParticipantByIdentifier(colonPrefix2, sample.conferenceId)));

    // Test matching with "Reg ID: " prefix
    const regIdPrefix = `Reg ID: ${suffix}`;
    console.log(`Test "Reg ID: " prefix "${regIdPrefix}":`, !!(await findParticipantByIdentifier(regIdPrefix, sample.conferenceId)));
  } else {
    console.log("No sample starting with 'ID -' found.");
  }

  await mongoose.disconnect();
}

test().catch(console.error);
