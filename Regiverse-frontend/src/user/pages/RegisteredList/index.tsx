import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {
  const { conferenceSlug } = useParams<"conferenceSlug">();
  const { participants, loading } = useConferenceData(conferenceSlug);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Extract all unique categories present in the current database roster
  const uniqueCategories = useMemo(() => {
    const cats = participants.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [participants]);

  /* ===========================
     CLIENT-SIDE FILTERING (Fast & Responsive)
  =========================== */
  const filteredParticipants = useMemo(() => {
    let result = participants;

    // 1. Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Filter by search query
    if (!searchQuery.trim()) {
      return result;
    }

    const q = searchQuery.toLowerCase().trim();

    return result.filter((p) =>
      [
        p.name,
        p.email,
        p.phone,
        p.regId,
      ]
        .filter(Boolean)
        .some((v) =>
          String(v)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [participants, searchQuery, selectedCategory]);

  return (
    <div className="space-y-5 font-sans text-slate-800">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📋 Registered List</h1>
          <p className="text-slate-500 text-sm mt-1">
            Search participants — filter by category or type name, Reg ID, or mobile number
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            Total Roster: {filteredParticipants.length} / {participants.length}
          </div>
          <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Real-time Sync Active
          </div>
        </div>
      </div>

      {/* SEARCH BAR & CATEGORY FILTER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by name, Reg ID, or mobile..."
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-850 text-sm font-medium"
          />

          {/* Category Dropdown */}
          <div className="min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm outline-none cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition text-sm whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && participants.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-blue-600 font-medium text-sm animate-pulse">
          ⟳ Loading participants...
        </div>
      )}

      {/* EMPTY REGISTERED LIST (Total is 0) */}
      {!loading && participants.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <span className="block text-3xl mb-2">👥</span>
          No delegates registered for this conference yet.
        </div>
      )}

      {/* NO RESULTS FROM SEARCH/FILTER */}
      {!loading && participants.length > 0 && filteredParticipants.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500 border border-gray-100 text-sm">
          No participants found matching selected filters.
        </div>
      )}

      {/* RESULTS TABLE */}
      {filteredParticipants.length > 0 && (
        <DelegateTable data={filteredParticipants} />
      )}
    </div>
  );
};

export default RegisteredList;