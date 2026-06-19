import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema);

const findParticipantByIdentifierTest = async (identifier) => {
  if (!identifier) return null;
  let safeIdentifier = String(identifier).trim();
  if (safeIdentifier === "") return null;

  // Multi-line parser
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

  const conditions = [];

  if (regIdFromQR) {
    conditions.push({ regId: { $regex: new RegExp(`^${regIdFromQR}$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(regIdFromQR + "$", "i") } });
  }
  if (nameFromQR) {
    conditions.push({ name: { $regex: new RegExp(`^${nameFromQR}$`, "i") } });
  }
  if (emailFromQR) {
    conditions.push({ email: { $regex: new RegExp(`^${emailFromQR}$`, "i") } });
  }
  if (phoneFromQR) {
    conditions.push({ phone: phoneFromQR });
  }

  if (safeIdentifier) {
    let cleanRaw = safeIdentifier;
    if (safeIdentifier.toLowerCase().startsWith("name:")) {
      cleanRaw = safeIdentifier.substring(5).trim();
    } else if (safeIdentifier.toLowerCase().startsWith("reg id:") || safeIdentifier.toLowerCase().startsWith("regid:")) {
      cleanRaw = safeIdentifier.split(":").slice(1).join(":").trim();
    }

    conditions.push({ phone: cleanRaw });
    conditions.push({ email: { $regex: new RegExp(`^${cleanRaw}$`, "i") } });
    conditions.push({ qrCode: { $regex: new RegExp(`^${cleanRaw}$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(`^${cleanRaw}$`, "i") } });
    conditions.push({ regId: { $regex: new RegExp(cleanRaw + "$", "i") } });
    conditions.push({ name: { $regex: new RegExp(`^${cleanRaw}$`, "i") } });
  }

  if (mongoose.Types.ObjectId.isValid(safeIdentifier)) {
    conditions.push({ _id: safeIdentifier });
  }
  
  if (regIdFromQR && mongoose.Types.ObjectId.isValid(regIdFromQR)) {
    conditions.push({ _id: regIdFromQR });
  }

  if (conditions.length === 0) return null;
  return await Participant.findOne({ $or: conditions });
};

async function run() {
  console.log("Connecting to:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected!");

  // Find one participant to use as target details
  const sample = await Participant.findOne({ name: { $exists: true, $ne: "" } });
  if (!sample) {
    console.log("No sample participant in DB.");
    await mongoose.disconnect();
    return;
  }

  console.log(`\nTarget Delegate: Name=${sample.name}, RegID=${sample.regId}, Phone=${sample.phone}`);

  // Test Case 1: Raw RegID Suffix (e.g. suffix like "VMUX151" or full "RegID - VMUX151")
  console.log("\n--- TEST CASE 1: Full RegID string ---");
  const p1 = await findParticipantByIdentifierTest(sample.regId);
  console.log("Found:", p1 ? `YES (Name: ${p1.name})` : "NO");

  // Test Case 2: Multi-line QR string
  console.log("\n--- TEST CASE 2: Multi-line scanned details ---");
  const multiLineInput = `Name: ${sample.name}\nReg ID: ${sample.regId}\nCategory: Speaker\nStatus: Registered`;
  const p2 = await findParticipantByIdentifierTest(multiLineInput);
  console.log("Found:", p2 ? `YES (Name: ${p2.name})` : "NO");

  // Test Case 3: Cutoff barcode input ("Name: satyabhama")
  console.log("\n--- TEST CASE 3: Cutoff Name string ---");
  const p3 = await findParticipantByIdentifierTest(`Name: ${sample.name}`);
  console.log("Found:", p3 ? `YES (Name: ${p3.name})` : "NO");

  // Test Case 4: Cutoff RegID string ("Reg ID: RegID - VMUX151")
  console.log("\n--- TEST CASE 4: Cutoff RegID string ---");
  const p4 = await findParticipantByIdentifierTest(`Reg ID: ${sample.regId}`);
  console.log("Found:", p4 ? `YES (Name: ${p4.name})` : "NO");

  await mongoose.disconnect();
  console.log("\nDisconnect completed.");
}

run().catch(console.error);
