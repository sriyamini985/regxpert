import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {
  const { conferenceId } = useParams();

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  /* =========================
      LOAD CONFERENCE PARTICIPANTS
  ========================= */
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);

        console.log(
          "FETCHING CONFERENCE:",
          conferenceId
        );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed with status ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "PARTICIPANTS:",
          data
        );

        if (Array.isArray(data)) {
          setParticipants(data);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        console.log(
          "FETCH ERROR:",
          err
        );
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    if (conferenceId) {
      fetchParticipants();
    }
  }, [conferenceId]);

  // Extract unique categories
  const uniqueCategories = useMemo(() => {
    const cats = participants.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [participants]);

  /* =========================
      LIVE SEARCH & FILTER
  ========================= */
  const filtered = useMemo(() => {
    let result = participants;

    // 1. Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Filter by search query
    if (!searchQuery.trim()) {
      return result;
    }

    const q = searchQuery.toLowerCase();

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
    <div className="p-24 space-y-6">

      {/* SEARCH */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => {}}
        onClear={() => {
          setSearchQuery("");
          setSelectedCategory("");
        }}
      />

      {/* CATEGORY FILTER */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow border border-slate-100">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm bg-slate-50 cursor-pointer font-semibold outline-none text-slate-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
            }}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-blue-600">
          Loading participants...
        </div>
      )}

      {/* RESULTS */}
      {!loading && (
        <>
          {filtered.length > 0 ? (
            <DelegateTable
              data={filtered}
            />
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">
              No participants found
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredList;