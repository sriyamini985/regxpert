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

  const conf = await Conference.findOne({ slug: "isvir-2026-9435" });
  if (!conf) {
    console.log("ISVIR conference not found");
    await mongoose.disconnect();
    return;
  }
  const confId = String(conf._id);
  console.log(`Conference: ${conf.name} (${confId})`);

  // Count unique participants with entries
  const uniqueEntries = await Participant.countDocuments({ conferenceId: confId, "hallEntries.0": { $exists: true } });
  const uniqueExits = await Participant.countDocuments({ conferenceId: confId, "hallExits.0": { $exists: true } });

  // Sum of all entries using aggregation
  const entrySumAgg = await Participant.aggregate([
    { $match: { conferenceId: confId } },
    { $project: { numEntries: { $cond: { if: { $isArray: "$hallEntries" }, then: { $size: "$hallEntries" }, else: 0 } } } },
    { $group: { _id: null, total: { $sum: "$numEntries" } } }
  ]);
  const totalEntries = entrySumAgg[0]?.total || 0;

  const exitSumAgg = await Participant.aggregate([
    { $match: { conferenceId: confId } },
    { $project: { numExits: { $cond: { if: { $isArray: "$hallExits" }, then: { $size: "$hallExits" }, else: 0 } } } },
    { $group: { _id: null, total: { $sum: "$numExits" } } }
  ]);
  const totalExits = exitSumAgg[0]?.total || 0;

  console.log(`Unique participants with at least 1 entry: ${uniqueEntries}`);
  console.log(`Total entry scan events (sum of lengths): ${totalEntries}`);
  console.log(`Unique participants with at least 1 exit: ${uniqueExits}`);
  console.log(`Total exit scan events (sum of lengths): ${totalExits}`);

  await mongoose.disconnect();
}

run().catch(console.error);
