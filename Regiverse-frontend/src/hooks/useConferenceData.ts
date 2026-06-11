import { useState, useEffect } from "react";
import { useConference } from "../contexts/ConferenceContext";

export const useConferenceData = (conferenceId: string | undefined) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { realtimeUpdate } = useConference();

  const fetchData = async () => {
    if (!conferenceId) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`);
      if (!res.ok) throw new Error("Network response error");
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Data fetch error:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conferenceId]);

  // ADDED: Listens to the conference context real-time pipeline channel updates
  useEffect(() => {
    if (!realtimeUpdate) return;

    if (realtimeUpdate.type === "PARTICIPANT_UPDATED") {
      setParticipants((prev) =>
        prev.map((p) => (p._id === realtimeUpdate.data._id ? realtimeUpdate.data : p))
      );
    } else if (realtimeUpdate.type === "BULK_IMPORT") {
      fetchData();
    }
  }, [realtimeUpdate]);

  return { participants, loading, refresh: fetchData };
};