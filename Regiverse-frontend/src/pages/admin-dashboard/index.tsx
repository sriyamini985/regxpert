import { useState } from "react";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState("Day 1");

  const allDaysData: Record<string, any> = {
  "Day 1": {
    badges: { printed: 52, issued: 45 },
    meals: { breakfast: 30, lunch: 50, dinner: 80 },
    kitbags: { given: 80, pending: 38 },
    certificates: { issued: 10, pending: 108 }
  },
  "Day 2": {
    badges: { printed: 40, issued: 30 },
    meals: { breakfast: 20, lunch: 40, dinner: 60 },
    kitbags: { given: 60, pending: 20 },
    certificates: { issued: 15, pending: 90 }
  },
  "Day 3": {
    badges: { printed: 60, issued: 50 },
    meals: { breakfast: 35, lunch: 55, dinner: 75 },
    kitbags: { given: 90, pending: 28 },
    certificates: { issued: 30, pending: 88 }
  },
  "Day 4": {
    badges: { printed: 48, issued: 40 },
    meals: { breakfast: 25, lunch: 45, dinner: 70 },
    kitbags: { given: 70, pending: 48 },
    certificates: { issued: 20, pending: 98 }
  },
  "Day 5": {
    badges: { printed: 76, issued: 39 },
    meals: { breakfast: 98, lunch: 87, dinner: 65 },
    kitbags: { given: 12, pending: 34 },
    certificates: { issued: 20, pending: 78 }
  },
};

  return (
    <div className="min-h-screen bg-[#EEF1F6] flex">

      {/* ✅ SIDEBAR (HIDDEN ON MOBILE) */}
      <div className="hidden lg:block w-64 bg-white border-r p-6 space-y-6">
        <div>
         
          
        </div>

        <div>
          <div className="space-y-3">
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 w-full p-4 sm:p-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>

          </div>

          <div className="bg-white px-4 py-2 rounded-lg border flex items-center gap-2 w-fit">
            <span className="text-sm">Event Status</span>
            <span className="text-green-600 font-semibold">● LIVE</span>
          </div>
        </div>

        {/* STATS */}
        <TopStats />

        {/* DAY TABS */}
        <DayTabs
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />

        {/* HIGHLIGHT CARDS */}
        <HighlightCards
          meals={allDaysData[selectedDay].meals}
          total={118}
          selectedDay={selectedDay}
        />

        {/* CHARTS */}
        <ChartsSection
          data={allDaysData[selectedDay] || allDaysData["Day 1"]}
        />
      </div>
    </div>
  );
};

export default Dashboard;