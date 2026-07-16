/**
 * ISVIR 2026 – Category Normalization (APPLY ONLY FOR ISVIR 2026)
 * ───────────────────────────────────────────────────────────────
 * SAFETY:
 *  - Scoped ONLY to conferenceId = 6a4359edffc243930809e414 (ISVIR 2026)
 *  - Only updates the `category` field using $set
 *  - No participant records deleted, no scan data touched
 *  - Pre + post count verification included
 *  - Aborts on any error
 */

const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";
const CONFERENCE_ID = "6a4359edffc243930809e414"; // ISVIR 2026

// Each entry: exact rawValue (as found in DB) → standard
// Using EXACT strings from the audit to ensure precise matching
const FIX_MAP = [
  { from: "Delegates",             to: "Delegate" },
  { from: "industry partner",      to: "Industry Partner" },
  { from: "industry Partner",      to: "Industry Partner" },
  { from: "Industry partner",      to: "Industry Partner" },
  { from: "industrial partner ",   to: "Industry Partner" },  // trailing space
  { from: "Industrial partner",    to: "Industry Partner" },
  { from: "Industrial partner ",   to: "Industry Partner" },  // trailing space
  { from: "conference manager",    to: "Conference Manager" },
  { from: "conference Manager",    to: "Conference Manager" },
  { from: "conference Manager ",   to: "Conference Manager" }, // trailing space
  { from: "organising committee",  to: "Organising Committee" },
  { from: "Organising Committe",   to: "Organising Committee" }, // typo
  { from: "faculty",               to: "Faculty" },
  { from: "Faculty ",              to: "Faculty" },             // trailing space
  { from: "staff",                 to: "Staff" },
];

const participantSchema = new mongoose.Schema({
  category:     { type: String, default: "" },
  conferenceId: { type: String, default: "" },
}, { strict: false });

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema);

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  ISVIR 2026 – CATEGORY NORMALIZATION (APPLY)        ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, tls: true });
  console.log("✅ Connected to MongoDB\n");

  // Pre-count
  const preTotalAll = await Participant.countDocuments({ conferenceId: CONFERENCE_ID });
  console.log(`📋 Pre-migration ISVIR 2026 participants: ${preTotalAll}\n`);

  let totalUpdated = 0;

  for (const item of FIX_MAP) {
    const countBefore = await Participant.countDocuments({
      conferenceId: CONFERENCE_ID,
      category: item.from
    });

    if (countBefore === 0) {
      console.log(`  ⏭️  Skipping "${item.from}" (0 records found)`);
      continue;
    }

    console.log(`  ⏳ "${item.from}"  →  "${item.to}"  (${countBefore} records)...`);

    try {
      const result = await Participant.updateMany(
        { conferenceId: CONFERENCE_ID, category: item.from },
        { $set: { category: item.to } }
      );
      totalUpdated += result.modifiedCount;
      console.log(`  ✅ Updated ${result.modifiedCount} records\n`);
    } catch (err) {
      console.error(`\n  ❌ ERROR on "${item.from}": ${err.message}`);
      console.error("  🛑 ABORTING to protect data integrity.");
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // Post-count & verification
  const postTotalAll = await Participant.countDocuments({ conferenceId: CONFERENCE_ID });
  const postCats = await Participant.aggregate([
    { $match: { conferenceId: CONFERENCE_ID } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  console.log("─────────────────────────────────────────────────────");
  console.log("📊 POST-MIGRATION CATEGORY DISTRIBUTION (ISVIR 2026):\n");
  for (const r of postCats) {
    const cat = String(r._id === null ? "(empty/null)" : r._id);
    console.log(`  "${cat}"  →  ${r.count} records`);
  }

  console.log(`\n─────────────────────────────────────────────────────`);
  console.log(`✅ COMPLETE`);
  console.log(`   Pre-migration participants:  ${preTotalAll}`);
  console.log(`   Post-migration participants: ${postTotalAll}`);

  if (preTotalAll !== postTotalAll) {
    console.error(`\n❌ CRITICAL: Participant count changed! Was ${preTotalAll}, now ${postTotalAll}. Investigate immediately.`);
  } else {
    console.log(`   Count matches ✅  – No data loss.`);
    console.log(`   Records updated: ${totalUpdated}`);
    console.log(`   Remaining categories: ${postCats.length}`);
  }
  console.log("─────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected.\n");
}

main().catch(async err => {
  console.error("FATAL:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
