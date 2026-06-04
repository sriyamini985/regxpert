import React, { useEffect, useState } from "react";

import {
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { Participant } from "./types";

import Header from "./components/Header";
import SearchBox from "./components/SearchBox";
import ResultTable from "./components/ResultCard";

const STORAGE_KEY = "certificate_users";

const certificateTypes = [
  "Participation Certificate",
  "Faculty Certificate",
  "Oral Paper Certificate",
  "E-Poster Certificate",
  "Workshop Certificate",
];

const CertificateScan: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { conferenceSlug } = useParams();

  const params = new URLSearchParams(
    location.search
  );

  const [users, setUsers] = useState<
    Participant[]
  >([]);

  const [search, setSearch] = useState("");

  const [filtered, setFiltered] =
    useState<Participant[]>([]);

  const [selectedCertificate, setSelectedCertificate] =
    useState<string | null>(
      params.get("type")
    );

  /* =========================
     LOAD USERS
  ========================= */
  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      const initial: Participant[] = [
        {
          id: "1",
          name: "Rahul Sharma",
          regId: "REG123",
          email: "rahul@mail.com",
          category: "Delegate",
        },

        {
          id: "2",
          name: "Anjali Verma",
          regId: "REG456",
          email: "anjali@mail.com",
          category: "Faculty",
        },
      ];

      setUsers(initial);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initial)
      );
    }
  }, []);

  /* =========================
     URL CHANGE SYNC
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    setSelectedCertificate(
      params.get("type")
    );
  }, [location.search]);

  /* =========================
     SAVE USERS
  ========================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );
  }, [users]);

  /* =========================
     SEARCH FILTER
  ========================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered([]);
      return;
    }

    const results = users.filter(
      (u) =>
        u.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.regId
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    setFiltered(results);
  }, [search, users]);

  /* =========================
     ISSUE CERTIFICATE
  ========================= */
  const issueCertificate = (
    user: Participant
  ) => {
    if (user.certificate?.issued) return;

    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            certificate: {
              issued: true,
              time: new Date().toISOString(),
              session:
                selectedCertificate || "",
              description:
                selectedCertificate || "",
            } as any,
          }
        : u
    );

    setUsers(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="pt-24 px-4 max-w-6xl mx-auto">

        {/* TITLE */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">
            Certificate Scan
          </h1>

          <p className="text-gray-500 mt-2">
            Select Certificate Type
          </p>
        </div>

        {/* CERTIFICATE GRID */}
        {!selectedCertificate && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

            {certificateTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedCertificate(
                    type
                  );

                  navigate(
                    `/u/${conferenceSlug}/certificate-scan?type=${encodeURIComponent(
                      type
                    )}`
                  );
                }}
                className="bg-white shadow-lg rounded-3xl p-10 hover:scale-105 transition-all border"
              >
                <h2 className="text-xl font-bold text-blue-600">
                  {type}
                </h2>

              </button>
            ))}

          </div>
        )}

        {/* SCAN SECTION */}
        {selectedCertificate && (
          <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow p-5">

              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCertificate}
                </h2>

                <p className="text-gray-500 text-sm">
                  Search & Issue Certificate
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCertificate(
                    null
                  );

                  setSearch("");

                     navigate(
                  `/u/${conferenceSlug}/certificate-scan`
                );
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-xl"
              >
                Back
              </button>
            </div>

            {/* SEARCH */}
            <SearchBox
              value={search}
              onChange={setSearch}
              onSearch={() => {}}
              suggestions={[]}
              onSelect={() => {}}
            />

            {/* RESULTS */}
            {search.trim() && (
              filtered.length > 0 ? (
                <ResultTable
                  data={filtered}
                  onIssue={
                    issueCertificate
                  }
                />
              ) : (
                <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
                  No results found
                </div>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CertificateScan;