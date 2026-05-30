import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6"];

const CertificatesChart = ({ data }) => {
  const chartData = [
    { name: "Issued", value: data.issued },
    { name: "Pending", value: data.pending }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2">Certificates</h3>

      <div className="w-full h-[170px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={40}
              outerRadius={70}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-3 text-xs mt-2">
        <span className="text-yellow-500">● Issued</span>
        <span className="text-blue-500">● Pending</span>
      </div>
    </div>
  );
};

export default CertificatesChart;