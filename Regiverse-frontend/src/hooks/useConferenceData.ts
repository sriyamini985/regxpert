import { useState, useEffect, useCallback } from "react";
import { socket } from "../services/socketService";
import { API_URL } from "../config/api";

const API = API_URL;

export const useConferenceData = (conferenceId: string | undefined) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.log(`🌐 useConferenceData: Fetching from ${fetchUrl}`);
      const res = await fetch(fetchUrl);
      console.log(`🌐 useConferenceData: Response status: ${res.status}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      console.log(`🌐 useConferenceData: Fetched ${data?.length || 0} participants`);
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
     REAL-TIME: JOIN CONFERENCE ROOM & LISTEN TO SOCKET EVENTS
     Any scan/create/update/delete re-fetches fresh data instantly
  ================================================ */
  useEffect(() => {
    if (!conferenceId) return;

    const joinRoom = () => {
      console.log(`📡 Socket emitting join-conference for room: ${conferenceId}`);
      socket.emit("join-conference", conferenceId);
    };

    // Join room immediately if socket is already connected
    if (socket.connected) {
      joinRoom();
    }

    // Automatically rejoin room on every connect / reconnect event
    socket.on("connect", joinRoom);

    // ---- EVENT LISTENERS ----

    // New participant registered
    const onCreated = () => {
      console.log("🔔 Real-time: participant created → refreshing");
      fetchData();
    };

    // Any participant updated (check-in, kitbag, certificate, food, etc.)
    const onUpdated = () => {
      console.log("🔔 Real-time: participant updated → refreshing");
      fetchData();
    };

    // Participant deleted
    const onDeleted = () => {
      console.log("🔔 Real-time: participant deleted → refreshing");
      fetchData();
    };

    // Bulk import (CSV/Excel upload from admin)
    const onBulkImport = (payload: any) => {
      if (!payload?.conferenceId || payload.conferenceId === conferenceId) {
        console.log("🔔 Real-time: bulk import → refreshing");
        fetchData();
      }
    };

    // Food scan event
    const onFoodUpdated = () => {
      console.log("🔔 Real-time: food updated → refreshing");
      fetchData();
    };

    socket.on("participant-created", onCreated);
    socket.on("participant-updated", onUpdated);
    socket.on("participant-deleted", onDeleted);
    socket.on("conference-data-updated", onBulkImport);
    socket.on("food-updated", onFoodUpdated);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("participant-created", onCreated);
      socket.off("participant-updated", onUpdated);
      socket.off("participant-deleted", onDeleted);
      socket.off("conference-data-updated", onBulkImport);
      socket.off("food-updated", onFoodUpdated);
      socket.emit("leave-conference", conferenceId);
    };
  }, [conferenceId, fetchData]);

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