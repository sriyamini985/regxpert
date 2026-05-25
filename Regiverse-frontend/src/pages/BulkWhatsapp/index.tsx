import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Participant {
  _id: string;
  name: string;
  phone?: string;
  conferenceId?: string;
}

const BulkWhatsapp = () => {
  const { conferenceId } = useParams();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [conferenceId]);

  const fetchParticipants = async () => {
    try {
      setFetching(true);

      console.log("CONFERENCE ID:", conferenceId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
      );

      console.log("FETCH STATUS:", response.status);

      const data = await response.json();

      console.log("PARTICIPANTS:", data);

      if (!Array.isArray(data)) {
        setParticipants([]);
        return;
      }

      setParticipants(data);
    } catch (err) {
      console.log(err);
    } finally {
      setFetching(false);
    }
  };

  const sendWhatsapp = async () => {
    try {
      if (!message.trim()) {
        alert("Please enter message");
        return;
      }

      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bulk-whatsapp/${conferenceId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        }
      );

      const data = await response.json();

      console.log("WHATSAPP RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed");
      }

      alert(
        `WhatsApp Sent Successfully

Sent: ${data.sent}
Failed: ${data.failed}`
      );
    } catch (err: any) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-8">

        <h1 className="text-4xl font-bold mb-4">
          Bulk WhatsApp Sender
        </h1>

        <p className="mb-6 text-gray-600">
          Total Delegates:
          <span className="font-bold ml-2 text-green-600">
            {participants.length}
          </span>
        </p>

        {fetching && (
          <div className="mb-5 text-green-600">
            Loading participants...
          </div>
        )}

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
          <h2 className="text-2xl font-semibold mb-4">
            Participants
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">

            {participants.map((participant) => (
              <div
                key={participant._id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {participant.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {participant.phone || "No phone"}
                  </p>
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