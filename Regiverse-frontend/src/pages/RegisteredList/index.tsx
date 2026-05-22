import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import SearchBar from "./components/SearchBar";

import DelegateTable from "./components/DelegateTable";

const RegisteredList = () => {

  const { conferenceId } =
    useParams();

  const [participants, setParticipants] =
    useState<any[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  /* LOAD CONFERENCE PARTICIPANTS */

  useEffect(() => {
    

fetch(
  `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
)
      .then((res) => res.json())
      .then((data) => {

        console.log(data);

        setParticipants(data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, [conferenceId]);

  /* PRINT */

  const handlePrint = (
    participant: any
  ) => {

    console.log(
      "Print:",
      participant
    );
  };

  /* LIVE SEARCH */

  const filtered = useMemo(() => {

    if (!searchQuery.trim())
      return [];

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

      {/* RESULTS */}

      {searchQuery.trim() !==
        "" && (
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