/**
 * Diagnose spot-registered participants not found during scan.
 * Checks for participants with no regId, no qrCode, wrong conferenceId etc.
 */
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";
const CONFERENCE_ID = "6a4359edffc243930809e414"; // ISVIR 2026

const participantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema);

async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, tls: true });
  console.log("✅ Connected\n");

  const total = await Participant.countDocuments({ conferenceId: CONFERENCE_ID });
  console.log(`Total in ISVIR 2026: ${total}\n`);

  // Find participants with EMPTY or MISSING regId / qrCode
  const missingRegId = await Participant.find({
    conferenceId: CONFERENCE_ID,
    $or: [
      { regId: { $exists: false } },
      { regId: null },
      { regId: "" }
    ]
  }, { name: 1, phone: 1, email: 1, regId: 1, qrCode: 1, createdAt: 1 }).lean();

  const missingQrCode = await Participant.find({
    conferenceId: CONFERENCE_ID,
    $or: [
      { qrCode: { $exists: false } },
      { qrCode: null },
      { qrCode: "" }
    ]
  }, { name: 1, phone: 1, email: 1, regId: 1, qrCode: 1, createdAt: 1 }).lean();

  const missingBoth = await Participant.find({
    conferenceId: CONFERENCE_ID,
    $or: [
      { regId: { $exists: false } },
      { regId: null },
      { regId: "" }
    ],
    $and: [
      { $or: [
        { qrCode: { $exists: false } },
        { qrCode: null },
        { qrCode: "" }
      ]}
    ]
  }, { name: 1, phone: 1, email: 1, regId: 1, qrCode: 1, createdAt: 1 }).lean();

  console.log(`Participants with no regId: ${missingRegId.length}`);
  console.log(`Participants with no qrCode: ${missingQrCode.length}`);
  console.log(`Participants with BOTH missing: ${missingBoth.length}\n`);

  if (missingBoth.length > 0) {
    console.log("=== RECORDS WITH BOTH regId AND qrCode MISSING ===");
    for (const p of missingBoth) {
      console.log(`  Name: "${p.name}" | Phone: "${p.phone}" | Email: "${p.email}" | Created: ${p.createdAt}`);
    }
  }

  // Also check for participants where phone or name is empty/missing
  const noPhone = await Participant.countDocuments({
    conferenceId: CONFERENCE_ID,
    $or: [{ phone: { $exists: false } }, { phone: null }, { phone: "" }]
  });
  const noName = await Participant.countDocuments({
    conferenceId: CONFERENCE_ID,
    $or: [{ name: { $exists: false } }, { name: null }, { name: "" }]
  });

  console.log(`\nParticipants with no phone: ${noPhone}`);
  console.log(`Participants with no name: ${noName}`);

  // Show recent 10 spot-registered (ones with auto-generated regId format "ID - xxxxxx")
  const recentSpot = await Participant.find({
    conferenceId: CONFERENCE_ID,
    regId: { $regex: /^ID\s*-\s*/i }
  }, { name: 1, phone: 1, email: 1, regId: 1, qrCode: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  console.log(`\n=== RECENT SPOT REGISTRATIONS (auto-generated regId) – last 10 ===`);
  if (recentSpot.length === 0) {
    console.log("  None found with auto-generated regId pattern.");
  }
  for (const p of recentSpot) {
    console.log(`  Name: "${p.name}" | Phone: "${p.phone}" | RegId: "${p.regId}" | QrCode: "${p.qrCode}" | Created: ${p.createdAt}`);
  }

  // Show most recently created participants regardless
  const recentAll = await Participant.find(
    { conferenceId: CONFERENCE_ID },
    { name: 1, phone: 1, email: 1, regId: 1, qrCode: 1, createdAt: 1 }
  ).sort({ createdAt: -1 }).limit(15).lean();

  console.log(`\n=== LAST 15 PARTICIPANTS CREATED (ISVIR 2026) ===`);
  for (const p of recentAll) {
    const regId = p.regId || "(EMPTY)";
    const qrCode = p.qrCode || "(EMPTY)";
    const phone = p.phone || "(EMPTY)";
    console.log(`  "${p.name}" | Phone: ${phone} | RegId: ${regId} | QrCode: ${qrCode} | Created: ${p.createdAt}`);
  }

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error("FATAL:", err.message);
  await mongoose.disconnect().catch(() => {});
});
