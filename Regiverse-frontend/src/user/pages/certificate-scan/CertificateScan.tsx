import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LoadingBar from "../../../components/ui/LoadingBar";

// 1. Types మరియు API URLs ఇంపోర్ట్ చేసుకోవడం
import { Participant } from "./types";
import SearchBox from "./components/SearchBox";
import ResultTable from "./components/ResultCard";

import { API_URL as API } from "../../../config/api";

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
  const params = new URLSearchParams(location.search);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Participant[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    params.get("type")
  );

  // అలర్ట్ మెసేజ్ చూపెట్టడానికి స్టేట్
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* =========================
     URL CHANGE SYNC
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCertificate(params.get("type"));
    setFeedback(null);
    setSearch("");
    setFiltered([]);
  }, [location.search]);

  /* =========================
     API ద్వారా రియల్-టైమ్ సెర్చ్ (Debounce తో)
  ========================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered([]);
      return;
    }

    const delay = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API}/api/participants?identifier=${encodeURIComponent(
            search.trim()
          )}&conferenceId=${conferenceSlug}`
        );
        const data = await res.json();
        const participants = Array.isArray(data) ? data : data?.data || [];
        setFiltered(participants);
      } catch (err) {
        console.error("Error fetching participants:", err);
        setFiltered([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms టైపింగ్ డీలాయ్

    return () => clearTimeout(delay);
  }, [search, conferenceSlug]);

  /* =========================
     API ద్వారా సర్టిఫికేట్ ఇష్యూ చేయడం 
  ========================= */
  const issueCertificate = async (user: any) => {
    // ఒకవేళ సర్టిఫికేట్ ఇదివరకే ఇచ్చి ఉంటే మళ్ళీ ఇవ్వకూడదు
    if (user.certificateGiven || user.certificate?.issued) {
      setFeedback({
        type: "error",
        message: "⚠️ Certificate already issued to this participant.",
      });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const body = {
        identifier: user.regId || user._id,
        scanType: "certificate", // ఇక్కడ "certificate" అని పంపిస్తున్నాము
        conferenceId: conferenceSlug,
        participantId: String(user._id),
        certificateType: selectedCertificate, // సెలెక్ట్ చేసిన సర్టిఫికేట్ టైప్
      };

      const res = await fetch(`${API}/api/participants/verify-and-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.msg || "❌ Failed to issue certificate.",
        });
      } else {
        setFeedback({
          type: "success",
          message: `✅ Certificate issued successfully to ${user.name}!`,
        });

        // UI లో ఉన్న యూజర్ లిస్ట్‌ను వెంటనే అప్‌డేట్ చేయడం
        setFiltered((prev) =>
          prev.map((u: any) =>
            u._id === user._id ? { ...u, certificateGiven: true } : u
          )
        );
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: "❌ Network error. Check your connection.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingBar isLoading={isLoading || isProcessing} />

      <div className="pt-24 px-4 max-w-6xl mx-auto">
        {/* TITLE */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800">🎓 Certificate Scan</h1>
          <p className="text-gray-500 mt-2">
            {!selectedCertificate
              ? "Select Certificate Type to Begin"
              : "Search and Issue Real-time Certificate"}
          </p>
        </div>

        {/* CERTIFICATE GRID */}
        {!selectedCertificate && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {certificateTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedCertificate(type);
                  navigate(
                    `/u/${conferenceSlug}/certificate-scan?type=${encodeURIComponent(
                      type
                    )}`
                  );
                }}
                className="bg-white shadow-md rounded-3xl p-8 hover:scale-105 transition-all border border-slate-100 hover:border-blue-400 text-center"
              >
                <h2 className="text-lg font-bold text-blue-600">{type}</h2>
              </button>
            ))}
          </div>
        )}

        {/* SCAN & SEARCH SECTION */}
        {selectedCertificate && (
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedCertificate}
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Database Connected Search
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCertificate(null);
                  setSearch("");
                  setFiltered([]);
                  navigate(`/u/${conferenceSlug}/certificate-scan`);
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition"
              >
                Back
              </button>
            </div>

            {/* FEEDBACK BANNER */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border-2 ${
                  feedback.type === "success"
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-red-50 border-red-300 text-red-800"
                }`}
              >
                <p className="font-bold text-sm">{feedback.message}</p>
              </div>
            )}

            {/* SEARCH BOX */}
            <SearchBox
              value={search}
              onChange={setSearch}
              onSearch={() => {}}
              suggestions={[]}
              onSelect={() => {}}
            />

            {/* RESULTS TABLE */}
            {search.trim() && (
              filtered.length > 0 ? (
                <ResultTable
                  data={filtered}
                  onIssue={issueCertificate}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-gray-500">
                  No participants found in database.
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