import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. UPDATE THIS INTERFACE TO EXPECT notPrinted 👇
interface BadgesBarChartProps {
  data: {
    printed: number;
    notPrinted: number; 
  };
}

const BadgesBarChart = ({ data }: BadgesBarChartProps) => {
  // 2. MAP THE VALUE TO data?.notPrinted 👇
  const chartData = [
    { name: "Printed", value: data?.printed || 0, color: "#3b82f6" },     // Blue
    { name: "Not Printed", value: data?.notPrinted || 0, color: "#94a3b8" } // Slate Gray
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-gray-700 text-center">Badges</h3>
      <div className="flex-1 min-h-[160px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BadgesBarChart;