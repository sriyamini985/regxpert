/**
 * ISVIR 2026 – Category Audit Script
 * Checks unique category values ONLY for the ISVIR 2026 conference.
 * READ-ONLY – no changes made.
 */

const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const participantSchema = new mongoose.Schema({
  category: { type: String, default: "" },
  conferenceId: { type: String, default: "" },
  conferenceName: { type: String, default: "" },
}, { strict: false });

const conferenceSchema = new mongoose.Schema({
  name: String,
  slug: String,
}, { strict: false });

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema);
const Conference = mongoose.models.Conference || mongoose.model("Conference", conferenceSchema);

async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, tls: true });
  console.log("✅ Connected\n");

  // List all conferences
  const conferences = await Conference.find({}, { name: 1, slug: 1, _id: 1 });
  console.log("All Conferences:");
  for (const c of conferences) {
    console.log(`  ID: ${c._id}  |  slug: ${c.slug}  |  name: ${c.name}`);
  }

  // Find ISVIR 2026
  const isvir = conferences.find(c => 
    (c.name && c.name.toLowerCase().includes("isvir")) ||
    (c.slug && c.slug.toLowerCase().includes("isvir"))
  );

  if (!isvir) {
    console.log("\n❌ Could not find ISVIR 2026 conference. Showing all categories across all events:");
    const all = await Participant.aggregate([
      { $group: { _id: { category: "$category", conferenceId: "$conferenceId" }, count: { $sum: 1 } } },
      { $sort: { "_id.conferenceId": 1, "_id.category": 1 } }
    ]);
    for (const r of all) {
      console.log(`  [${r._id.conferenceId}]  "${r._id.category}"  →  ${r.count}`);
    }
  } else {
    console.log(`\n✅ Found ISVIR: ID=${isvir._id}, name="${isvir.name}", slug="${isvir.slug}"\n`);

    const total = await Participant.countDocuments({ conferenceId: String(isvir._id) });
    console.log(`📋 Total participants in ISVIR 2026: ${total}\n`);

    const cats = await Participant.aggregate([
      { $match: { conferenceId: String(isvir._id) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("Category breakdown for ISVIR 2026:");
    console.log("─────────────────────────────────────────");
    for (const r of cats) {
      const cat = String(r._id === null ? "(empty/null)" : r._id);
      console.log(`  "${cat}"  →  ${r.count} records`);
    }
    console.log(`\n  Total unique categories: ${cats.length}`);
  }

  await mongoose.disconnect();
}

main().catch(async err => {
  console.error("FATAL:", err.message);
  await mongoose.disconnect().catch(() => {});
});
