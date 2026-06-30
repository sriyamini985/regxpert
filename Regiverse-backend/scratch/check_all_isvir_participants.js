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

  const total = await Participant.countDocuments(query);
  console.log(`Total ISVIR participants: ${total}`);

  const sample = await Participant.find(query).limit(50);
  console.log("\nSample participants values:");
  sample.forEach((p, i) => {
    console.log(`[${i+1}] Name: "${p.name}", regId: "${p.regId}", qrCode: "${p.qrCode}", _id: "${p._id}"`);
  });

  // Check how many have qrCode different from regId
  const diffQr = await Participant.countDocuments({
    ...query,
    $expr: { $ne: [ "$qrCode", "$regId" ] }
  });
  console.log(`\nParticipants with qrCode != regId: ${diffQr}`);

  if (diffQr > 0) {
    const diffSamples = await Participant.find({
      ...query,
      $expr: { $ne: [ "$qrCode", "$regId" ] }
    }).limit(10);
    console.log("Samples where qrCode != regId:");
    diffSamples.forEach(p => {
      console.log(`Name: "${p.name}", regId: "${p.regId}", qrCode: "${p.qrCode}"`);
    });
  }

  // Check how many have empty qrCode
  const emptyQr = await Participant.countDocuments({
    ...query,
    $or: [
      { qrCode: { $exists: false } },
      { qrCode: "" },
      { qrCode: null }
    ]
  });
  console.log(`Participants with empty/missing qrCode: ${emptyQr}`);

  await mongoose.disconnect();
}

run().catch(console.error);
