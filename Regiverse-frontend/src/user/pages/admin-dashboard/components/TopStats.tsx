import { Users, BadgeCheck, Award, Package, Fingerprint } from "lucide-react";

interface TopStatsProps {
  total?: number;
  checkedIn?: number;
  kitbagCollected?: number;
  certificateGiven?: number;
  printed?: number;
}

const TopStats = ({
  total = 0,
  checkedIn = 0,
  kitbagCollected = 0,
  certificateGiven = 0,
  printed = 0,
}: TopStatsProps) => {

  const stats = [
    {
      title: "Total Delegates",
      value: total,
      icon: <Users size={22} />,
      bg: "bg-blue-50 border border-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Checked In",
      value: checkedIn,
      icon: <Fingerprint size={22} />,
      bg: "bg-indigo-50 border border-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Badges Printed",
      value: printed,
      icon: <BadgeCheck size={22} />,
      bg: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Certificates Issued",
      value: certificateGiven,
      icon: <Award size={22} />,
      bg: "bg-amber-50 border border-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Kit Bags Delivered",
      value: kitbagCollected,
      icon: <Package size={22} />,
      bg: "bg-rose-50 border border-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:-translate-y-1.5 hover:shadow-md hover:border-slate-300 transition-all duration-300 group cursor-default"
        >
          {/* ICON */}
          <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${item.bg}`}>
            <span className={item.iconColor}>{item.icon}</span>
          </div>

          {/* TEXT */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{item.title}</p>
            <h2 className="text-3xl font-black mt-0.5 text-slate-800 tabular-nums">
              {item.value.toLocaleString()}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;