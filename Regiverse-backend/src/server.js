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

/* ✅ CORS FIX (DEV + PROD) */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://regiverse-hnrapgori-sagar-425s-projects.vercel.app",
    ],
    credentials: true,
  })
);

/* JSON PARSER */
app.use(express.json({ limit: "50mb" }));

/* ROUTES */
app.use("/api/conferences", conferenceRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bulk-email", bulkEmailRoutes);
app.use("/api/bulk-whatsapp", bulkWhatsappRoutes);

/* DB */
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("URI OK");
  })
  .catch((err) => {
    console.log("❌ MongoDB FAILED:");
    console.log(err);
  });