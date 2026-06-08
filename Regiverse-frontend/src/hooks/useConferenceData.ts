import { useState, useEffect } from "react";

export const useConferenceData = (conferenceId: string | undefined) => {
  // Fixed: Added <any[]> to prevent the "never[]" assignment error
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!conferenceId) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`);
      
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Data fetch error:", err);
      setParticipants([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conferenceId]);

  return { participants, loading, refresh: fetchData };
};