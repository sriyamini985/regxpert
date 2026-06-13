import { Users, BadgeCheck, Award, Package } from "lucide-react";

interface TopStatsProps {
  total: number;
  checkedIn: number;
  printed: number;
  certificateGiven: number;
  kitbagCollected: number;
}

const TopStats = ({
  total = 0,
  checkedIn = 0,
  printed = 0,
  certificateGiven = 0,
  kitbagCollected = 0,
}: TopStatsProps) => {
  const stats = [
    {
      title: "Total Delegates",
      value: total,
      icon: <Users size={20} />,
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Checked In / Badges",
      value: checkedIn,
      icon: <BadgeCheck size={20} />,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      title: "Certificates Issued",
      value: certificateGiven,
      icon: <Award size={20} />,
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      iconColor: "text-amber-600"
    },
    {
      title: "Kit Bags Delivered",
      value: kitbagCollected,
      icon: <Package size={20} />,
      bg: "bg-rose-50 text-rose-600 border-rose-100",
      iconColor: "text-rose-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
        >
          {/* ICON */}
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-2xl border ${item.bg}`}
          >
            <span>{item.icon}</span>
          </div>

          {/* TEXT */}
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{item.title}</p>
            <h2 className="text-3xl font-black mt-1 text-slate-800 tracking-tight">
              {item.value.toLocaleString()}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;