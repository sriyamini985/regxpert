import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../services/socketService";

interface ConferenceContextProps {
  currentConferenceId: string | null;
  setCurrentConferenceId: (id: string | null) => void;
  realtimeUpdate: any;
}

export const ConferenceContext = createContext<ConferenceContextProps | null>(null);

export const ConferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentConferenceId, setCurrentConferenceId] = useState<string | null>(null);
  const [realtimeUpdate, setRealtimeUpdate] = useState<any>(null);

  useEffect(() => {
    if (currentConferenceId) {
      const joinRoom = () => {
        socket.emit("joinConferenceRoom", currentConferenceId);
        console.log(`Socket listening to workspace room channel: ${currentConferenceId}`);
      };

      // Join immediately on mount/change
      joinRoom();

      // Re-join automatically on reconnect
      socket.on("connect", joinRoom);

      // Listen for updates specific to this conference room
      socket.on("participantUpdated", (updatedParticipant) => {
        setRealtimeUpdate({ type: "PARTICIPANT_UPDATED", data: updatedParticipant });
      });

      socket.on("conferenceDataUpdated", (data) => {
        setRealtimeUpdate({ type: "BULK_IMPORT", data });
      });

      return () => {
        socket.off("connect", joinRoom);
        socket.off("participantUpdated");
        socket.off("conferenceDataUpdated");
      };
    }
  }, [currentConferenceId]);

  return (
    <ConferenceContext.Provider value={{ currentConferenceId, setCurrentConferenceId, realtimeUpdate }}>
      {children}
    </ConferenceContext.Provider>
  );
};

export const useConference = () => {
  const context = useContext(ConferenceContext);
  if (!context) throw new Error("useConference must be used within a ConferenceProvider");
  return context;
};