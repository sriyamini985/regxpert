const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0";

const BadgeTemplateSchema = new mongoose.Schema({}, { strict: false });
const BadgeTemplate = mongoose.model("BadgeTemplate", BadgeTemplateSchema, "badgetemplates");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const templates = await BadgeTemplate.find({});
  console.log("Found", templates.length, "templates:");
  for (const t of templates) {
    console.log(`\nTemplate ID: ${t._id}`);
    console.log(`Name: ${t.name}`);
    console.log(`Category: ${t.category}`);
    console.log(`Canvas Size: ${t.canvasWidthMm} x ${t.canvasHeightMm} mm`);
    console.log(`Background Image: ${t.backgroundImage}`);
    console.log(`Default Flag: ${t.isDefault}`);
    console.log(`Fields (${t.fields ? t.fields.length : 0}):`, JSON.stringify(t.fields, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
