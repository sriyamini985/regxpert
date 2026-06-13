interface Props {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
}

const DayTabs = ({ selectedDay, setSelectedDay }: Props) => {
  const days = Array.from({ length: 5 }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1.5 w-fit border border-slate-200/30 shadow-sm overflow-x-auto pb-1.5 sm:pb-1.5 scrollbar-hide">
      {days.map((day) => {
        const isActive = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-white text-blue-600 shadow-md shadow-slate-300/40 scale-105 border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};

export default DayTabs;