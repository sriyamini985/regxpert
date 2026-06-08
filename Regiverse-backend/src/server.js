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

dotenv.config({ path: path.resolve("./.env") });
dns.setDefaultResultOrder("ipv4first");

const app = express();
connectDB();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/conferences", conferenceRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/bulk-email", bulkEmailRoutes);
app.use("/api/bulk-whatsapp", bulkWhatsappRoutes);
app.use("/api/dashboard", dashboardRoutes);

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