interface Props {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  totalDays?: number;
}

const DayTabs = ({ selectedDay, setSelectedDay, totalDays = 9 }: Props) => {
  const count = Math.max(1, totalDays || 9);
  const days = Array.from({ length: count }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => setSelectedDay(day)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            selectedDay === day
              ? "bg-blue-600 text-white shadow"
              : "bg-white border text-gray-500 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DayTabs;