import { useState, useEffect } from "react";
import { useConference } from "../../../contexts/ConferenceContext";
import { useConferenceData } from "../../../hooks/useConferenceData";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const { currentConferenceId } = useConference();
  
  const { participants } = useConferenceData(currentConferenceId || undefined);

  const [liveMetrics, setLiveMetrics] = useState({
    badges: { printed: 0, notPrinted: 0 }, // FIXED: Aligned properties to track printed and notPrinted
    meals: { breakfast: 0, lunch: 0, dinner: 0 },
    kitbags: { given: 0, pending: 0 },
    certificates: { issued: 0, pending: 0 }
  });

  useEffect(() => {
    if (!participants) return;

    const totalCount = participants.length;
    
    // Calculate metric parameters from underlying reactive array
    const totalPrinted = participants.filter((p: any) => p.isBadgePrinted === true).length;
    const totalKitbags = participants.filter((p: any) => p.kitbagCollected === true).length;
    const totalCertificates = participants.filter((p: any) => p.certificateGiven === true).length;

    const dayToken = selectedDay.toLowerCase().replace(" ", ""); 
    
    const breakfastScans = participants.filter((p: any) => p.foodLogs?.[`${dayToken}_breakfast`] === true).length;
    const lunchScans = participants.filter((p: any) => p.foodLogs?.[`${dayToken}_lunch`] === true).length;
    const dinnerScans = participants.filter((p: any) => p.foodLogs?.[`${dayToken}_dinner`] === true).length;

    // Set metrics with updated object keys matching the Badges chart schema
    setLiveMetrics({
      badges: { 
        printed: totalPrinted,                              // Actual number printed
        notPrinted: Math.max(0, totalCount - totalPrinted)  // Remaining unprinted list balance
      },
      meals: { 
        breakfast: breakfastScans, 
        lunch: lunchScans, 
        dinner: dinnerScans 
      },
      kitbags: { 
        given: totalKitbags, 
        pending: Math.max(0, totalCount - totalKitbags) 
      },
      certificates: { 
        issued: totalCertificates, 
        pending: Math.max(0, totalCount - totalCertificates) 
      }
    });
  }, [participants, selectedDay]);

  return (
    <div className="min-h-screen bg-[#EEF1F6] flex">
      <div className="hidden lg:block w-64 bg-white border-r p-6 space-y-6">
        <div className="h-4" />
      </div>

      <div className="flex-1 w-full p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Operational Dashboard</h1>
            <p className="text-sm text-gray-500">Realtime Event Metrics Overview</p>
          </div>

          <div className="bg-white px-4 py-2 rounded-lg border flex items-center gap-2 w-fit">
            <span className="text-sm text-gray-600">Event Status</span>
            <span className="text-green-600 font-semibold animate-pulse">● LIVE</span>
          </div>
        </div>

        <TopStats 
          statsData={{
            totalDelegates: participants.length,
            badgesPrinted: participants.filter((p: any) => p.isBadgePrinted).length,
            certificatesIssued: liveMetrics.certificates.issued,
            kitBagsDelivered: liveMetrics.kitbags.given
          }}
        />

        <DayTabs
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />

        <HighlightCards
          meals={liveMetrics.meals}
          total={participants.length}
          selectedDay={selectedDay}
        />

        {/* This section passes the updated liveMetrics object to ChartsSection and downstream charts */}
        <ChartsSection data={liveMetrics} />
      </div>
    </div>
  );
};

export default Dashboard;