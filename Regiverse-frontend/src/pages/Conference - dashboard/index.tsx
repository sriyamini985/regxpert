import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const cards = [
  { title: "Dashboard", route: "dashboard" },
  { title: "Upload Excel", route: "upload" },
  { title: "Add Delegate", route: "add-delegate" },
  { title: "Registered List", route: "registered-list" },
  { title: "Bulk Email", route: "bulk-email" },
  { title: "Bulk WhatsApp", route: "bulk-whatsapp" },
  { title: "Food Scan", route: "food-scan" },
  { title: "Kitbag Scan", route: "kitbag-scan" },
  { title: "Certificate Scan", route: "certificate-scan" },
  { title: "Workshop Scan", route: "workshop-scan" },
  { title: "Hall Scan", route: "hall-entry-exit-scan" },
  { title: "Mono Scan", route: "mono-scan" },
];

const ConferenceDashboard = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (!conferenceId) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`)
      .then((res) => res.json())
      .then((data) => setParticipants(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [conferenceId]);

  // Simplified navigation
  const handleNavigation = (route: string) => {
    if (route === "dashboard") {
      navigate("/admin/conferences");
    } else {
      // This works because of the nested routes in AdminRoutes.tsx
      navigate(`./${route}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 capitalize mb-10">{conferenceId}</h1>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border mb-12">
          <p className="text-gray-500">Total Delegates</p>
          <h2 className="text-5xl font-bold mt-4 text-blue-600">{participants.length}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => handleNavigation(card.route)}
              className="bg-white rounded-3xl border shadow-sm p-8 text-left hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConferenceDashboard;