import { useState, useEffect, useCallback } from "react";
import { useConference } from "../contexts/ConferenceContext";
import { API_URL } from "../config/api";

const API = API_URL;

export const useConferenceData = (
  conferenceId: string | undefined,
  options: { statsOnly?: boolean } = {}
) => {
  const statsOnly = !!options.statsOnly;
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total: 0,
    checkedIn: 0,
    printed: 0,
    kitbagCollected: 0,
    certificateGiven: 0,
    food: (() => {
      const result: Record<string, Record<string, number>> = {};
      for (let d = 1; d <= 5; d++) {
        result[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
      }
      return result;
    })()
  });
  const { realtimeUpdate } = useConference();

  /* ================================================
     FETCH STATS ONLY FROM SERVER
  ================================================ */
  const fetchStats = useCallback(async () => {
    if (!conferenceId) return;
    try {
      const res = await fetch(`${API}/api/dashboard/stats?conferenceId=${conferenceId}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("❌ useConferenceData: Fetch stats error:", err);
    }
  }, [conferenceId]);

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
      if (statsOnly) {
        // Stats-only path: Fetch aggregated metrics, don't fetch rosters
        await fetchStats();
        setParticipants([]);
      } else {
        // Full path: Fetch complete roster list
        const fetchUrl = `${API}/api/participants/conference/${conferenceId}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        const roster = Array.isArray(data) ? data : [];
        setParticipants(roster);

        // Derive statistics locally to ensure backward compatibility
        const total = roster.length;
        const checkedIn = roster.filter((p) => p.isCheckedIn).length;
        const kitbagCollected = roster.filter((p) => p.kitbagCollected).length;
        const certificateGiven = roster.filter((p) => p.certificateGiven).length;
        const printed = roster.filter((p) => p.printed).length;

        const foodResult: Record<string, Record<string, number>> = {};
        for (let d = 1; d <= 5; d++) {
          foodResult[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
        }
        roster.forEach((p) => {
          if (!p.foodLogs) return;
          const logs = typeof p.foodLogs === "object" ? p.foodLogs : {};
          Object.entries(logs).forEach(([key, val]) => {
            if (!val) return;
            const [dayPart, mealPart] = key.split("-");
            if (foodResult[dayPart] && mealPart) {
              foodResult[dayPart][mealPart] = (foodResult[dayPart][mealPart] || 0) + 1;
            }
          });
        });

        setStats({
          total,
          checkedIn,
          printed,
          kitbagCollected,
          certificateGiven,
          food: foodResult
        });
      }
    } catch (err) {
      console.error("❌ useConferenceData: Fetch error:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [conferenceId, statsOnly, fetchStats]);

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
      if (statsOnly) {
        // Just trigger a lightweight stats refresh on scan updates
        fetchStats();
      } else {
        // Update local roster array and recompute statistics
        setParticipants((prev) => {
          const updated = prev.map((p) => (p._id === realtimeUpdate.data._id ? realtimeUpdate.data : p));
          
          const total = updated.length;
          const checkedIn = updated.filter((p) => p.isCheckedIn).length;
          const kitbagCollected = updated.filter((p) => p.kitbagCollected).length;
          const certificateGiven = updated.filter((p) => p.certificateGiven).length;
          const printed = updated.filter((p) => p.printed).length;

          const foodResult: Record<string, Record<string, number>> = {};
          for (let d = 1; d <= 5; d++) {
            foodResult[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
          }
          updated.forEach((p) => {
            if (!p.foodLogs) return;
            const logs = typeof p.foodLogs === "object" ? p.foodLogs : {};
            Object.entries(logs).forEach(([key, val]) => {
              if (!val) return;
              const [dayPart, mealPart] = key.split("-");
              if (foodResult[dayPart] && mealPart) {
                foodResult[dayPart][mealPart] = (foodResult[dayPart][mealPart] || 0) + 1;
              }
            });
          });

          setStats({
            total,
            checkedIn,
            printed,
            kitbagCollected,
            certificateGiven,
            food: foodResult
          });

          return updated;
        });
      }
    } else if (realtimeUpdate.type === "BULK_IMPORT") {
      fetchData();
    }
  }, [realtimeUpdate, fetchData, fetchStats, statsOnly]);

  return { participants, loading, refresh: fetchData, stats };
};