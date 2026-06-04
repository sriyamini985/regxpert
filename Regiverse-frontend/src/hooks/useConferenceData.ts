import { useState, useEffect } from "react";

export const useConferenceData = (conferenceId: string | undefined) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!conferenceId) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`);
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conferenceId]);

  return { participants, loading, refresh: fetchData };
};