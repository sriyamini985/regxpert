import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

async function run() {
  await mongoose.connect(MONGO_URI);
  const ParticipantSchema = new mongoose.Schema({}, { strict: false });
  const Participant = mongoose.model("Participant", ParticipantSchema);

  const participant = await Participant.findOne({
    $or: [
      { name: /UJJWAL/i },
      { regId: /RMDC315/i }
    ]
  });

  console.log("Participant Record:\n", JSON.stringify(participant, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
