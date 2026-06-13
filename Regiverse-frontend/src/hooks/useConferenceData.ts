import { useState, useEffect, useCallback } from "react";
import { useConference } from "../contexts/ConferenceContext";
import { API_URL } from "../config/api";

const API = API_URL;

export const useConferenceData = (conferenceId: string | undefined) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { realtimeUpdate } = useConference();

  /* ================================================
     FETCH DATA FROM DATABASE
  ================================================ */
  const fetchData = useCallback(async () => {
    if (!conferenceId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchUrl = `${API}/api/participants/conference/${conferenceId}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ useConferenceData: Fetch error:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [conferenceId]);

  /* ================================================
     INITIAL FETCH
  ================================================ */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================================================
     REAL-TIME PIPELINE LISTENER
  ================================================ */
  useEffect(() => {
    if (!realtimeUpdate) return;

    if (realtimeUpdate.type === "PARTICIPANT_UPDATED") {
      setParticipants((prev) =>
        prev.map((p) => (p._id === realtimeUpdate.data._id ? realtimeUpdate.data : p))
      );
    } else if (realtimeUpdate.type === "BULK_IMPORT") {
      fetchData();
    }
  }, [realtimeUpdate, fetchData]);

  /* ================================================
     COMPUTED STATS (derived from real participant data)
  ================================================ */
  const stats = {
    total: participants.length,
    checkedIn: participants.filter((p) => p.isCheckedIn).length,
    kitbagCollected: participants.filter((p) => p.kitbagCollected).length,
    certificateGiven: participants.filter((p) => p.certificateGiven).length,
    printed: participants.filter((p) => p.printed).length,

    // Food per day per meal — derived from foodLogs Map
    food: (() => {
      const result: Record<string, Record<string, number>> = {};
      for (let d = 1; d <= 5; d++) {
        result[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
      }
      participants.forEach((p) => {
        if (!p.foodLogs) return;
        const logs = typeof p.foodLogs === "object" ? p.foodLogs : {};
        Object.entries(logs).forEach(([key, val]) => {
          if (!val) return;
          // key format: "day1-lunch"
          const [dayPart, mealPart] = key.split("-");
          if (result[dayPart] && mealPart) {
            result[dayPart][mealPart] = (result[dayPart][mealPart] || 0) + 1;
          }
        });
      });
      return result;
    })(),
  };

  return { participants, loading, refresh: fetchData, stats };
};