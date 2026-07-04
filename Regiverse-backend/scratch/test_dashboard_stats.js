import mongoose from "mongoose";
import dns from "dns";
import { getDashboardStats } from "../src/controllers/dashboardController.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.\n");

  const req = {
    query: {
      conferenceId: "6a4359edffc243930809e414"
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

  await getDashboardStats(req, res);

  await mongoose.disconnect();
}

run().catch(console.error);
