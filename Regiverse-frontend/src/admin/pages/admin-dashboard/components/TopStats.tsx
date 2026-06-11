import { Users, BadgeCheck, Award, Package } from "lucide-react";

interface TopStatsProps {
  data: {
    badges?: { printed: number; issued: number };
    meals?: { breakfast: number; lunch: number; dinner: number };
    kitbags?: { given: number; pending: number };
    certificates?: { issued: number; pending: number };
    monoScan?: { active: number; total: number };
    workshopScan?: { active: number; total: number };
    hallScan?: { entry: number; exit: number };
  };
}

const TopStats = ({ data }: TopStatsProps) => {
  // Dynamically calculate total delegates from the overall registration pool size
  const totalDelegates = data?.monoScan?.total || (data?.kitbags ? data.kitbags.given + data.kitbags.pending : 0);

  const stats = [
    {
      title: "Total Delegates",
      value: totalDelegates,
      icon: <Users size={20} />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Badges Printed",
      value: data?.badges?.printed || 0,
      icon: <BadgeCheck size={20} />,
      bg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Certificates Issued",
      value: data?.certificates?.issued || 0,
      icon: <Award size={20} />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Kit Bags Delivered",
      value: data?.kitbags?.given || 0,
      icon: <Package size={20} />,
      bg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition"
        >
          {/* ICON */}
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl ${item.bg}`}
          >
            <span className={item.iconColor}>{item.icon}</span>
          </div>

          {/* TEXT */}
          <div>
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-2xl font-bold mt-1 text-gray-900">
              {item.value.toLocaleString()}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;