import { useParams } from "react-router-dom";

const BulkWhatsapp = () => {
  const { conferenceId } = useParams();

  const sendWhatsapp = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      console.log("API URL:", API_URL);
      console.log("Conference ID:", conferenceId);

      const res = await fetch(
        `${API_URL}/api/bulk-whatsapp/${conferenceId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      console.log("Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to send WhatsApp");
      }

      alert(`Successfully sent to ${data.sent || 0} users`);
    } catch (error) {
      console.error("WhatsApp Error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="p-20 flex flex-col gap-6">
      <h1 className="text-4xl font-bold">Bulk WhatsApp QR Sender</h1>

      <p className="text-gray-600">
        Send QR codes to all participants via WhatsApp
      </p>

      <button
        onClick={sendWhatsapp}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
      >
        Send WhatsApp QR Codes
      </button>
    </div>
  );
};

export default BulkWhatsapp;