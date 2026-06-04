import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import http from "http";
import { initSocket } from "./socket.js";
  
import { Server } from "socket.io";

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

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.options(/(.*)/, cors());

app.use(express.json({ limit: "50mb" }));

console.log(
  "RESEND KEY:",
  process.env.RESEND_API_KEY
    ? "Loaded Successfully"
    : "Missing"
);

/* ROUTES */

app.use("/api/conferences", conferenceRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/bulk-email", bulkEmailRoutes);
app.use("/api/bulk-whatsapp", bulkWhatsappRoutes);
app.use("/api/dashboard", dashboardRoutes);
/* SOCKET SERVER */

const server = http.createServer(app);

 const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
initSocket(io);

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("joinConference", (conferenceId) => {
    socket.join(conferenceId);

    console.log(
      `Socket ${socket.id} joined conference ${conferenceId}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
});

/* START */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});