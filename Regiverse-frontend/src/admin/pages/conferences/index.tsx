import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/api";

const Conferences = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conferences, setConferences] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadConferences = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/conferences`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      setConferences(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load conferences", err);
      setError(err.message || "Failed to load conferences from backend");
    }
  };

  useEffect(() => { loadConferences(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
    try {
      const res = await fetch(`${API_URL}/api/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, name: title, slug }),
      });
      if (res.ok) {
        setTitle("");
        loadConferences();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error ${res.status} when creating workspace`);
      }
    } catch (err: any) {
      console.error("Create conference failed", err);
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HUB HEADER */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 p-5 sm:p-8 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Event Ecosystem</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Manage and deploy isolated event terminal environments.</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-emerald-100 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold self-start md:self-auto">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud Infrastructure Ready
          </div>
        </div>
 
        {/* ERROR DISPLAY */}
        {error && (
          <div className="bg-rose-50 text-rose-700 border border-rose-100 p-4 sm:p-5 rounded-2xl mb-8 flex items-center gap-3 font-medium text-xs sm:text-sm shadow-sm">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <span className="font-bold">Backend Connection Issue:</span> {error}
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-700 font-bold px-2.5 py-1 rounded-xl hover:bg-rose-100 transition-all"
            >
              Dismiss
            </button>
          </div>
        )}
 
        {/* CREATE WORKSPACE SECTION */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm mb-10">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4">Initialize New Workspace</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input 
              className="flex-grow h-14 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base font-medium"
              placeholder="Enter Conference Name (e.g., Global Tech Summit 2026)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button 
              disabled={loading}
              onClick={handleCreate}
              className="w-full sm:w-auto px-8 h-14 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 text-sm sm:text-base shrink-0"
            >
              {loading ? "Initializing..." : "Add Event"}
            </button>
          </div>
        </div>
 
        {/* GRID LISTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {conferences.map((conf) => (
            <div key={conf._id} className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:bg-blue-50 transition-colors">🌐</div>
                <div className="min-w-0 flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight truncate">{conf.title || conf.name}</h3>
                  <p className="text-[10px] sm:text-xs font-mono text-blue-500 font-bold uppercase mt-1 tracking-tighter truncate">{conf.slug}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/conference/${conf.slug || conf._id}`)}
                className="w-full py-3.5 sm:py-4 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-700 rounded-xl sm:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
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