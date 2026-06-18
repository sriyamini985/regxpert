import React, { useState } from "react";
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
  LogOut,
  Menu,
  X
} from "lucide-react";

import { motion } from "framer-motion";

export default function UserLayout() {
  const { conferenceSlug } = useParams<{ conferenceSlug: string }>();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans relative">
      
      {/* Backdrop overlay on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col justify-between shadow-2xl border-r border-slate-900/60 transform lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col flex-grow min-h-0">
          
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/regiverse-logo-new.png"
                alt="RegXperts"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="font-black text-md leading-tight tracking-tight">RegXperts</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Staff Terminal</p>
              </div>
            </div>
            {/* Close button inside sidebar on mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
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
                        onClick={() => setIsOpen(false)} // Close sidebar on mobile item selection
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
      <main className="flex-grow flex flex-col overflow-hidden min-w-0">
        {/* Top Header Toggle Bar for Mobile viewports */}
        <header className="lg:hidden bg-slate-950 text-white flex items-center justify-between p-4 border-b border-slate-900 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-extrabold text-sm tracking-tight text-white">RegXperts Terminal</span>
          </div>
          <div className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
            {conferenceSlug}
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
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