import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; 

import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {
  const { conferenceId, conferenceSlug } = useParams();
  const currentConferenceId = conferenceId || conferenceSlug;

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState(true);
  const [isConferenceActive, setIsConferenceActive] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

/* =======================================================
      1. OPTIMIZED GAURD: VERIFY IF CONFERENCE IS ACTIVATED
  ======================================================= */
  useEffect(() => {
    const checkConferenceStatus = async () => {
      if (!currentConferenceId) {
        setErrorMessage("No active conference production selected in terminal.");
        setIsVerifyingStatus(false);
        return;
      }

      try {
        setIsVerifyingStatus(true);
        setErrorMessage(null);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences/${currentConferenceId}`);
        
        // Fallback: If route isn't configured, bypass the wall so data isn't permanently locked
        if (!res.ok) {
          console.warn("Status check route returned code:", res.status);
          setIsConferenceActive(true); 
          return;
        }

        const confData = await res.json();
        
        // Comprehensive checking for active flags (handles both boolean and text statuses)
        const active = 
          confData?.isActive === true || 
          confData?.data?.isActive === true ||
          confData?.status === "active" ||
          confData?.data?.status === "active";

        setIsConferenceActive(active);
        
        if (!active) {
          setErrorMessage("This conference workspace is currently deactivated. Search terminal is locked.");
        }
      } catch (err: any) {
        console.error("Workspace Verification Error:", err);
        // Fallback: Default to true on exceptions so administrative networks don't freeze
        setIsConferenceActive(true); 
      } finally {
        setIsVerifyingStatus(false);
      }
    };

    checkConferenceStatus();
  }, [currentConferenceId]);

  /* =======================================================
      2. LIVE REAL-TIME SUGGESTIONS (DEBUNCED ON KEYSTROKE)
  ======================================================= */
  useEffect(() => {
    // Safety Guard: Stop execution if workspace verification is pending or if it's inactive
    if (isVerifyingStatus || !isConferenceActive || !currentConferenceId) {
      return;
    }

    // If search field is empty, clear list immediately
    if (!searchQuery.trim()) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_URL
        }/api/participants?identifier=${encodeURIComponent(
          searchQuery.trim()
        )}&conferenceId=${encodeURIComponent(currentConferenceId)}`;
        
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

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentConferenceId, isConferenceActive, isVerifyingStatus]); 

  // Loading indicator while validating workspace token rules
  if (isVerifyingStatus) {
    return (
      <div className="p-24 text-center text-gray-500 font-medium">
        Validating conference workspace configuration rules...
      </div>
    );
  }

  return (
    <div className="p-24 space-y-6">
      {/* SEARCH INPUT BAR (Disabled if conference is inactive) */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => {}}
        onClear={() => setSearchQuery("")}
      />

      {/* ERROR FEEDBACK BAR */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-mono text-sm shadow-sm">
          <strong>⚠️ Access Restricted:</strong> {errorMessage}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-6 text-blue-600 font-medium">
          Searching active production master list for "{searchQuery}"...
        </div>
      )}

      {/* CONDITIONAL INTERFACE RENDER */}
      {!loading && !errorMessage && isConferenceActive && (
        <>
          {searchQuery.trim() === "" ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <span className="block text-2xl mb-1">🔍</span>
              Type a participant name, registration ID, or mobile number to fetch live suggestions instantly.
            </div>
          ) : participants.length > 0 ? (
            <DelegateTable data={participants} />
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500 border border-gray-100">
              No matching records found for "{searchQuery}" in this active conference.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredList;