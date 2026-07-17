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

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCertificate(params.get("type"));
    setFeedback(null);
    setSearch("");
    setFiltered([]);
  }, [location.search]);

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
    }, 300);

    return () => clearTimeout(delay);
  }, [search, conferenceSlug]);

const issueCertificate = async (user: any) => {
    // 1. Check if already issued
    if (user.certificateGiven || user.certificate?.issued) {
      setFeedback({
        type: "error",
        message: "⚠️ Certificate already issued to this participant.",
      });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    const finalParticipantId = String(user._id || user.id);
    const finalRegId = user.regId || finalParticipantId;
    const finalConferenceId = user.conferenceId || conferenceSlug;

    try {
      const body = {
        identifier: finalRegId,
        // 🚨 MUST BE EXACTLY "certificate" so the backend controller detects it
        scanType: "certificate", 
        conferenceId: finalConferenceId,
        participantId: finalParticipantId,
        certificateType: selectedCertificate,
      };

      // 🚨 USE THE CORRECT ROUTE THAT EXISTS IN YOUR BACKEND
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

        // Update UI
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
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-800">🎓 Certificate Scan</h1>
          <p className="text-gray-500 mt-2">
            {!selectedCertificate ? "Select Certificate Type to Begin" : "Search and Issue Real-time Certificate"}
          </p>
        </div>

        {!selectedCertificate && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {certificateTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedCertificate(type);
                  navigate(`/u/${conferenceSlug}/certificate-scan?type=${encodeURIComponent(type)}`);
                }}
                className="bg-white shadow-md rounded-3xl p-8 hover:scale-105 transition-all border border-slate-100 hover:border-blue-400 text-center"
              >
                <h2 className="text-lg font-bold text-blue-600">{type}</h2>
              </button>
            ))}
          </div>
        )}

        {selectedCertificate && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedCertificate}</h2>
                <p className="text-gray-500 text-xs mt-1">Database Connected Search</p>
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

            {feedback && (
              <div className={`p-4 rounded-xl border-2 ${feedback.type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
                <p className="font-bold text-sm">{feedback.message}</p>
              </div>
            )}

            <SearchBox value={search} onChange={setSearch} onSearch={() => {}} suggestions={[]} onSelect={() => {}} />

            {search.trim() && (
              filtered.length > 0 ? (
                <ResultTable data={filtered} onIssue={issueCertificate} />
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