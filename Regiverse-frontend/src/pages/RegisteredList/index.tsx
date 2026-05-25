import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import SearchBar from "./components/SearchBar";
import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {
  const { conferenceId } = useParams();

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

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

  /* =========================
     PRINT
  ========================= */

  const handlePrint = (
    participant: any
  ) => {
    console.log(
      "Print:",
      participant
    );
  };

  /* =========================
     LIVE SEARCH
  ========================= */

  const filtered = useMemo(() => {
    /* SHOW ALL IF SEARCH EMPTY */

    if (!searchQuery.trim()) {
      return participants;
    }

    const q =
      searchQuery.toLowerCase();

    return participants.filter((p) =>
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
  }, [
    participants,
    searchQuery,
  ]);

  return (
    <div className="p-24 space-y-6">

      {/* SEARCH */}

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={
          setSearchQuery
        }
        onSearch={() => {}}
        onClear={() =>
          setSearchQuery("")
        }
      />

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