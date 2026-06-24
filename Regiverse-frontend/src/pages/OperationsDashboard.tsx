import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, UserCheck, LayoutGrid } from "lucide-react";

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If logged in as admin, redirect to admin conferences list
  if (user && user.role === "admin") {
    return <Navigate to="/admin/conferences" replace />;
  }

  // If logged in as user (staff operator), redirect to workspace selection
  if (user && user.role === "user") {
    return <Navigate to="/staff" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4 animate-pulse">
            <LayoutGrid className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            REGXPERTS PORTAL
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto">
            Select your destination control center to access the conference management suites.
          </p>
        </header>

        {/* 2-Column Grid for the Roles */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          {/* 1. Admin Card */}
          <div className="group relative bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Admin Control Suite
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Access complete workspace configurations, participant rosters, excel imports, whatsapp bulk campaigns, and security panels.
              </p>
            </div>
            
            <button
              onClick={() => navigate("/admin-login")}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              Enter Admin Panel
            </button>
          </div>

          {/* 2. User (Staff) Card */}
          <div className="group relative bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                Staff Terminal
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Launch operational terminals for onsite operations: attendee check-in, real-time badge printing, kitbag logs, food claims, and hall entries.
              </p>
            </div>

            <button
              onClick={() => navigate("/staff")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              Open Staff Panel
            </button>
          </div>

        </div>

        <footer className="text-center mt-16 text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} RegXperts Operations. All rights reserved.
        </footer>
      </div>
    </div>
  );
}