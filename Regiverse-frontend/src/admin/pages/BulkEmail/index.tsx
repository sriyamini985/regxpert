import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Participant {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setFetching(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load participants (${response.status})`);
        }

        const data = await response.json();
        setParticipants(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch Participants Error:", error);
      } finally {
        setFetching(false);
      }
    };

    if (conferenceId) {
      fetchParticipants();
    }
  }, [conferenceId]);

  const sendBulkEmail = async () => {
    try {
      if (!subject.trim()) {
        alert("Please enter email subject");
        return;
      }

      if (!message.trim()) {
        alert("Please enter email message");
        return;
      }

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bulk-email/${conferenceId}/send-emails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send emails");
      }

      alert(`Emails Sent: ${data.sent || 0} \nFailed: ${data.failed || 0}`);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Bulk Email Sender</h1>
        <p className="mb-6 text-gray-600">
          Total Delegates:
          <span className="font-bold ml-2 text-blue-600">{participants.length}</span>
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
          className={`px-8 py-4 rounded-xl text-white font-semibold transition-all ${
            loading || fetching
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Email + QR"}
        </button>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Participants</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant._id} className="border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{participant.name}</p>
                  <p className="text-sm text-gray-500">{participant.email || "No email"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmail;