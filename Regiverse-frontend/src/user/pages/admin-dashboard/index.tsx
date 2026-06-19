import { useState } from "react";
import { useParams } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";

const Dashboard = () => {
  const { conferenceSlug } = useParams<"conferenceSlug">();
  console.log("📊 Dashboard rendered with conferenceSlug:", conferenceSlug);
  const [selectedDay, setSelectedDay] = useState("Day 1");

  // REAL-TIME data — auto-updates on every scan via Socket.IO
  const { loading, stats } = useConferenceData(conferenceSlug, { statsOnly: true });

  // Map "Day 1" → "day1" for food stats lookup
  const dayKey = selectedDay.toLowerCase().replace(" ", ""); // "day1"

  const mealsForDay = stats.food[dayKey] || { breakfast: 0, lunch: 0, dinner: 0 };

  return (
    <div className="w-full space-y-6 p-2 sm:p-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">📊 Onsite Operations Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time attendance, kitbags, food distribution, and workshop stats.</p>
        </div>
        <div className="bg-white px-4.5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-2.5 w-fit">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Event Status: LIVE</span>
        </div>
      </div>

      {/* LOADING INDICATOR */}
      {loading && (
        <div className="text-center text-xs text-blue-500 animate-pulse py-1">
          ⟳ Synchronizing live attendee data...
        </div>
      )}

      {/* STATS — real counts from database */}
      <TopStats
        total={stats.total}
        checkedIn={stats.checkedIn}
        kitbagCollected={stats.kitbagCollected}
        certificateGiven={stats.certificateGiven}
        printed={stats.printed}
      />

      {/* DAY TABS */}
      <div className="pt-2">
        <DayTabs
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>

      {/* HIGHLIGHT CARDS — real food data for selected day */}
      <HighlightCards
        meals={mealsForDay}
        total={stats.total}
        selectedDay={selectedDay}
      />

      {/* CHARTS — real data */}
      <ChartsSection
        data={{
          badges: { 
            printed: stats.printed, 
            notPrinted: Math.max(0, stats.total - stats.printed) 
          },
          meals: mealsForDay,
          kitbags: {
            given: stats.kitbagCollected,
            pending: Math.max(0, stats.total - stats.kitbagCollected)
          },
          certificates: {
            issued: stats.certificateGiven,
            pending: Math.max(0, stats.total - stats.certificateGiven)
          },
        }}
      />
    </div>
  );
};

export default Dashboard;