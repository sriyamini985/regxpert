let io = null;

export const initSocket = (socketServer) => {
  io = socketServer;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

export const broadcastParticipantCreated = (participant) => getIO().emit("participant-created", participant);
export const broadcastParticipantUpdated = (participant) => getIO().emit("participant-updated", participant);
export const broadcastParticipantDeleted = (id) => getIO().emit("participant-deleted", id);
export const broadcastBulkImport = (conferenceId) => {
  getIO().emit("conference-data-updated", { conferenceId, timestamp: Date.now() });
};