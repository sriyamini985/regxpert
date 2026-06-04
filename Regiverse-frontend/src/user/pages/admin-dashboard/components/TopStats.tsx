import { Users, BadgeCheck, Award, Package } from "lucide-react";

const TopStats = () => {
  const stats = [
    {
      title: "Total Delegates",
      value: 118,
      icon: <Users size={20} />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Badges Printed",
      value: 1,
      icon: <BadgeCheck size={20} />,
      bg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Certificates Issued",
      value: 0,
      icon: <Award size={20} />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Kit Bags Delivered",
      value: 0,
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
          <div className="bg-red-500 text-white p-4">
  Tailwind Test
</div>

          {/* TEXT */}
          <div>
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-2xl font-bold mt-1 text-gray-900">
              {item.value}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;