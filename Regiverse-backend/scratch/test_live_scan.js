import mongoose from "mongoose";
import dns from "dns";
import { verifyAndScan } from "../src/controllers/participantController.js";
import Participant from "../src/models/Participant.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Find a participant with prefix ID
  const sample = await Participant.findOne({ regId: /^ID -/ });
  if (!sample) {
    console.log("No sample delegate with 'ID -' prefix found.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Testing with delegate: name="${sample.name}", regId="${sample.regId}", confId="${sample.conferenceId}"`);

  // Let's reset their kitbag status so we don't get a 409 conflict
  sample.kitbagCollected = false;
  await sample.save();

  // Mock Request & Response
  const suffix = sample.regId.replace("ID - ", "");
  const testInput = `ID: ${suffix}`; // Prefix label scanned
  
  const req = {
    body: {
      identifier: testInput,
      scanType: "kitbag",
      conferenceId: sample.conferenceId
    }
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`[Response Code ${this.statusCode}]`, JSON.stringify(data, null, 2));
    }
  };

  console.log(`\nCalling verifyAndScan with identifier: "${testInput}"`);
  await verifyAndScan(req, res);

  await mongoose.disconnect();
}

run().catch(console.error);
