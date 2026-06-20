import mongoose from "mongoose";
import Conference from "./models/Conference.js";

let io = null;

export const initSocket = (socketServer) => {
  io = socketServer;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handles room grouping channel requests from your frontend Dashboard
    socket.on("joinConferenceRoom", async (conferenceId) => {
      socket.join(conferenceId);
      console.log(`📡 Socket connection ${socket.id} joined room channel: ${conferenceId}`);

      try {
        const conf = await Conference.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(conferenceId) ? conferenceId : undefined },
            { slug: conferenceId },
            { name: conferenceId }
          ].filter(Boolean)
        });
        if (conf && String(conf._id) !== conferenceId) {
          socket.join(String(conf._id));
          console.log(`📡 Socket connection ${socket.id} also joined room channel by ID: ${conf._id}`);
        }
      } catch (err) {
        console.error("Error joining resolved conference room:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const broadcastParticipantCreated = (participant) => {
  const roomKey = String(participant.conferenceId || participant.conferenceName || "");
  if (roomKey) {
    getIO().to(roomKey).emit("participantCreated", participant);
  }
};

export const broadcastParticipantUpdated = (participant) => {
  const roomKey = String(participant.conferenceId || participant.conferenceName || "");
  if (roomKey) {
    getIO().to(roomKey).emit("participantUpdated", participant);
    getIO().to(roomKey).emit("conferenceDataUpdated", { conferenceId: roomKey });
  }
};

export const broadcastParticipantDeleted = (id, conferenceId) => {
  const roomKey = String(conferenceId || "");
  if (roomKey) {
    getIO().to(roomKey).emit("participantDeleted", id);
  }
};

export const broadcastBulkImport = (conferenceId) => {
  const roomKey = String(conferenceId || "");
  if (roomKey) {
    getIO().to(roomKey).emit("conferenceDataUpdated", { conferenceId: roomKey, timestamp: Date.now() });
  }
};