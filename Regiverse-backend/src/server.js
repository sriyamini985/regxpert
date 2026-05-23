import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import dns from "dns";

import participantRoutes from "./routes/participants.js";
import conferenceRoutes from "./routes/conferenceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import bulkEmailRoutes from "./routes/bulkEmailRoutes.js";
import bulkWhatsappRoutes from "./routes/bulkWhatsappRoutes.js";

dotenv.config({ path: path.resolve("./.env") });
dns.setDefaultResultOrder("ipv4first");

const app = express();

/* DB */
connectDB();

/* CORS CONFIGURATION - UPDATED */
// This allows any Vercel domain, localhost, or requests without an origin (like Postman)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes("localhost") || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.options("*", cors());

app.use(express.json({ limit: "50mb" }));

// Security best practice: Don't print the actual key to the console logs
console.log("RESEND KEY:", process.env.RESEND_API_KEY ? "Loaded Successfully" : "Missing");

/* ROUTES */
app.use("/api/conferences", conferenceRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/bulk-email", bulkEmailRoutes);
app.use("/api/bulk-whatsapp", bulkWhatsappRoutes);

/* START */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});