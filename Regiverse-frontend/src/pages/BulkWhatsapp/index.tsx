import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Participant {
  _id: string;
  name: string;
  phone?: string;
}

const BulkWhatsapp = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);
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
        const data = await response.json();
        setParticipants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    if (conferenceId) {
      fetchParticipants();
    }
  }, [conferenceId]);

  const sendWhatsapp = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bulk-whatsapp/${conferenceId}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send WhatsApp");
      }

      alert(`Successfully sent to ${data.sent} delegates. Failed: ${data.failed || 0}`);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Bulk WhatsApp Sender</h1>
        <p className="mb-6 text-gray-600">
          Total Delegates:
          <span className="font-bold ml-2 text-green-600">{participants.length}</span>
        </p>

        {fetching && <div className="mb-5 text-green-600">Loading participants...</div>}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write WhatsApp message..."
          rows={10}
          className="w-full border border-gray-300 p-4 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={sendWhatsapp}
          disabled={loading || fetching}
          className={`px-8 py-4 rounded-xl text-white font-semibold transition-all ${
            loading || fetching
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Sending..." : "Send WhatsApp"}
        </button>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Participants</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant._id} className="border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{participant.name}</p>
                  <p className="text-sm text-gray-500">{participant.phone || "No phone"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkWhatsapp;