import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const ConferenceSchema = new mongoose.Schema({}, { strict: false });
const Conference = mongoose.model("Conference", ConferenceSchema, "conferences");

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema, "participants");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const conf = await Conference.findOne({ name: /isvir/i });
  if (!conf) {
    console.log("ISVIR conference not found!");
    await mongoose.disconnect();
    return;
  }

  const query = {
    $or: [
      { conferenceId: conf._id },
      { conferenceId: String(conf._id) }
    ]
  };

  const checkedInCount = await Participant.countDocuments({ ...query, isCheckedIn: true });
  const kitbagCount = await Participant.countDocuments({ ...query, kitbagCollected: true });
  const certCount = await Participant.countDocuments({ ...query, certificateGiven: true });
  
  // Count how many have any food logs
  const allParticipants = await Participant.find(query);
  let foodScannedCount = 0;
  for (const p of allParticipants) {
    if (p.foodLogs && p.foodLogs.size > 0) {
      foodScannedCount++;
    }
  }

  console.log(`ISVIR 2026 Statistics:`);
  console.log(`- Total Checked In (isCheckedIn): ${checkedInCount}`);
  console.log(`- Kitbags Collected (kitbagCollected): ${kitbagCount}`);
  console.log(`- Certificates Given (certificateGiven): ${certCount}`);
  console.log(`- Food Scanned (foodLogs map not empty): ${foodScannedCount}`);

  await mongoose.disconnect();
}

run().catch(console.error);
