import { useEffect, useState } from "react";

import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* =======================================================
      LIVE REAL-TIME SUGGESTIONS (DEBUNCED ON KEYSTROKE)
  ======================================================= */
  useEffect(() => {
    // If search field is empty, do not load any data
    if (!searchQuery.trim()) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Debounce: Waits for the user to pause typing for 300ms before sending the request
    const delayDebounceFn = setTimeout(async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/participants?identifier=${encodeURIComponent(searchQuery)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Server status issue: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setParticipants(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setParticipants(data.data);
        } else {
          setParticipants([]);
        }
      } catch (err: any) {
        console.error("Instant Search Error:", err);
        setErrorMessage(err.message || "Failed to search records.");
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup function clears out the timer if user presses another key within 300ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="p-24 space-y-6">
      {/* SEARCH INPUT BAR */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => {}}
        onClear={() => setSearchQuery("")}
      />

      {/* ERROR FEEDBACK BAR */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-mono text-sm shadow-sm">
          <strong>⚠️ Search Blocked:</strong> {errorMessage}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-blue-600 font-medium">
          Searching master list for "{searchQuery}"...
        </div>
      )}

      {/* CONDITIONAL INTERFACE RENDER */}
      {!loading && (
        <>
          {searchQuery.trim() === "" ? (
            /* INITIAL INACTIVE LOOK: No Data Loaded First */
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <span className="block text-2xl mb-1">🔍</span>
              Type a participant name, registration ID, or mobile number to fetch live suggestions instantly.
            </div>
          ) : participants.length > 0 ? (
            /* SUGGESTIONS FOUND */
            <DelegateTable data={participants} />
          ) : (
            /* NO SUGGESTIONS FOUND */
            <div className="bg-white rounded-xl shadow p-6 text-gray-500 border border-gray-100">
              No matching records found for "{searchQuery}".
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredList; 