import { io } from "socket.io-client";
import { API_URL } from "../config/api";

// Use central config which resolves fallback URLs dynamically
const BACKEND_URL = API_URL;

export const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"], // fallback to polling if websocket fails
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Debug helpers (remove in production)
socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", (reason) => console.warn("⚠️ Socket disconnected:", reason));
socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));