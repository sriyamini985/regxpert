import React from "react";
import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  LayoutDashboard, 
  Camera, 
  Utensils, 
  Briefcase, 
  DoorOpen, 
  BookOpen, 
  QrCode, 
  Award, 
  Users, 
  Printer, 
  ClipboardList, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";

import { motion } from "framer-motion";

export default function UserLayout() {
  const { conferenceSlug } = useParams<{ conferenceSlug: string }>();
  const { logout, user } = useAuth();
  const location = useLocation();

  // Restructured IA menu sections
  const sections = [
    {
      title: "Dashboard",
      items: [
        { name: "Console Dashboard", path: `/u/${conferenceSlug}`, icon: LayoutDashboard }
      ]
    },
    {
      title: "Scan Center",
      items: [
        { name: "Scan Hub", path: `/u/${conferenceSlug}/scan-center`, icon: Camera },
        { name: "Food Scan", path: `/u/${conferenceSlug}/event-registration`, icon: Utensils },
        { name: "Kit Bag Scan", path: `/u/${conferenceSlug}/check-in`, icon: Briefcase },
        { name: "Hall Entry/Exit", path: `/u/${conferenceSlug}/hall-scan`, icon: DoorOpen },
        { name: "Workshop Scan", path: `/u/${conferenceSlug}/workshop`, icon: BookOpen },
        { name: "Mono Scan", path: `/u/${conferenceSlug}/mono-scan`, icon: QrCode },
        { name: "Certificate Scan", path: `/u/${conferenceSlug}/certificate`, icon: Award }
      ]
    },
    {
      title: "Participants",
      items: [
        { name: "Participant Lookup", path: `/u/${conferenceSlug}/participant-management`, icon: Users },
        { name: "Badge Print", path: `/u/${conferenceSlug}/badge-print`, icon: Printer },
        { name: "Registrations List", path: `/u/${conferenceSlug}/RegisteredList`, icon: ClipboardList }
      ]
    },
    {
      title: "Reports & Analytics",
      items: [
        { name: "Onsite-Dashboard", path: `/u/${conferenceSlug}/admin-dashboard`, icon: BarChart3 }
      ]
    },
    {
      title: "System Settings",
      items: [
        { name: "Terminal Settings", path: `/u/${conferenceSlug}/settings`, icon: SettingsIcon }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Restructured Operator Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between shadow-2xl border-r border-slate-900/60">
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-900 flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
              X
            </div>
            <div>
              <h1 className="font-black text-md leading-tight tracking-tight">RegXperts</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Staff Terminal</p>
            </div>
          </div>

          {/* Active Workspace Banner */}
          <div className="px-4 py-3 bg-slate-900/40 m-4 rounded-xl border border-slate-900">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Workspace</p>
            <p className="text-xs font-semibold text-blue-400 truncate mt-0.5" title={conferenceSlug}>
              {conferenceSlug}
            </p>
          </div>

          {/* Scrollable Navigation Sections */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-5 py-2 scrollbar-thin scrollbar-thumb-slate-800">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Category Header */}
                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  {section.title}
                </h3>

                {/* Section Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center">
          <div className="truncate">
            <p className="text-xs font-semibold truncate text-slate-300">{user?.email || "Operator Station"}</p>
            <p className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold mt-0.5 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-slate-50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}