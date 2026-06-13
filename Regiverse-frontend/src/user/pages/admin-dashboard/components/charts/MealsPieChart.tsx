import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ef4444", "#3b82f6", "#f97316"];

interface MealsPieChartProps {
  data: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

const MealsPieChart = ({ data }: MealsPieChartProps) => {
  const chartData = [
    { name: "Breakfast", value: data.breakfast },
    { name: "Lunch", value: data.lunch },
    { name: "Dinner", value: data.dinner }
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm h-[260px] flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2">Meals</h3>

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
        <span className="text-red-500">● Breakfast</span>
        <span className="text-blue-500">● Lunch</span>
        <span className="text-orange-500">● Dinner</span>
      </div>
    </div>
  );
};

export default MealsPieChart;