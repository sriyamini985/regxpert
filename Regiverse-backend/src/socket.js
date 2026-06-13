import Conference from "./models/Conference.js";

let io = null;

export const initSocket = (socketServer) => {
  io = socketServer;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Client joins a conference room to receive targeted events
    socket.on("join-conference", async (conferenceId) => {
      if (conferenceId) {
        socket.join(conferenceId);
        console.log(`📡 Socket ${socket.id} joined room: ${conferenceId}`);

        // Resolve slug to also join database ID room
        try {
          const targetConference = await Conference.findOne({
            $or: [
              { slug: conferenceId },
              { name: conferenceId }
            ]
          });
          if (targetConference) {
            const dbId = targetConference._id.toString();
            if (dbId !== conferenceId) {
              socket.join(dbId);
              console.log(`📡 Socket ${socket.id} also joined resolved room: ${dbId}`);
            }
          }
        } catch (err) {
          console.error("Socket room resolution error:", err);
        }
      }
    });

    // Client leaves a conference room
    socket.on("leave-conference", async (conferenceId) => {
      if (conferenceId) {
        socket.leave(conferenceId);
        console.log(`📤 Socket ${socket.id} left room: ${conferenceId}`);

        try {
          const targetConference = await Conference.findOne({
            $or: [
              { slug: conferenceId },
              { name: conferenceId }
            ]
          });
          if (targetConference) {
            const dbId = targetConference._id.toString();
            if (dbId !== conferenceId) {
              socket.leave(dbId);
              console.log(`📤 Socket ${socket.id} also left resolved room: ${dbId}`);
            }
          }
        } catch (err) {}
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

// Broadcast to a specific conference room + all global listeners
export const broadcastParticipantCreated = (participant) => {
  const conferenceId = participant?.conferenceId || participant?.conferenceName;
  if (conferenceId) {
    getIO().to(conferenceId).emit("participant-created", participant);
  }
  getIO().emit("participant-created", participant); // also global for admin panels
};

export const broadcastParticipantUpdated = (participant) => {
  const conferenceId = participant?.conferenceId || participant?.conferenceName;
  if (conferenceId) {
    getIO().to(conferenceId).emit("participant-updated", participant);
  }
  getIO().emit("participant-updated", participant);
};

export const broadcastParticipantDeleted = (id) => {
  getIO().emit("participant-deleted", id);
};

export const broadcastBulkImport = (conferenceId) => {
  getIO().to(conferenceId).emit("conference-data-updated", { conferenceId, timestamp: Date.now() });
  getIO().emit("conference-data-updated", { conferenceId, timestamp: Date.now() });
};

export const broadcastFoodUpdate = (participant, mealType) => {
  const conferenceId = participant?.conferenceId || participant?.conferenceName;
  if (conferenceId) {
    getIO().to(conferenceId).emit("food-updated", { participantId: participant._id, meal: mealType });
  }
  getIO().emit("food-updated", { participantId: participant._id, meal: mealType });
};