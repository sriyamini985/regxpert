import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConferenceData } from "../../../hooks/useConferenceData";
import { 
  Briefcase, 
  Utensils, 
  DoorOpen, 
  BookOpen, 
  Award, 
  QrCode, 
  ClipboardList, 
  BarChart3, 
  Users, 
  Printer, 
  Activity,
  ArrowRight,
  ShieldCheck,
  Award as CertificateIcon
} from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { conferenceSlug } = useParams<"conferenceSlug">();

  // Fetch real-time stats from database using WebSocket synchronization hook
  const { loading, stats } = useConferenceData(conferenceSlug, { statsOnly: true });

  // Sum up all meal counts across all days from stats?.food
  const totalFoodScans = React.useMemo(() => {
    if (!stats?.food) return 0;
    let sum = 0;
    Object.values(stats.food).forEach((dayObj: any) => {
      if (dayObj && typeof dayObj === "object") {
        Object.values(dayObj).forEach((val: any) => {
          if (typeof val === "number") {
            sum += val;
          }
        });
      }
    });
    return sum;
  }, [stats?.food]);

  // Grouped operational modules for clearer division of labor
  const scannerModules = [
    {
      title: "Kit Bag Scan",
      desc: "Verify delegate registration credentials and distribute welcome kits.",
      path: `/u/${conferenceSlug}/check-in`,
      color: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/10",
      icon: Briefcase,
      badge: "Arrived Check-In"
    },
    {
      title: "Food Scan",
      desc: "Authenticate meal access and log meal count distributions in real-time.",
      path: `/u/${conferenceSlug}/event-registration`,
      icon: Utensils,
      color: "from-amber-500 to-orange-600",
      shadowColor: "shadow-orange-500/10",
      badge: "Food Counters"
    },
    {
      title: "Hall Entry/Exit",
      desc: "Log timestamps of delegates entering and exiting session halls.",
      path: `/u/${conferenceSlug}/hall-scan`,
      icon: DoorOpen,
      color: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/10",
      badge: "Session Attendance"
    },
    {
      title: "Workshop Scanner",
      desc: "Control access and verify seat allotments for specialized parallel classes.",
      path: `/u/${conferenceSlug}/workshop`,
      icon: BookOpen,
      color: "from-purple-500 to-violet-600",
      shadowColor: "shadow-purple-500/10",
      badge: "Workshop Sessions"
    },
    {
      title: "Certificate Scan",
      desc: "Verify course completion logs and issue attendee certification credentials.",
      path: `/u/${conferenceSlug}/certificate`,
      icon: Award,
      color: "from-cyan-500 to-blue-600",
      shadowColor: "shadow-cyan-500/10",
      badge: "Certificate Handout"
    },
    {
      title: "Mono Scan",
      desc: "General purpose entry points scanning for multi-station layouts.",
      path: `/u/${conferenceSlug}/mono-scan`,
      icon: QrCode,
      color: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/10",
      badge: "Ad-hoc Scanning"
    }
  ];

  const managementModules = [
    {
      title: "Badge Print Station",
      desc: "Select checkpoints, audit logs, and print standard portrait CR80 badges.",
      path: `/u/${conferenceSlug}/badge-print`,
      icon: Printer,
      color: "from-indigo-500 to-purple-600",
      shadowColor: "shadow-indigo-500/10",
      badge: "CR80 Badge Print"
    },
    {
      title: "Participant Lookup",
      desc: "Search database profiles, modify details, and register walk-in attendees.",
      path: `/u/${conferenceSlug}/participant-management`,
      icon: Users,
      color: "from-red-500 to-rose-600",
      shadowColor: "shadow-rose-500/10",
      badge: "Roster Management"
    },
    {
      title: "Registrations List",
      desc: "Browse dynamic attendee roster with live synchronization filters.",
      path: `/u/${conferenceSlug}/RegisteredList`,
      icon: ClipboardList,
      color: "from-teal-500 to-emerald-600",
      shadowColor: "shadow-teal-500/10",
      badge: " Roster List"
    }
  ];

  // Motion animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md inline-flex items-center gap-1.5 mb-2.5">
            <Activity className="w-3.5 h-3.5 animate-pulse text-blue-600" />
            <span>Real-time Workspace Active</span>
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Operations Hub</h1>
          <p className="text-slate-500 text-sm mt-1">
            Access scanning terminals and registration printing for: <span className="font-bold text-blue-600 uppercase">{conferenceSlug}</span>
          </p>
        </div>
        <div className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 self-start md:self-center">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Terminal Connected
        </div>
      </div>

      {/* Dynamic Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Registrations", val: stats?.total, color: "border-l-blue-500" },
          { label: "Checked In (Arrived)", val: stats?.checkedIn, color: "border-l-emerald-500" },
          { label: "Badges Printed", val: stats?.printed, color: "border-l-indigo-500" },
          { label: "Kits Distributed", val: stats?.kitbagCollected, color: "border-l-violet-500" },
          { label: "Food Scans", val: totalFoodScans, color: "border-l-amber-500" },
          { label: "Hall Attendance", val: stats?.hallEntriesCount, color: "border-l-teal-500" },
          { label: "Workshop Attendance", val: stats?.workshopScansCount, color: "border-l-purple-500" },
          { label: "Certificates Issued", val: stats?.certificateGiven, color: "border-l-cyan-500" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white border border-slate-200/80 border-l-[5px] ${stat.color} rounded-2xl p-5 shadow-sm hover:shadow transition-all duration-200`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" />
              ) : (
                (stat.val || 0).toLocaleString()
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Section 1: Scan Stations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Scan Terminals</span>
          <hr className="flex-1 border-slate-200" />
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {scannerModules.map((mod, index) => {
            const IconComponent = mod.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-350 group ${mod.shadowColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">{mod.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    {mod.desc}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(mod.path)}
                  className="w-full bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 border border-slate-100"
                >
                  <span>Open Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Section 2: Participant & Badge Management */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Registrations & Printing</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementModules.map((mod, index) => {
            const IconComponent = mod.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-350 group ${mod.shadowColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">{mod.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    {mod.desc}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(mod.path)}
                  className="w-full bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 border border-slate-100"
                >
                  <span>Launch Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Analytics Shortcut Section */}
      <div className="pt-4">
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Analytics & Insights</h3>
              <p className="text-slate-400 text-xs mt-0.5">Access global onsite charts, event metrics, and download the registration list spreadsheet.</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/u/${conferenceSlug}/admin-dashboard`)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 px-6 text-xs font-bold flex items-center gap-2 transition-all duration-150 self-stretch md:self-center justify-center shadow-lg shadow-blue-600/10 active:scale-98"
          >
            <span>Open Dashboard Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}