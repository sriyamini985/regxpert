import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#10B981", "#E5E7EB"];

const MonoScanChart = ({ data }: any) => {
  const scannedCount = data?.scanned || data?.active || 0;
  const pendingCount = data?.pending || (data?.total ? Math.max(0, data.total - scannedCount) : 0);

  const chartData = [
    { name: "Scanned", value: scannedCount },
    { name: "Pending", value: pendingCount }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col items-center justify-between">
      <h3 className="font-semibold text-sm text-gray-700">Mono Scans</h3>
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

export default MonoScanChart;