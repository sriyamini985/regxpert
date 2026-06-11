let io = null;

export const initSocket = (socketServer) => {
  io = socketServer;

  // Connection block must sit inside initSocket so 'io' is initialized first
  io.on("connection", (socket) => {
    console.log(`Client attached to system: ${socket.id}`);

    // Handles room grouping channel requests from your frontend Dashboard
    socket.on("joinConferenceRoom", (conferenceId) => {
      socket.join(conferenceId);
      console.log(`Socket connection ${socket.id} locked to room channel: ${conferenceId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

// Room-targeted helper broadcasts matching frontend event camelCase strings
export const broadcastParticipantCreated = (conferenceId, participant) => {
  getIO().to(conferenceId).emit("participantCreated", participant);
};

export const broadcastParticipantUpdated = (conferenceId, participant) => {
  getIO().to(conferenceId).emit("participantUpdated", participant);
};

export const broadcastParticipantDeleted = (conferenceId, id) => {
  getIO().to(conferenceId).emit("participantDeleted", id);
};

export const broadcastBulkImport = (conferenceId) => {
  getIO().to(conferenceId).emit("conferenceDataUpdated", { conferenceId, timestamp: Date.now() });
};