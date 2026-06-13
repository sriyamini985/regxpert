import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const BulkEmail = () => {
  const { conferenceId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // New states for banner and category filtering
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setParticipants(list);
      })
      .catch(err => console.error(err))
      .finally(() => setFetching(false));
  }, [conferenceId]);

  // Helper to normalize empty categories to "Uncategorized"
  const getParticipantCategory = (p: any) => {
    return p.category && p.category.trim() !== "" ? p.category : "Uncategorized";
  };

  // Extract unique categories and initialize selections on data load
  const dbCategories = Array.from(
    new Set(participants.map(p => getParticipantCategory(p)))
  );
  const allCategoriesList = [...dbCategories, "Workshop Attendees"];

  useEffect(() => {
    if (participants.length > 0) {
      setSelectedCategories(allCategoriesList);
    }
  }, [participants]);

  // Handle banner image upload
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format (PNG, JPG, JPEG)
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid image format. Please select a PNG, JPG, or JPEG file.");
      e.target.value = "";
      return;
    }

    // Validate size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image is too large. Please select an image smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Filter participants in real-time based on categories and workshop scan status
  const filteredParticipants = participants.filter((p: any) => {
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

  const sendBulkEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      alert("Please enter email subject and message");
      return;
    }
    if (filteredParticipants.length === 0) {
      alert("No recipients selected based on the target filters");
      return;
    }
    setLoading(true);
    try {
      const participantIds = filteredParticipants.map(p => p._id);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bulk-email/${conferenceId}/send-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          message,
          bannerImage,
          participantIds
        }),
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
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPOSER SECTION */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm p-8 md:p-10 border border-slate-200 h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-inner">✉️</div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bulk Email Engine</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Broadcast messages to targeted categories.</p>
            </div>
          </div>

          {/* BANNER IMAGE UPLOAD */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Banner Image</label>
            {bannerImage ? (
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group">
                <img 
                  src={bannerImage} 
                  alt="Banner Preview" 
                  className="w-full h-48 object-cover" 
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setBannerImage(null)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95"
                  >
                    Remove Banner
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:border-purple-300">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    <span className="text-3xl mb-2">🖼️</span>
                    <p className="text-sm font-bold text-slate-700">Add Campaign Banner</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, or JPEG (Max 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handleBannerChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
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
            disabled={loading || fetching || filteredParticipants.length === 0}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg active:scale-[0.98] ${
              loading || fetching || filteredParticipants.length === 0 ? "bg-slate-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Transmitting..." : `Send Email to ${filteredParticipants.length} Recipients`}
          </button>
        </div>

        {/* TARGET AUDIENCE & ROSTER SIDEBAR */}
        <div className="flex flex-col gap-6">
          
          {/* TARGET AUDIENCE SELECTION */}
          <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Target Audience</h2>
              <div className="flex gap-2">
                <button 
                  onClick={selectAllCategories}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
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

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {allCategoriesList.map((cat) => {
                const count = participants.filter((p: any) => {
                  if (cat === "Workshop Attendees") {
                    return p.workshopScans && p.workshopScans.length > 0;
                  }
                  return getParticipantCategory(p) === cat;
                }).length;

                return (
                  <label key={cat} className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-100 transition-all select-none">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1 flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700">{cat}</span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-black border border-purple-100">
                        {count}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* AUDIENCE ROSTER */}
          <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-slate-200 flex flex-col h-[400px]">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Audience Roster</h2>
              <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500 font-medium">Targeting:</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                    {fetching ? "..." : `${filteredParticipants.length} / ${participants.length}`}
                  </span>
              </div>
            </div>

            {fetching ? (
              <div className="flex-1 flex items-center justify-center text-purple-500 font-bold text-sm animate-pulse">Loading Database...</div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                {filteredParticipants.map((p: any) => (
                  <div key={p._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-xs truncate">{p.name}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{p.email || "No email on file"}</p>
                    </div>
                    <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200 capitalize">
                      {getParticipantCategory(p)}
                    </span>
                  </div>
                ))}
                {filteredParticipants.length === 0 && (
                  <div className="text-center text-slate-400 font-medium text-sm mt-10">No recipients match current filters.</div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BulkEmail;