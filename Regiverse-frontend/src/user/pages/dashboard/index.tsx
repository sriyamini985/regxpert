import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  // Configuration for the operator quick-action cards
  const operationalModules = [
    {
      title: "Check-In Station",
      desc: "Scan QR codes to mark attendees as arrived and print badges.",
      path: `/u/${conferenceSlug}/check-in`,
      color: "bg-blue-600",
      icon: "🎫"
    },
    {
      title: "Food Counter",
      desc: "Verify meal access and log dietary distributions.",
      path: `/u/${conferenceSlug}/event-registration`,
      color: "bg-orange-500",
      icon: "🍽️"
    },
    {
      title: "Hall Entry / Exit",
      desc: "Track delegates moving in and out of the main halls.",
      path: `/u/${conferenceSlug}/hall-scan`,
      color: "bg-emerald-600",
      icon: "🚪"
    },
    {
      title: "Workshop Scanner",
      desc: "Manage access to specialized, capacity-limited sessions.",
      path: `/u/${conferenceSlug}/workshop`,
      color: "bg-purple-600",
      icon: "📝"
    },
    {
      title: "Certificate Scan",
      desc: "Validate completion and issue digital/physical certificates.",
      path: `/u/${conferenceSlug}/certificate`,
      color: "bg-amber-500",
      icon: "🎓"
    },
    {
      title: "Mono Scan",
      desc: "Universal scanning station for any ad-hoc needs during the event.",
      path: `/u/${conferenceSlug}/mono-scan`,
      color: "bg-gray-600",
      icon: "📱"
    },
    {
      title: "Registered List",
      desc: "View and manage the list of registered attendees.",
      path: `/u/${conferenceSlug}/RegisteredList`,
      color: "bg-teal-500",
      icon: "📋"
    },
    {
      title: "AdminDashboard",
      desc: "Return to the main operations overview and quick access hub.",
      path: `/u/${conferenceSlug}/admin-dashboard`,
      color: "bg-indigo-500",
      icon: "📊"
    },
    {
      title: "Add Delegate",
      desc: "Add, edit, or remove participant details and manage registrations.", 
      path: `/u/${conferenceSlug}/participant-management`,
      color: "bg-red-500",
      icon: "👥"
    }

  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Operations Hub</h1>
          <p className="text-slate-500 text-sm mt-1">
            Active Event Workspace: <span className="font-semibold text-blue-600 uppercase">{conferenceSlug}</span>
          </p>
        </div>
        <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          System Online & Ready
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operationalModules.map((mod) => (
          <div 
            key={mod.title} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl shadow-sm ${mod.color}`}>
                {mod.icon}
              </div>
              <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {mod.title}
              </h2>
            </div>
            
            <p className="text-slate-500 text-sm flex-grow mb-5">
              {mod.desc}
            </p>
            
            <button
              onClick={() => navigate(mod.path)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex justify-center items-center gap-2"
            >
              Open Module <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}