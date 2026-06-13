import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import connectDB from "../src/config/db.js";
import Conference from "../src/models/Conference.js";
import Participant from "../src/models/Participant.js";

dotenv.config({ path: path.resolve("./.env") });
dns.setDefaultResultOrder("ipv4first");

async function run() {
  try {
    await connectDB();
    console.log("Fetching conferences...");
    const conferences = await Conference.find().sort({ createdAt: -1 });
    console.log(`Found ${conferences.length} conferences.`);

    const formatted = await Promise.all(
      conferences.map(async (c) => {
        const conferenceName = c.name || c.title || "";
        console.log(`Processing conference: ${conferenceName} (_id: ${c._id})`);
        const delegates = await Participant.countDocuments({
          $or: [
            { conferenceId: c._id.toString() },
            { conferenceName: conferenceName },
          ],
        });
        console.log(`Conference ${conferenceName} delegates count: ${delegates}`);

        return {
          _id: c._id,
          name: conferenceName,
          title: conferenceName,
          slug: c.slug,
          delegates,
          isActive: c.isActive,
          createdAt: c.createdAt,
        };
      })
    );

    console.log("Success! Formatted data:", JSON.stringify(formatted, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("ERROR OCCURRED:", err);
    process.exit(1);
  }
}

run();
