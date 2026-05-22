import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6"];

interface BadgesBarChartProps {
  data: {
    printed: number;
    issued: number;
  };
}

const BadgesBarChart = ({ data }: BadgesBarChartProps) => {
  const chartData = [
    { name: "Printed", value: data.printed },
    { name: "Issued", value: data.issued }
  ];
  

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col">
      <h3 className="text-sm font-semibold mb-2 text-center">Badges</h3>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BadgesBarChart;