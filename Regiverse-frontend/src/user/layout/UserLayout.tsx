import React from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../components/AppIcon"; // Adjust if AppIcon path varies

export default function UserLayout() {
  // To this:
const { conferenceSlug } = useParams<"conferenceSlug">();
  const { logout, user } = useAuth();
  const location = useLocation();

  // Navigation Links configuration
  const menuItems = [
     
    { name: "Dashboard", path: `/u/${conferenceSlug}` },
    { name: "Onsite-Dashboard", path: `/u/${conferenceSlug}/admin-dashboard` },
    { name: "Check-In Station", path: `/u/${conferenceSlug}/check-in` },
    { name: "Food counter", path: `/u/${conferenceSlug}/event-registration` },
    { name: "Hall Entry/Exit", path: `/u/${conferenceSlug}/hall-scan` },
    { name: "Workshop Scanner", path: `/u/${conferenceSlug}/workshop` },
    { name: "Mono Scan", path: `/u/${conferenceSlug}/mono-scan` },
    { name: "Certificate Scan", path: `/u/${conferenceSlug}/certificate` },
    { name: "Registered List", path: `/u/${conferenceSlug}/RegisteredList` },
    { name: "Participant Management", path: `/u/${conferenceSlug}/participant-management` },
      
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Fixed Operator Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-xl">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-bold tracking-wider text-sm">
              REG
            </div>
            <div>
              <h1 className="font-bold text-md leading-tight">Regiverse</h1>
              <p className="text-xs text-slate-400">Staff Terminal</p>
            </div>
          </div>

          {/* Contextual Active Conference Display */}
          <div className="px-4 py-3 bg-slate-800/50 m-3 rounded-lg border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Workspace</p>
            <p className="text-sm font-semibold text-blue-400 truncate mt-0.5">{conferenceSlug}</p>
          </div>

          {/* Navigation Links Mapping */}
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session Bottom Profile Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold truncate text-slate-200">{user?.email || "Operator Station"}</p>
            <p className="text-[10px] text-green-400 flex items-center gap-1 font-medium mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
              Online
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors group"
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main UI View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Core Screen Space with Layout Outlet */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}