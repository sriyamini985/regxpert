const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://puppalasagar91_db_user:Sagarpatel54@cluster0.neydetp.mongodb.net/regiverse?appName=Cluster0';

async function test() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;
  const participants = db.collection('participants');
  
  // Try searching for RMDC215 or similar
  const p = await participants.findOne({ regId: /RMDC215/ });
  console.log("Participant found:", JSON.stringify(p, null, 2));

  mongoose.connection.close();
}

test();
