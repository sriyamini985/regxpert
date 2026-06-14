import React from "react";
import { Link, useParams } from "react-router-dom";
import { 
  Utensils, 
  Briefcase, 
  DoorOpen, 
  BookOpen, 
  QrCode, 
  Award, 
  ArrowRight,
  Camera
} from "lucide-react";
import { motion } from "framer-motion";

export default function ScanCenter() {
  const { conferenceSlug } = useParams<{ conferenceSlug: string }>();

  // Config for the 6 scan modules
  const modules = [
    {
      title: "Food Scan",
      description: "Scan and verify food coupons and event meals in real-time.",
      path: `/u/${conferenceSlug}/event-registration`,
      icon: Utensils,
      color: "from-amber-500 to-orange-600",
      shadowColor: "shadow-orange-500/10",
      badge: "Food Scan Counter"
    },
    {
      title: "Kit Bag Scan",
      description: "Distribute registration kits and welcome bags to verified delegates.",
      path: `/u/${conferenceSlug}/check-in`,
      icon: Briefcase,
      color: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/10",
      badge: "Kit Bag Scan Counter"
    },
    {
      title: "Hall Entry/Exit Scan",
      description: "Log session attendance, track capacity constraints, and track timestamps.",
      path: `/u/${conferenceSlug}/hall-scan`,
      icon: DoorOpen,
      color: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/10",
      badge: "Hall Scanning"
    },
    {
      title: "Workshop Scan",
      description: "Record attendance for specialized workshops and parallel sessions.",
      path: `/u/${conferenceSlug}/workshop`,
      icon: BookOpen,
      color: "from-purple-500 to-violet-600",
      shadowColor: "shadow-purple-500/10",
      badge: "Workshop Scanning"
    },
    {
      title: "Mono Scan",
      description: "Single point generalized entry and badge scanning.",
      path: `/u/${conferenceSlug}/mono-scan`,
      icon: QrCode,
      color: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/10",
      badge: "Mono Scanning"
    },
    {
      title: "Certificate Scan",
      description: "Scan attendee badges to verify eligibility and print/issue certificates.",
      path: `/u/${conferenceSlug}/certificate`,
      icon: Award,
      color: "from-cyan-500 to-blue-600",
      shadowColor: "shadow-cyan-500/10",
      badge: "Certificate Verification"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 font-sans">
      {/* Header Banner */}
      <div className="mb-10 bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Center Hub</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            On-Ground Operations Panel
          </h1>
          <p className="text-slate-400 mt-2 text-xs sm:text-sm md:text-base leading-relaxed">
            Select one of the dedicated terminal modules below to launch the camera-based QR scanner. Ensure your browser camera permissions are enabled for this terminal session.
          </p>
        </div>
      </div>

      {/* Grid of Launcher Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {modules.map((mod, index) => {
          const IconComponent = mod.icon;
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 ${mod.shadowColor}`}
            >
              <div>
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-lg`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/40">
                    {mod.badge}
                  </span>
                </div>

                {/* Body Content */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">{mod.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {mod.description}
                </p>
              </div>

              {/* Launcher CTA Button */}
              <Link
                to={mod.path}
                className="w-full bg-slate-950 hover:bg-blue-600 text-white rounded-xl py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 group"
              >
                <span>Launch Scanner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
