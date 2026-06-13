import { Coffee, Utensils, Moon } from "lucide-react";

interface HighlightCardsProps {
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  total: number;
  selectedDay: string;
}

const HighlightCards = ({ meals, total, selectedDay }: HighlightCardsProps) => {
  const cards = [
    { 
      title: "Breakfast", 
      value: meals.breakfast, 
      color: "from-rose-500 to-pink-600 shadow-rose-200", 
      icon: <Coffee size={24} /> 
    },
    { 
      title: "Lunch", 
      value: meals.lunch, 
      color: "from-blue-500 to-indigo-600 shadow-blue-200", 
      icon: <Utensils size={24} /> 
    },
    { 
      title: "Dinner", 
      value: meals.dinner, 
      color: "from-amber-500 to-orange-600 shadow-amber-200", 
      icon: <Moon size={24} /> 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const remaining = Math.max(0, total - card.value);

        return (
          <div
            key={i}
            className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${card.color} hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
          >
            {/* Background Decorative Circle */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />

            <div>
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider font-bold text-white/80">
                  {selectedDay} · {card.title}
                </span>
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                  {card.icon}
                </div>
              </div>

              {/* Main Stat */}
              <div className="mt-4">
                <h2 className="text-5xl font-black tracking-tight tabular-nums">
                  {card.value.toLocaleString()}
                </h2>
                <p className="text-sm font-semibold mt-1.5 text-white/90">
                  members claimed meals
                </p>
                <p className="text-xs text-white/75 mt-0.5">
                  out of {total.toLocaleString()} total delegates
                </p>
              </div>
            </div>

            {/* Bottom 3-Column Glass Grid (Resolves text overlapping bug) */}
            <div className="mt-6 bg-white/15 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="block text-base font-extrabold tabular-nums">{card.value}</span>
                <span className="block text-[9px] uppercase tracking-wider text-white/80 font-bold mt-0.5">Eaten</span>
              </div>
              <div className="border-x border-white/10">
                <span className="block text-base font-extrabold tabular-nums">{remaining}</span>
                <span className="block text-[9px] uppercase tracking-wider text-white/80 font-bold mt-0.5">Pending</span>
              </div>
              <div>
                <span className="block text-base font-extrabold tabular-nums">{total}</span>
                <span className="block text-[9px] uppercase tracking-wider text-white/80 font-bold mt-0.5">Total</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HighlightCards;