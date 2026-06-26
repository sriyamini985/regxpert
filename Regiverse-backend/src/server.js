import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket.js";
import connectDB from "./config/db.js";

import participantRoutes from "./routes/participants.js";
import conferenceRoutes from "./routes/conferenceRoutes.js";
import bulkEmailRoutes from "./routes/bulkEmailRoutes.js";
import bulkWhatsappRoutes from "./routes/bulkWhatsappRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config({ path: path.resolve("./.env") });
dns.setDefaultResultOrder("ipv4first");

const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5172",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://regxperts.com",
  "https://www.regxperts.com"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  try {
    const parsed = new URL(process.env.FRONTEND_URL);
    if (parsed.hostname.startsWith("www.")) {
      allowedOrigins.push(`${parsed.protocol}//${parsed.hostname.substring(4)}`);
    } else {
      allowedOrigins.push(`${parsed.protocol}//www.${parsed.hostname}`);
    }
  } catch (e) {
    // ignore parsing errors
  }
}

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true 
}));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve("./uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});


app.use("/api/conferences", conferenceRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/bulk-email", bulkEmailRoutes);
app.use("/api/bulk-whatsapp", bulkWhatsappRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Initialize the singleton
initSocket(io);

io.on("connection", (socket) => {
  socket.on("joinConference", (conferenceId) => {
    socket.join(conferenceId);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));