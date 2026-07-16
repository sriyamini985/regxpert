/**
 * SAFE CATEGORY NORMALIZATION MIGRATION SCRIPT
 * ============================================
 * Phase 1 (Audit): Connects to MongoDB, discovers all unique category values,
 *   and shows a pre-migration report WITHOUT making any changes.
 * Phase 2 (Migrate): Updates ONLY the `category` field to the normalized standard.
 *
 * SAFETY GUARANTEES:
 *  - No participant record is deleted.
 *  - No scan history, food logs, hall entries, badge history, regId, qrCode touched.
 *  - Dry-run (AUDIT_ONLY=true) will NEVER write to DB.
 *  - All updates use MongoDB updateMany with $set on ONLY the category field.
 *  - Each batch is logged before execution.
 *  - Any unexpected error aborts immediately.
 *
 * USAGE:
 *   Audit only (no writes):  node migrate_categories.cjs
 *   Apply fixes:             APPLY=true node migrate_categories.cjs
 */

const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ─────────────────────────────────────────────────────────────
// CONFIGURATION – Edit this to match actual normalized values
// ─────────────────────────────────────────────────────────────
// Format: ["variant1", "variant2", ...] → "Standard Label"
// Matching is CASE-INSENSITIVE and TRIMS whitespace.
const NORMALIZATION_MAP = [
  {
    standard: "Faculty",
    variants: ["faculty", "facalty", "facutly", "facluty", "FACULTY", "Faculty "]
  },
  {
    standard: "Delegate",
    variants: ["delegate", "delegates", "DELEGATE", "DELEGATES", "Delegate ", "Delegates "]
  },
  {
    standard: "Industry Partner",
    variants: [
      "industry partner", "industrypartner", "industry partners",
      "INDUSTRY PARTNER", "INDUSTRY PARTNERS",
      "Industry partner", "Industry Partners", "Industry Partner ",
      "Industrry Partner", "Industry Parter", "Industry Partener"
    ]
  },
  {
    standard: "Conference Manager",
    variants: [
      "conference manager", "conference managers", "CONFERENCE MANAGER",
      "Conference manager", "Conference Managers", "Conference Manager ",
      "Conf Manager", "conf. manager"
    ]
  },
  {
    standard: "Organizer",
    variants: ["organizer", "organiser", "ORGANIZER", "Organizer ", "Organiser"]
  },
  {
    standard: "Speaker",
    variants: ["speaker", "speakers", "SPEAKER", "Speaker ", "Speakers"]
  },
  {
    standard: "Workshop Participant",
    variants: [
      "workshop participant", "workshop participants", "Workshop participant",
      "WORKSHOP PARTICIPANT", "Workshop Participant "
    ]
  },
  {
    standard: "Student",
    variants: ["student", "students", "STUDENT", "Student ", "Students"]
  },
  {
    standard: "Sponsor",
    variants: ["sponsor", "sponsors", "SPONSOR", "Sponsor ", "Sponsors"]
  },
  {
    standard: "Guest",
    variants: ["guest", "guests", "GUEST", "Guest ", "Guests"]
  },
  {
    standard: "VIP",
    variants: ["vip", "VIP ", "v.i.p", "V.I.P"]
  },
  {
    standard: "Press / Media",
    variants: ["press", "media", "press/media", "press / media", "PRESS", "MEDIA", "Press", "Media"]
  },
  {
    standard: "Volunteer",
    variants: ["volunteer", "volunteers", "VOLUNTEER", "Volunteer ", "Volunteers"]
  },
  {
    standard: "Staff",
    variants: ["staff", "staffs", "STAFF", "Staff "]
  }
];

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";
const APPLY = process.env.APPLY === "true";  // Set APPLY=true to actually apply changes

// ─────────────────────────────────────────────────────────────
// SCHEMA (lightweight – only the fields we need)
// ─────────────────────────────────────────────────────────────
const participantSchema = new mongoose.Schema({
  category: { type: String, default: "" },
  conferenceId: { type: String, default: "" },
  conferenceName: { type: String, default: "" },
  name: { type: String, default: "" },
  regId: { type: String, default: "" },
}, { strict: false });

const Participant = mongoose.models.Participant || mongoose.model("Participant", participantSchema);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function normalize(raw) {
  const trimmed = String(raw || "").trim();
  const lower = trimmed.toLowerCase();
  for (const entry of NORMALIZATION_MAP) {
    for (const variant of entry.variants) {
      if (variant.trim().toLowerCase() === lower) {
        return entry.standard;
      }
    }
    // Also match if the standard itself (case-insensitive trimmed) matches
    if (entry.standard.trim().toLowerCase() === lower) {
      return entry.standard;
    }
  }
  return null; // Unknown – do not touch
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   CATEGORY NORMALIZATION MIGRATION SCRIPT           ║");
  console.log("║   Production Database – RegXpert / Regiverse        ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (!APPLY) {
    console.log("🔍 MODE: AUDIT ONLY (no changes will be made)");
    console.log("   To apply changes, re-run with: APPLY=true node migrate_categories.cjs\n");
  } else {
    console.log("⚡ MODE: APPLY CHANGES – Category field will be updated\n");
  }

  // Connect
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
  console.log("✅ Connected to MongoDB\n");

  // ── Step 1: Discover all unique category values ──
  console.log("📊 Step 1: Discovering all unique category values in the database...\n");

  const aggResult = await Participant.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const totalParticipants = await Participant.countDocuments();
  console.log(`📋 Total participants in DB: ${totalParticipants}`);
  console.log(`📋 Unique category values found: ${aggResult.length}\n`);

  // ── Step 2: Build the migration plan ──
  const toUpdate = [];    // { rawCategory, standardCategory, count, _ids }
  const unchanged = [];   // { rawCategory, count } – already correct or unknown
  const unknown = [];     // { rawCategory, count } – no match in NORMALIZATION_MAP

  for (const row of aggResult) {
    const raw = row._id === null ? "" : String(row._id);
    const count = row.count;
    const normalized = normalize(raw);

    if (!normalized) {
      // Raw value not in our normalization map at all
      unknown.push({ rawCategory: raw || "(empty)", count });
    } else if (normalized === raw) {
      // Already the correct standard value
      unchanged.push({ rawCategory: raw, count });
    } else {
      // Needs updating
      toUpdate.push({ rawCategory: raw, standardCategory: normalized, count });
    }
  }

  // ── Step 3: Print the report ──
  console.log("═══════════════════════════════════════════════════════");
  console.log("  PRE-MIGRATION REPORT");
  console.log("═══════════════════════════════════════════════════════\n");

  if (toUpdate.length === 0 && unknown.length === 0) {
    console.log("✅ All category values are already correctly normalized. No changes required.\n");
    await mongoose.disconnect();
    return;
  }

  if (toUpdate.length > 0) {
    console.log("┌─────────────────────────────────────────────────────────────────────┐");
    console.log("│  WILL BE UPDATED (category variants → standard value)               │");
    console.log("├──────────────────────────────────┬──────────────────────┬───────────┤");
    console.log("│  Original Value                  │  Standard Value      │  Count    │");
    console.log("├──────────────────────────────────┼──────────────────────┼───────────┤");
    let totalToUpdate = 0;
    for (const item of toUpdate) {
      const raw = item.rawCategory.padEnd(32);
      const std = item.standardCategory.padEnd(20);
      const cnt = String(item.count).padStart(7);
      console.log(`│  ${raw}  │  ${std}  │  ${cnt}  │`);
      totalToUpdate += item.count;
    }
    console.log("├──────────────────────────────────┴──────────────────────┴───────────┤");
    console.log(`│  Total records that will be updated: ${String(totalToUpdate).padStart(32)} │`);
    console.log("└────────────────────────────────────────────────────────────────────-┘\n");
  }

  if (unchanged.length > 0) {
    console.log("┌─────────────────────────────────────────────────────┐");
    console.log("│  ALREADY CORRECT (no changes needed)               │");
    console.log("├────────────────────────────────────────┬────────────┤");
    console.log("│  Category Value                        │  Count     │");
    console.log("├────────────────────────────────────────┼────────────┤");
    for (const item of unchanged) {
      const raw = item.rawCategory.padEnd(38);
      const cnt = String(item.count).padStart(8);
      console.log(`│  ${raw}  │  ${cnt}  │`);
    }
    console.log("└────────────────────────────────────────┴────────────┘\n");
  }

  if (unknown.length > 0) {
    console.log("┌─────────────────────────────────────────────────────┐");
    console.log("│  UNKNOWN (not in normalization map – WILL NOT TOUCH)│");
    console.log("├────────────────────────────────────────┬────────────┤");
    console.log("│  Category Value                        │  Count     │");
    console.log("├────────────────────────────────────────┼────────────┤");
    for (const item of unknown) {
      const raw = String(item.rawCategory).padEnd(38);
      const cnt = String(item.count).padStart(8);
      console.log(`│  ${raw}  │  ${cnt}  │`);
    }
    console.log("└────────────────────────────────────────┴────────────┘");
    console.log("\n⚠️  IMPORTANT: The categories above were NOT found in the normalization map.");
    console.log("   These records will NOT be touched. If you want to normalize them,");
    console.log("   add entries to NORMALIZATION_MAP in this script and re-run.\n");
  }

  // ── Step 4: Apply if APPLY=true ──
  if (!APPLY) {
    console.log("─────────────────────────────────────────────────────");
    console.log("✋ AUDIT COMPLETE – No changes were made.");
    console.log("   Review the report above carefully.");
    console.log("   To apply changes, run:");
    console.log("   APPLY=true node migrate_categories.cjs");
    console.log("─────────────────────────────────────────────────────\n");
    await mongoose.disconnect();
    return;
  }

  // ── APPLY MODE ──
  console.log("─────────────────────────────────────────────────────");
  console.log("⚡ APPLYING CATEGORY NORMALIZATION...\n");

  let totalUpdated = 0;
  let errorOccurred = false;

  for (const item of toUpdate) {
    try {
      console.log(`  ⏳ Updating "${item.rawCategory}" → "${item.standardCategory}" (${item.count} records)...`);

      // Only touch the `category` field. Nothing else.
      const result = await Participant.updateMany(
        { category: item.rawCategory },  // exact match (already trimmed from aggregation)
        { $set: { category: item.standardCategory } }
      );

      const updated = result.modifiedCount;
      totalUpdated += updated;
      console.log(`  ✅ Done – ${updated} records updated.\n`);
    } catch (err) {
      console.error(`\n  ❌ ERROR updating "${item.rawCategory}": ${err.message}`);
      console.error("  🛑 MIGRATION ABORTED to prevent data corruption.");
      errorOccurred = true;
      break;
    }
  }

  if (!errorOccurred) {
    // ── Step 5: Post-migration verification ──
    console.log("─────────────────────────────────────────────────────");
    console.log("🔍 POST-MIGRATION VERIFICATION\n");

    const postAgg = await Participant.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const postTotal = await Participant.countDocuments();

    console.log(`📋 Total participants after migration: ${postTotal} (was ${totalParticipants})`);
    if (postTotal !== totalParticipants) {
      console.error("❌ CRITICAL: Participant count changed after migration! Please investigate immediately.");
    } else {
      console.log("✅ Participant count UNCHANGED – no data loss detected.\n");
    }

    console.log("Final category distribution:");
    for (const row of postAgg) {
      const cat = String(row._id || "(empty)").padEnd(35);
      console.log(`  ${cat} : ${row.count}`);
    }

    console.log("\n─────────────────────────────────────────────────────");
    console.log(`✅ MIGRATION COMPLETE`);
    console.log(`   Total records updated: ${totalUpdated}`);
    console.log(`   Total participants:    ${postTotal}`);
    console.log(`   Categories remaining:  ${postAgg.length}`);
    console.log("─────────────────────────────────────────────────────\n");
  }

  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected.\n");
}

main().catch(async (err) => {
  console.error("\n🔴 FATAL ERROR:", err.message);
  console.error(err.stack);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
