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
  if (conf) {
    console.log("Conference ID type:", typeof conf._id, conf._id.constructor.name);
    const p = await Participant.findOne({
      $or: [
        { conferenceId: conf._id },
        { conferenceId: String(conf._id) }
      ]
    });
    if (p) {
      console.log("Participant properties:");
      console.log("conferenceId value:", p.conferenceId, "type:", typeof p.conferenceId, p.conferenceId?.constructor?.name);
    } else {
      console.log("No participant found for conference ID", conf._id);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
