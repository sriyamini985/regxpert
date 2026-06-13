import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ef4444", "#3b82f6", "#f97316"];

const MealsPieChart = ({ data }) => {
  const breakfastVal = data?.breakfast || 0;
  const lunchVal = data?.lunch || 0;
  const dinnerVal = data?.dinner || 0;
  const totalMeals = breakfastVal + lunchVal + dinnerVal;

  const chartData = totalMeals > 0
    ? [
        { name: "Breakfast", value: breakfastVal, color: "#ef4444" },
        { name: "Lunch", value: lunchVal, color: "#3b82f6" },
        { name: "Dinner", value: dinnerVal, color: "#f97316" }
      ]
    : [
        { name: "No meals logged", value: 1, color: "#E5E7EB" }
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
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [totalMeals > 0 ? value : 0, name]} />
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