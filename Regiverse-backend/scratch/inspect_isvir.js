import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema, "participants");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  const confId = "6a4359edffc243930809e414";

  // Find a participant with hallEntries
  const pWithHall = await Participant.findOne({ conferenceId: confId, "hallEntries.0": { $exists: true } });
  if (pWithHall) {
    console.log("Participant with hallEntries:");
    console.log(`  Name: ${pWithHall.name}`);
    console.log(`  hallEntries:`, pWithHall.hallEntries);
    console.log(`  hallExits:`, pWithHall.hallExits);
  }

  // Find participants with foodLogs
  const pWithFood = await Participant.find({ 
    conferenceId: confId,
    $and: [
      { foodLogs: { $exists: true } },
      { foodLogs: { $ne: null } }
    ]
  }).limit(5).lean();

  console.log(`\nFound ${pWithFood.length} participants with foodLogs:`);
  pWithFood.forEach(p => {
    console.log(`  Name: ${p.name}`);
    console.log(`  foodLogs:`, p.foodLogs);
    console.log(`  foodScanTimes:`, p.foodScanTimes);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
