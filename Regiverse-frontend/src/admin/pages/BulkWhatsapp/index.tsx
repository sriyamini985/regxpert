import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Participant {
  _id: string;
  name: string;
  phone?: string;
  category?: string;
  workshopScans?: string[];
  conferenceId?: string;
}

const BulkWhatsapp = () => {
  const { conferenceId } = useParams();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // States for category targeting
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchParticipants();
  }, [conferenceId]);

  const fetchParticipants = async () => {
    try {
      setFetching(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`
      );
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setParticipants(list);
    } catch (err) {
      console.log(err);
    } finally {
      setFetching(false);
    }
  };

  // Helper to normalize category name
  const getParticipantCategory = (p: Participant) => {
    return p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
  };

  // Extract unique categories and append Workshop Attendees
  const dbCategories = Array.from(
    new Set(participants.map(p => getParticipantCategory(p)))
  );
  const allCategoriesList = [...dbCategories, "Workshop Attendees"];

  useEffect(() => {
    if (participants.length > 0) {
      setSelectedCategories(allCategoriesList);
    }
  }, [participants]);

  // Real-time filter based on selection
  const filteredParticipants = participants.filter((p: Participant) => {
    const cat = getParticipantCategory(p);
    const categoryMatch = selectedCategories.includes(cat);

    const isWorkshopAttendee = p.workshopScans && p.workshopScans.length > 0;
    const workshopMatch = selectedCategories.includes("Workshop Attendees") && isWorkshopAttendee;

    return categoryMatch || workshopMatch;
  });

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories(allCategoriesList);
  };

  const selectNoneCategories = () => {
    setSelectedCategories([]);
  };

  const sendWhatsapp = async () => {
    try {
      if (!message.trim()) {
        alert("Please enter message");
        return;
      }
      if (filteredParticipants.length === 0) {
        alert("No recipients selected based on the target filters");
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
            participantIds: filteredParticipants.map(p => p._id),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed");
      }

      alert(
        `WhatsApp Broadcast Sent Successfully\n\nSent: ${data.sent}\nFailed: ${data.failed}`
      );
    } catch (err: any) {
      console.log(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-4 sm:p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* COMPOSER SECTION */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm p-5 sm:p-8 md:p-10 border border-slate-200 h-fit">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl shadow-inner">💬</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Bulk WhatsApp Broadcast</h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Deliver direct mobile notification templates.</p>
            </div>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write WhatsApp message body here..."
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base font-medium transition-all resize-none text-slate-800"
          />

          <button
            onClick={sendWhatsapp}
            disabled={loading || fetching || filteredParticipants.length === 0}
            className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-base sm:text-lg transition-all shadow-lg active:scale-[0.98] ${
              loading || fetching || filteredParticipants.length === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Sending..." : `Send WhatsApp to ${filteredParticipants.length} Recipients`}
          </button>
        </div>

        {/* TARGET AUDIENCE & ROSTER SIDEBAR */}
        <div className="flex flex-col gap-6">
          
          {/* TARGET AUDIENCE SELECTION */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm p-5 sm:p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Target Audience</h2>
              <div className="flex gap-2">
                <button 
                  onClick={selectAllCategories}
                  className="text-xs font-bold text-green-600 hover:text-green-800 transition-colors"
                >
                  All
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <button 
                  onClick={selectNoneCategories}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  None
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[180px] sm:max-h-[220px] overflow-y-auto pr-1">
              {allCategoriesList.map((cat) => {
                const count = participants.filter((p) => {
                  if (cat === "Workshop Attendees") {
                    return p.workshopScans && p.workshopScans.length > 0;
                  }
                  return getParticipantCategory(p) === cat;
                }).length;

                return (
                  <label key={cat} className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-100 transition-all select-none">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 sm:w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <div className="flex-1 flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-bold text-slate-700">{cat}</span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] sm:text-xs font-black border border-green-100">
                        {count}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* AUDIENCE ROSTER */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm p-5 sm:p-6 border border-slate-200 flex flex-col h-[300px] sm:h-[400px]">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Audience Roster</h2>
              <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">Targeting:</span>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm font-bold border border-green-100">
                    {fetching ? "..." : `${filteredParticipants.length} / ${participants.length}`}
                  </span>
              </div>
            </div>

            {fetching ? (
              <div className="flex-1 flex items-center justify-center text-green-600 font-bold text-xs sm:text-sm animate-pulse">Loading Database...</div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {filteredParticipants.map((p) => (
                  <div key={p._id} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 sm:p-3 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-[11px] sm:text-xs truncate">{p.name}</p>
                      <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 truncate mt-0.5">{p.phone || "No phone number"}</p>
                    </div>
                    <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] sm:text-[9px] font-bold border border-slate-200 capitalize">
                      {getParticipantCategory(p)}
                    </span>
                  </div>
                ))}
                {filteredParticipants.length === 0 && (
                  <div className="text-center text-slate-400 font-medium text-xs sm:text-sm mt-10">No recipients match current filters.</div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BulkWhatsapp;