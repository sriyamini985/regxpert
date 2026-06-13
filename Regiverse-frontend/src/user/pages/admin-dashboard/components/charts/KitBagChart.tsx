import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4F46E5", "#E5E7EB"];

// 1. Explicitly type the component props contract
interface KitBagChartProps {
  data: {
    given: number;
    pending: number;
  };
}

const KitBagChart = ({ data }: KitBagChartProps) => {
  const chartData = [
    { name: "Given", value: data.given },
    { name: "Pending", value: data.pending }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col items-center">
      <h3 className="font-semibold mb-2 text-sm">Kit Bags</h3>

      {/* 2. Made responsive to perfectly match the alignment profile of your other charts */}
      <div className="w-full h-[170px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              dataKey="value" 
              innerRadius={40} // Optional: makes it a donut ring style matching your Certificates/Meals charts
              outerRadius={70}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KitBagChart;