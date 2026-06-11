import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#06B6D4", "#F59E0B"];

const HallScanChart = ({ data }: any) => {
  const chartData = [
    { name: "Entries", value: data?.entry || data?.entries || 0 },
    { name: "Exits", value: data?.exit || data?.exits || 0 }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col items-center justify-between">
      <h3 className="font-semibold text-sm text-gray-700">Hall Flow (Entry vs Exit)</h3>
      <div className="w-full flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={2}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HallScanChart;