import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import { API_URL } from "../../../config/api";
import * as XLSX from "xlsx";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";
import ChartsSection from "./components/ChartsSection";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConfId = searchParams.get("conferenceId") || "";

  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState(queryConfId);
  const [loadingConferences, setLoadingConferences] = useState(true);

  // Fetch all conferences to populate selection dropdown
  useEffect(() => {
    const fetchConfs = async () => {
      try {
        setLoadingConferences(true);
        const res = await fetch(`${API_URL}/api/conferences`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setConferences(list);
        
        // Auto-select conference if not set by query param
        if (!selectedConferenceId && list.length > 0) {
          // Default to first conference slug or _id
          setSelectedConferenceId(list[0].slug || list[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch conferences list", err);
      } finally {
        setLoadingConferences(false);
      }
    };
    fetchConfs();
  }, []);

  // Sync state if query parameter changes
  useEffect(() => {
    if (queryConfId) {
      setSelectedConferenceId(queryConfId);
    }
  }, [queryConfId]);

  // Load real-time database stats using hook
  const { participants, loading: loadingStats, stats } = useConferenceData(selectedConferenceId || undefined);

  const dayKey = selectedDay.toLowerCase().replace(" ", ""); // "day1"
  const mealsForDay = stats?.food?.[dayKey] || { breakfast: 0, lunch: 0, dinner: 0 };

  const handleDownloadExcel = () => {
    if (!participants || participants.length === 0) {
      alert("No registration records found to download.");
      return;
    }

    const formattedData = participants.map((p, index) => ({
      "S.No": index + 1,
      "Registration ID": p.regId || "N/A",
      "Name": p.name || "",
      "Email": p.email || "",
      "Phone": p.phone || "",
      "Category": p.category || "",
      "State/City": p.state || "",
      "Checked In": p.isCheckedIn ? "Yes" : "No",
      "Kitbag Collected": p.kitbagCollected ? "Yes" : "No",
      "Certificate Issued": p.certificateGiven ? "Yes" : "No",
      "Printed": p.printed ? "Yes" : "No",
      "Registration Date": p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registration List");

    const match = conferences.find(c => c._id === selectedConferenceId || c.slug === selectedConferenceId);
    const cleanName = (match?.name || "Event").replace(/\s+/g, "_");
    const filename = `${cleanName}_Registration_List.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const handleConfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedConferenceId(val);
    setSearchParams({ conferenceId: val });
  };

  return (
    <div className="min-h-screen bg-[#EEF1F6] w-full p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Onsite Analytics Dashboard</h1>
          <p className="text-slate-500 font-semibold mt-1">Real-time counts, distribution stats, and participant reports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Conference Select Dropdown */}
          <div className="flex flex-col gap-1 min-w-[240px] flex-1 md:flex-initial">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viewing Workspace</span>
            <select
              value={selectedConferenceId}
              onChange={handleConfChange}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm shadow-sm outline-none"
              disabled={loadingConferences}
            >
              {conferences.map((c) => (
                <option key={c._id} value={c.slug || c._id}>
                  {c.name}
                </option>
              ))}
              {conferences.length === 0 && !loadingConferences && (
                <option value="">No conferences available</option>
              )}
            </select>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadExcel}
            disabled={loadingStats || participants.length === 0}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 mt-4 md:mt-0 flex-1 md:flex-initial disabled:opacity-40 disabled:scale-100"
          >
            📥 Download Roster (.XLSX)
          </button>

          {/* Status Badge */}
          <div className="bg-emerald-50 text-emerald-700 h-11 px-4.5 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold shadow-sm mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE SYNC
          </div>
        </div>
      </div>

      {/* SYNC/LOADING NOTIFICATION */}
      {(loadingConferences || loadingStats) && (
        <div className="text-center text-xs text-blue-500 animate-pulse py-1 font-semibold">
          ⟳ Synchronizing workspace statistics with server...
        </div>
      )}

      {/* STATS */}
      <TopStats
        total={stats?.total || 0}
        checkedIn={stats?.checkedIn || 0}
        printed={stats?.printed || 0}
        certificateGiven={stats?.certificateGiven || 0}
        kitbagCollected={stats?.kitbagCollected || 0}
      />

      {/* DAY TABS */}
      <div className="pt-2">
        <DayTabs
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>

      {/* HIGHLIGHT CARDS */}
      <HighlightCards
        meals={mealsForDay}
        total={stats?.total || 0}
        selectedDay={selectedDay}
      />

      {/* CHARTS */}
      <ChartsSection
        data={{
          badges: { printed: stats?.printed || 0, issued: stats?.checkedIn || 0 },
          meals: mealsForDay,
          kitbags: {
            given: stats?.kitbagCollected || 0,
            pending: Math.max(0, (stats?.total || 0) - (stats?.kitbagCollected || 0))
          },
          certificates: {
            given: stats?.certificateGiven || 0,
            pending: Math.max(0, (stats?.total || 0) - (stats?.certificateGiven || 0))
          }
        }}
      />
    </div>
  );
};

export default Dashboard;