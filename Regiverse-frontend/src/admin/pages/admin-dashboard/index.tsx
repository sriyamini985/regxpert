import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";

const Dashboard = () => {
  const { conferenceId, conferenceSlug } = useParams();
  const currentConferenceId = conferenceId || conferenceSlug;

  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statsData, setStatsData] = useState<any>({
    "Day 1": {
      badges: { printed: 0, issued: 0 },
      meals: { breakfast: 0, lunch: 0, dinner: 0 },
      kitbags: { given: 0, pending: 0 },
      certificates: { issued: 0, pending: 0 },
      monoScan: { active: 0, total: 0 },
      workshopScan: { active: 0, total: 0 },
      hallScan: { entry: 0, exit: 0 }
    }
  });

  const fetchConferenceMetrics = async () => {
    try {
      if (!currentConferenceId) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stats/conference/${currentConferenceId}`
      );
      
      if (!response.ok) {
        throw new Error(`Metrics service returned status: ${response.status}`);
      }

      const freshData = await response.json();
      
      if (freshData && Object.keys(freshData).length > 0) {
        setStatsData(freshData);
      }
      setError(null);
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError("Unable to sync database tracking metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferenceMetrics();

    const socket = io(import.meta.env.VITE_API_URL);

    if (currentConferenceId) {
      socket.emit("joinConferenceRoom", currentConferenceId);
    }

    const handleLiveSystemUpdate = () => {
      fetchConferenceMetrics();
    };

    socket.on("participantCreated", handleLiveSystemUpdate);
    socket.on("participantUpdated", handleLiveSystemUpdate);
    socket.on("scanRecorded", handleLiveSystemUpdate);

    return () => {
      socket.off("participantCreated", handleLiveSystemUpdate);
      socket.off("participantUpdated", handleLiveSystemUpdate);
      socket.off("scanRecorded", handleLiveSystemUpdate);
      socket.disconnect();
    };
  }, [currentConferenceId]);

  const currentDayMetrics = statsData[selectedDay] || statsData["Day 1"] || {
    badges: { printed: 0, issued: 0 },
    meals: { breakfast: 0, lunch: 0, dinner: 0 },
    kitbags: { given: 0, pending: 0 },
    certificates: { issued: 0, pending: 0 },
    monoScan: { active: 0, total: 0 },
    workshopScan: { active: 0, total: 0 },
    hallScan: { entry: 0, exit: 0 }
  };

  // Compute total pool capacity directly from data to display context beautifully
  const globalTotalDelegates = currentDayMetrics.monoScan?.total || 0;

  return (
    <div className="min-h-screen bg-[#EEF1F6] flex">
      {/* SIDEBAR */}
      <div className="hidden lg:block w-64 bg-white border-r p-6 space-y-6">
        <div className="text-xl font-bold text-gray-800 tracking-tight">Regiverse Terminal</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full p-4 sm:p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Conference Analytics Overview
            </h1>
            <p className="text-sm text-gray-500">Live operational terminal data metrics feed</p>
          </div>

          <div className="bg-white px-4 py-2 rounded-lg border flex items-center gap-2 w-fit shadow-sm">
            <span className="text-sm font-medium text-gray-600">Event Status</span>
            <span className="text-green-600 font-bold animate-pulse">● LIVE</span>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 font-mono text-xs">
            ⚠️ {error} Displaying cached or backup state frames.
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-blue-600 font-bold tracking-wider animate-pulse">
            Synchronizing live analytical framework variables...
          </div>
        ) : (
          <>
            <TopStats data={currentDayMetrics} />

            <DayTabs selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

            <HighlightCards
              meals={currentDayMetrics.meals}
              selectedDay={selectedDay}
              total={globalTotalDelegates}
            />

            <ChartsSection data={currentDayMetrics} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;