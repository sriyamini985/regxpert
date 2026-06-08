import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// We have mapped EVERY route from your AdminRoutes.tsx here
const modules = [
   { title: "Event-Dashboard", route: "/admin/dashboard", desc: "High-level global event analytics.", icon: "📊", color: "bg-slate-900" },
  { title: "Upload Database", route: "upload", desc: "Batch import attendee data via secure XLSX upload.", icon: "📁", color: "bg-amber-500" },
  { title: "Add Delegate", route: "add-delegate", desc: "Manual registration terminal for walk-in attendees.", icon: "👤", color: "bg-rose-500" },
  { title: "Registered List", route: "registered-list", desc: "Full database access with editing and search.", icon: "📋", color: "bg-emerald-500" },
  { title: "Bulk Email", route: "bulk-email", desc: "SMTP-powered mass communication engine.", icon: "✉️", color: "bg-purple-500" },
  { title: "Bulk WhatsApp", route: "bulk-whatsapp", desc: "Direct API integration for mobile notifications.", icon: "💬", color: "bg-green-500" },
 
];

const ConferenceDashboard = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [confName, setConfName] = useState("Loading...");
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/conferences`)
      .then(res => res.json())
      .then(data => {
        const match = data.find((c: any) => c._id === conferenceId || c.slug === conferenceId);
        if (match) setConfName(match.title || match.name);
      });
      
    fetch(`${import.meta.env.VITE_API_URL}/api/participants/conference/${conferenceId}`)
      .then(res => res.json())
      .then(data => setCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setCount(0));
  }, [conferenceId]);

  // BULLETPROOF ROUTING FIX
  const handleNavigation = (route: string) => {
    if (route.startsWith("/")) {
      // If it's a global route (like /admin/dashboard)
      navigate(route);
    } else {
      // If it's a conference-specific route, forcefully construct the absolute path
      navigate(`/admin/conference/${conferenceId}/${route}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F4F7FB] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER BAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Operations Hub</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Workspace:</span>
              <span className="text-sm font-black text-blue-600 uppercase">{confName}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-mono rounded text-slate-500 border border-slate-200">{conferenceId}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-2 md:mr-2 uppercase tracking-wider">Live Database Size: {count}</p>
          </div>
        </div>

        {/* MODULE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((m) => (
            <div key={m.title} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm flex flex-col justify-between group hover:border-blue-300 hover:shadow-md transition-all">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 shrink-0 ${m.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-inner`}>
                    {m.icon}
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{m.title}</h2>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">{m.desc}</p>
              </div>

              <button
                onClick={() => handleNavigation(m.route)}
                className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-200 hover:border-transparent active:scale-[0.98]"
              >
                Access Module <span>→</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ConferenceDashboard;