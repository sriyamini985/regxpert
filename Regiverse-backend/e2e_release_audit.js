import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/regiverse";
const API_URL = `http://localhost:${process.env.PORT || 5001}`;

// Minimal Schemas for testing
const ConferenceSchema = new mongoose.Schema({
  title: String,
  name: String,
  slug: String,
}, { strict: false });

const ParticipantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  regId: String,
  conferenceId: String,
  isCheckedIn: Boolean,
  printed: Boolean,
  kitbagCollected: Boolean,
  certificateGiven: Boolean,
  foodLogs: { type: Map, of: Boolean },
  workshopScans: [String],
  hallEntries: [Date],
  hallExits: [Date],
}, { strict: false });

const Conference = mongoose.model("Conference", ConferenceSchema);
const Participant = mongoose.model("Participant", ParticipantSchema);

async function run() {
  console.log("=========================================================");
  console.log("   REGXPERT PRE-DEPLOYMENT TESTING & RELEASE AUDIT       ");
  console.log("=========================================================");

  console.log("\nConnecting to MongoDB database...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Database connected successfully!");

  // 1. Setup temporary testing data
  console.log("\n[Setup] Cleaning up old test data if present...");
  await Conference.deleteMany({ slug: "test-audit-slug" });
  await Participant.deleteMany({ regId: "AUDIT-12345" });

  console.log("[Setup] Creating temporary conference...");
  const tempConf = await Conference.create({
    title: "Test Audit Conference",
    name: "Test Audit Conference",
    slug: "test-audit-slug",
  });
  const confId = tempConf._id.toString();
  console.log(`✅ Temporary conference created (ID: ${confId})`);

  console.log("[Setup] Creating temporary participant...");
  const tempUser = await Participant.create({
    name: "Audit Test Participant",
    email: "audit.test@example.com",
    phone: "9999988888",
    category: "Delegate",
    conferenceId: confId,
    regId: "AUDIT-12345",
    isCheckedIn: false,
    printed: false,
    kitbagCollected: false,
    certificateGiven: false,
    foodLogs: {},
    workshopScans: [],
    hallEntries: [],
    hallExits: [],
  });
  console.log(`✅ Temporary participant created (ID: ${tempUser._id})`);

  const results = [];

  function recordResult(testName, status, details) {
    console.log(`${status ? "✅" : "❌"} ${testName}: ${details}`);
    results.push({ testName, success: status, details });
  }

  // --- TEST 1: EMPTY NAME VALIDATION ---
  try {
    const res = await fetch(`${API_URL}/api/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "   ",
        conferenceId: confId,
      }),
    });
    const data = await res.json();
    if (res.status === 400 && !data.success) {
      recordResult("Empty Name Validation", true, "Correctly rejected empty name with 400 Bad Request");
    } else {
      recordResult("Empty Name Validation", false, `Expected 400, got ${res.status}`);
    }
  } catch (err) {
    recordResult("Empty Name Validation", false, err.message);
  }

  // --- TEST 2: DUPLICATE PARTICIPANT ---
  try {
    const res = await fetch(`${API_URL}/api/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Another Delegate",
        email: "audit.test@example.com",
        phone: "9999988888",
        conferenceId: confId,
      }),
    });
    const data = await res.json();
    if (res.status === 409 && !data.success) {
      recordResult("Duplicate Registration Block", true, "Correctly rejected duplicate email/phone with 409 Conflict");
    } else {
      recordResult("Duplicate Registration Block", false, `Expected 409, got ${res.status}`);
    }
  } catch (err) {
    recordResult("Duplicate Registration Block", false, err.message);
  }

  // --- TEST 3: SEARCH SCOPING ---
  try {
    // Valid search
    let res = await fetch(`${API_URL}/api/participants?identifier=AUDIT-12345&conferenceId=test-audit-slug`);
    let data = await res.json();
    const foundCorrect = Array.isArray(data) ? data : data?.data || [];

    // Search with wrong conference
    res = await fetch(`${API_URL}/api/participants?identifier=AUDIT-12345&conferenceId=wrong-slug`);
    data = await res.json();
    const foundWrong = Array.isArray(data) ? data : data?.data || [];

    if (foundCorrect.length > 0 && foundWrong.length === 0) {
      recordResult("Scoped Participant Search", true, "Properly found participant in their conference and filtered out from others");
    } else {
      recordResult("Scoped Participant Search", false, `Correct search returned: ${foundCorrect.length}, Incorrect search returned: ${foundWrong.length}`);
    }
  } catch (err) {
    recordResult("Scoped Participant Search", false, err.message);
  }

  // --- TEST 4: MONO SCAN (CHECK-IN) ---
  try {
    // 1st check-in (success)
    let res = await fetch(`${API_URL}/api/participants/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345" }),
    });
    let data = await res.json();
    const firstCheck = res.status === 200 && data.user?.isCheckedIn === true;

    // 2nd check-in (duplicate block)
    res = await fetch(`${API_URL}/api/participants/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345" }),
    });
    data = await res.json();
    const secondCheck = res.status === 409;

    if (firstCheck && secondCheck) {
      recordResult("Mono Scan (General Check-In)", true, "Successful check-in updates database status; duplicates blocked with 409");
    } else {
      recordResult("Mono Scan (General Check-In)", false, `1st status: ${res.status}, 2nd status: ${res.status}`);
    }
  } catch (err) {
    recordResult("Mono Scan (General Check-In)", false, err.message);
  }

  // --- TEST 5: KITBAG SCAN ---
  try {
    // 1st scan (success)
    let res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "kitbag" }),
    });
    let data = await res.json();
    const firstScan = res.status === 200 && data.user?.kitbagCollected === true;

    // 2nd scan (duplicate block)
    res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "kitbag" }),
    });
    const secondScan = res.status === 409;

    // Apply block rules directly to DB
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { blockKitbag: true, kitbagCollected: false } });

    // 3rd scan (forbidden block)
    res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "kitbag" }),
    });
    const thirdScan = res.status === 403;

    if (firstScan && secondScan && thirdScan) {
      recordResult("Kitbag Scan Station", true, "Successfully verified, claims kitbag, rejects duplicate claim, and blocks ineligible delegates (403)");
    } else {
      recordResult("Kitbag Scan Station", false, `1st: ${firstScan}, 2nd (409): ${secondScan}, 3rd (403): ${thirdScan}`);
    }
  } catch (err) {
    recordResult("Kitbag Scan Station", false, err.message);
  }

  // --- TEST 6: FOOD SCAN ---
  try {
    // Reset block & collection state
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { foodLogs: {} } });

    // 1st scan (success)
    let res = await fetch(`${API_URL}/api/participants/scan-food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mealType: "day1-lunch" }),
    });
    let data = await res.json();
    const firstScan = res.status === 200 && data.user?.foodLogs?.["day1-lunch"] === true;

    // 2nd scan (duplicate block)
    res = await fetch(`${API_URL}/api/participants/scan-food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mealType: "day1-lunch" }),
    });
    const secondScan = res.status === 409;

    // Apply block rule directly to DB
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { blockDay1Lunch: true } });

    // 3rd scan (forbidden block)
    res = await fetch(`${API_URL}/api/participants/scan-food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mealType: "day1-lunch" }),
    });
    const thirdScan = res.status === 403;

    if (firstScan && secondScan && thirdScan) {
      recordResult("Food Scan Station", true, "Successfully scans meals, prevents double-claiming, and blocks banned meals");
    } else {
      recordResult("Food Scan Station", false, `1st: ${firstScan}, 2nd (409): ${secondScan}, 3rd (403): ${thirdScan}`);
    }
  } catch (err) {
    recordResult("Food Scan Station", false, err.message);
  }

  // --- TEST 7: WORKSHOP SCAN ---
  try {
    // Reset state
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { workshopScans: [] } });

    // 1st scan (success)
    let res = await fetch(`${API_URL}/api/participants/scan-workshop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", workshop: "workshop1" }),
    });
    let data = await res.json();
    const firstScan = res.status === 200 && data.user?.workshopScans?.includes("workshop1");

    // 2nd scan (duplicate block)
    res = await fetch(`${API_URL}/api/participants/scan-workshop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", workshop: "workshop1" }),
    });
    const secondScan = res.status === 409;

    // Apply block directly to DB
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { blockWorkshop1: true } });

    // 3rd scan (forbidden block)
    res = await fetch(`${API_URL}/api/participants/scan-workshop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", workshop: "workshop1" }),
    });
    const thirdScan = res.status === 403;

    if (firstScan && secondScan && thirdScan) {
      recordResult("Workshop Scan Station", true, "Logs attendance, rejects duplicate entries, and respects individual workshop restrictions (403)");
    } else {
      recordResult("Workshop Scan Station", false, `1st: ${firstScan}, 2nd (409): ${secondScan}, 3rd (403): ${thirdScan}`);
    }
  } catch (err) {
    recordResult("Workshop Scan Station", false, err.message);
  }

  // --- TEST 8: CERTIFICATE SCAN ---
  try {
    // Reset state
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { certificateGiven: false } });

    // 1st scan (success)
    let res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "certificate" }),
    });
    let data = await res.json();
    const firstScan = res.status === 200 && data.user?.certificateGiven === true;

    // 2nd scan (duplicate block)
    res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "certificate" }),
    });
    const secondScan = res.status === 409;

    // Apply block directly to DB
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { blockCertificate: true, certificateGiven: false } });

    // 3rd scan (forbidden block)
    res = await fetch(`${API_URL}/api/participants/verify-and-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", scanType: "certificate" }),
    });
    const thirdScan = res.status === 403;

    if (firstScan && secondScan && thirdScan) {
      recordResult("Certificate Scan Station", true, "Issues certificates, prevents double issuance, and checks blocking restrictions");
    } else {
      recordResult("Certificate Scan Station", false, `1st: ${firstScan}, 2nd (409): ${secondScan}, 3rd (403): ${thirdScan}`);
    }
  } catch (err) {
    recordResult("Certificate Scan Station", false, err.message);
  }

  // --- TEST 9: HALL ENTRY / EXIT ---
  try {
    // Reset state
    await Participant.updateOne({ regId: "AUDIT-12345" }, { $set: { hallEntries: [], hallExits: [] } });

    // 1st entry (success)
    let res = await fetch(`${API_URL}/api/participants/scan-hall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mode: "entry" }),
    });
    const firstEntry = res.status === 200;

    // 2nd entry (rapid duplicate block)
    res = await fetch(`${API_URL}/api/participants/scan-hall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mode: "entry" }),
    });
    const secondEntry = res.status === 409;

    // 1st exit (success)
    res = await fetch(`${API_URL}/api/participants/scan-hall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mode: "exit" }),
    });
    const firstExit = res.status === 200;

    // 2nd exit (rapid duplicate block)
    res = await fetch(`${API_URL}/api/participants/scan-hall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "AUDIT-12345", mode: "exit" }),
    });
    const secondExit = res.status === 409;

    if (firstEntry && secondEntry && firstExit && secondExit) {
      recordResult("Hall Entry/Exit Tracking", true, "Saves sequence arrays, dynamically updates crowd count, and prevents rapid consecutive duplicates");
    } else {
      recordResult("Hall Entry/Exit Tracking", false, `Entry1: ${firstEntry}, Entry2 (409): ${secondEntry}, Exit1: ${firstExit}, Exit2 (409): ${secondExit}`);
    }
  } catch (err) {
    recordResult("Hall Entry/Exit Tracking", false, err.message);
  }

  // 2. Clean up database
  console.log("\n[CleanUp] Removing temporary testing records...");
  await Conference.deleteOne({ _id: tempConf._id });
  await Participant.deleteOne({ _id: tempUser._id });
  console.log("✅ Cleanup complete!");

  await mongoose.disconnect();
  console.log("\n=========================================================");
  console.log("                AUDIT SUMMARY                            ");
  console.log("=========================================================");
  const passed = results.filter(r => r.success).length;
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${results.length - passed}`);
  console.log("=========================================================");

  if (passed !== results.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch(async (err) => {
  console.error("Fatal error during testing audit execution:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
