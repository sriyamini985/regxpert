import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import participantRoutes from "./routes/participants.js";
import conferenceRoutes from "./routes/conferenceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import bulkEmailRoutes from "./routes/bulkEmailRoutes.js";
import bulkWhatsappRoutes from "./routes/bulkWhatsappRoutes.js";
dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

/* ROUTES */
app.use("/api/participants", participantRoutes);
app.use("/api/conferences", conferenceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bulk-email",bulkEmailRoutes);
app.use("/api/bulk-whatsapp",bulkWhatsappRoutes);
/* DB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* SERVER */
app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running");
});