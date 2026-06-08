import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`)
      .then(res => res.json())
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setFetching(false));
  }, [conferenceId]);

  const sendBulkEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please enter email subject and message");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bulk-email/${conferenceId}/send-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await response.json();
      alert(`Emails Sent: ${data.sent || 0} \nFailed: ${data.failed || 0}`);
    } catch (error) {
      alert("Failed to send emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPOSER SECTION */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm p-8 md:p-10 border border-slate-200 h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-inner">✉️</div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Email Engine</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Broadcast messages to all registered delegates.</p>
            </div>
          </div>

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email Subject Line"
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-5 outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-all text-slate-800"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Compose your message body here..."
            rows={12}
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8 outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-all resize-none text-slate-800"
          />

          <button
            onClick={sendBulkEmail}
            disabled={loading || fetching || participants.length === 0}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg active:scale-[0.98] ${
              loading || fetching || participants.length === 0 ? "bg-slate-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Transmitting..." : "Send Mass Email + QR Codes"}
          </button>
        </div>

        {/* AUDIENCE SIDEBAR */}
        <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-200 flex flex-col h-[700px]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Audience Roster</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-500 font-medium">Targeting:</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                {fetching ? "..." : participants.length} Delegates
                </span>
            </div>
          </div>

          {fetching ? (
            <div className="flex-1 flex items-center justify-center text-purple-500 font-bold text-sm animate-pulse">Loading Database...</div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {participants.map((p: any) => (
                <div key={p._id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center">
                  <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                  <p className="text-xs font-medium text-slate-500 truncate mt-1">{p.email || "No email on file"}</p>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-center text-slate-400 font-medium text-sm mt-10">No participants found.</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkEmail;