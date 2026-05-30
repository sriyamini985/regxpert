import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4F46E5", "#E5E7EB"];

const KitBagChart = ({ data }: any) => {
  const chartData = [
    { name: "Given", value: data.given || 80 },
    { name: "Pending", value: data.pending || 40 }
  ];

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col items-center">
      <h3 className="font-semibold mb-2 text-sm">Kit Bags</h3>

      <PieChart width={220} height={200}>
        <Pie data={chartData} dataKey="value" outerRadius={70}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </div>
  );
};

export default KitBagChart;