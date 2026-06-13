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
      // Direct socket to lock into this isolated channel room
      socket.emit("joinConferenceRoom", currentConferenceId);
      console.log(`Socket listening to workspace room channel: ${currentConferenceId}`);

      // Listen for updates specific to this conference room
      socket.on("participantUpdated", (updatedParticipant) => {
        setRealtimeUpdate({ type: "PARTICIPANT_UPDATED", data: updatedParticipant });
      });

      socket.on("conferenceDataUpdated", (data) => {
        setRealtimeUpdate({ type: "BULK_IMPORT", data });
      });
    }

    return () => {
      socket.off("participantUpdated");
      socket.off("conferenceDataUpdated");
    };
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