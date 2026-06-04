import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const { participants, loading: fetching } = useConferenceData(conferenceId);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Bulk Email Sender</h1>
        <p className="mb-6 text-gray-600">
          Total Delegates: <span className="font-bold ml-2 text-blue-600">{participants.length}</span>
        </p>

        {fetching && <div className="mb-5 text-blue-600">Loading participants...</div>}

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email Subject"
          className="w-full border border-gray-300 p-4 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={10}
          className="w-full border border-gray-300 p-4 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={sendBulkEmail}
          disabled={loading || fetching}
          className={`px-8 py-4 rounded-xl text-white font-semibold ${loading || fetching ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Sending..." : "Send Email + QR"}
        </button>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Participants</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {participants.map((p: any) => (
              <div key={p._id} className="border rounded-xl p-4 flex justify-between items-center">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">{p.email || "No email"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmail;