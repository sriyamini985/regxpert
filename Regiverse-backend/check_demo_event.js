import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const ConferenceSchema = new mongoose.Schema({}, { strict: false });
const Conference = mongoose.model("Conference", ConferenceSchema);

const ParticipantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model("Participant", ParticipantSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  // Search for conference
  console.log("\nSearching for conferences matching 'demo-event':");
  const confs = await Conference.find({
    $or: [
      { slug: /demo-event/i },
      { name: /demo-event/i }
    ]
  });
  console.log(`Found ${confs.length} conferences:`, confs);

  // Search for participants
  console.log("\nSearching for participants matching 'demo-event':");
  const parts = await Participant.find({
    $or: [
      { conferenceId: /demo-event/i },
      { conferenceName: /demo-event/i }
    ]
  });
  console.log(`Found ${parts.length} participants matching 'demo-event' in conferenceId/conferenceName`);

  console.log("\nSearching for participants named 'Sriyamini':");
  const sriyaminis = await Participant.find({
    name: /sriyamini/i
  });
  sriyaminis.forEach(s => {
    console.log(`ID: ${s._id}, Name: ${s.name}, ConfID: "${s.conferenceId}", ConfName: "${s.conferenceName}"`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
