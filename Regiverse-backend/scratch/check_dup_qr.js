import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema, "participants");

const ConferenceSchema = new mongoose.Schema({}, { strict: false });
const Conference = mongoose.model("Conference", ConferenceSchema, "conferences");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  // Find the ISVIR 2026 conference
  const conf = await Conference.findOne({ slug: "isvir-2026" });
  if (!conf) {
    console.log("No conference with slug 'isvir-2026' found.");
    await mongoose.disconnect();
    return;
  }
  console.log(`Conference: ${conf.name} (ID: ${conf._id})\n`);

  // Find all industry partners in ISVIR
  const industryPartners = await Participant.find({ 
    conferenceId: String(conf._id),
    $or: [
      { category: /industry.partner/i },
      { destination: /industry.partner/i },
      { dynamicData: { $exists: true } }
    ]
  }).lean();

  console.log(`Total participants in ISVIR: ${await Participant.countDocuments({ conferenceId: String(conf._id) })}`);

  // Specifically, find by category containing "industry"
  const byCategory = await Participant.find({ 
    conferenceId: String(conf._id),
    $or: [
      { category: /industry/i },
      { destination: /industry/i }
    ]
  }).lean();

  console.log(`Industry-partner participants: ${byCategory.length}`);
  byCategory.slice(0, 10).forEach(p => {
    console.log(`  name="${p.name}" | regId="${p.regId}" | qrCode="${p.qrCode}" | category="${p.category || p.destination}"`);
  });

  // Check for duplicate qrCodes / regIds — these would cause wrong-name scans
  console.log("\n--- Checking for duplicate qrCodes ---");
  const allParticipants = await Participant.find({ conferenceId: String(conf._id) }).lean();
  
  const qrCodeMap = {};
  for (const p of allParticipants) {
    const key = p.qrCode;
    if (!key) continue;
    if (!qrCodeMap[key]) qrCodeMap[key] = [];
    qrCodeMap[key].push(`"${p.name}" (regId: ${p.regId})`);
  }

  let dupCount = 0;
  for (const [qr, names] of Object.entries(qrCodeMap)) {
    if (names.length > 1) {
      console.log(`  DUPLICATE qrCode="${qr}": ${names.join(", ")}`);
      dupCount++;
    }
  }

  const regIdMap = {};
  for (const p of allParticipants) {
    const key = p.regId;
    if (!key) continue;
    if (!regIdMap[key]) regIdMap[key] = [];
    regIdMap[key].push(`"${p.name}"`);
  }

  let dupRegCount = 0;
  for (const [regId, names] of Object.entries(regIdMap)) {
    if (names.length > 1) {
      console.log(`  DUPLICATE regId="${regId}": ${names.join(", ")}`);
      dupRegCount++;
    }
  }

  if (dupCount === 0) console.log("  No duplicate qrCodes found.");
  if (dupRegCount === 0) console.log("  No duplicate regIds found.");

  // Also print sample of all participants with null/empty qrCodes
  const nullQr = allParticipants.filter(p => !p.qrCode);
  console.log(`\n--- Participants with no qrCode (will fall back to regId): ${nullQr.length} ---`);
  nullQr.slice(0, 5).forEach(p => {
    console.log(`  name="${p.name}" | regId="${p.regId}" | category="${p.category || p.destination}"`);
  });

  // Specifically look for industry partners WITHOUT unique identifiers
  console.log("\n--- Industry Partners with regId starting with 'ID -' ---");
  const idPrefixPartners = await Participant.find({
    conferenceId: String(conf._id),
    regId: /^ID -/
  }).lean();
  console.log(`Count: ${idPrefixPartners.length}`);
  idPrefixPartners.slice(0, 10).forEach(p => {
    console.log(`  name="${p.name}" | regId="${p.regId}" | qrCode="${p.qrCode || 'null'}" | category="${p.category || p.destination}"`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
