import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UserPanel = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Load ALL data for this conference on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/list/${conferenceId}`)
      .then(res => res.json())
      .then(data => setParticipants(data))
      .catch(err => console.error("Data load failed"));
  }, [conferenceId]);

  const filtered = participants.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.regId?.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <input 
        className="w-full p-4 border rounded-2xl mb-6" 
        placeholder="Search participant by name..."
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid gap-4">
        {filtered.map((p: any) => (
          <div key={p._id} className="bg-white p-6 rounded-2xl border flex justify-between">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-slate-500">{p.category}</p>
            </div>
            <button 
              onClick={() => window.open(`/admin/qr-print?id=${p._id}`, '_blank')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl"
            >
              Print Badge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPanel;