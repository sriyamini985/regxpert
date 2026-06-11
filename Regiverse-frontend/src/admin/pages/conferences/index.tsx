import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConference } from "../../../contexts/ConferenceContext";

const Conferences = () => {
  const navigate = useNavigate();
  const { setCurrentConferenceId } = useConference();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conferences, setConferences] = useState<any[]>([]);

  const loadConferences = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences`);
      const data = await res.json();
      setConferences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load conferences", err);
    }
  };

  useEffect(() => { loadConferences(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, name: title, slug }),
      });
      if (res.ok) {
        setTitle("");
        loadConferences();
      }
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Handles Environment Activation States Across Databases
  const handleToggleActivate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stops navigation behavior loop triggers
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences/${id}/activate`, {
        method: "PATCH",
      });
      if (res.ok) {
        loadConferences();
      }
    } catch (err) {
      console.error("Error toggling workspace state", err);
    }
  };

  const handleEnterWorkspace = (conf: any) => {
    setCurrentConferenceId(conf._id); // Locks global socket connection parameters 
    navigate(`/conference/${conf.slug || conf._id}`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HUB HEADER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Event Ecosystem</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and deploy isolated event terminal environments.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 flex items-center gap-3 text-sm font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Infrastructure Ready
          </div>
        </div>

        {/* CREATE WORKSPACE SECTION */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Initialize New Workspace</h2>
          <div className="flex gap-4">
            <input 
              className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              placeholder="Enter Conference Name (e.g., Global Tech Summit 2026)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              disabled={loading}
              onClick={handleCreate}
              className="px-8 h-14 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
            >
              {loading ? "Initializing..." : "Launch Environment"}
            </button>
          </div>
        </div>

        {/* GRID LISTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {conferences.map((conf) => (
            <div key={conf._id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">🌐</div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">{conf.title || conf.name}</h3>
                      <p className="text-xs font-mono text-blue-500 font-bold uppercase mt-1 tracking-tighter">{conf.slug}</p>
                    </div>
                  </div>
                </div>

                {/* STATUS BADGE INDICATOR BLOCK */}
                <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Terminal Status:</span>
                  <button
                    onClick={(e) => handleToggleActivate(conf._id, e)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      conf.isActive 
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" 
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {conf.isActive ? "● Active Production" : "○ Deploy Workspace"}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleEnterWorkspace(conf)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                Enter Workspace <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Conferences;