const HighlightCards = ({ meals, total, selectedDay }: any) => {
  const cards = [
    { title: "Breakfast", value: meals.breakfast, color: "from-red-400 to-red-500" },
    { title: "Lunch", value: meals.lunch, color: "from-indigo-500 to-blue-600" },
    { title: "Dinner", value: meals.dinner, color: "from-orange-400 to-orange-500" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const remaining = total - card.value;

        return (
          <div
            key={i}
            className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${card.color}`}
          >
            <p className="text-sm opacity-90">
              {selectedDay} {card.title}
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {card.value}
            </h2>

            <p className="text-sm mt-2 opacity-90">
              members eaten
            </p>

            <p className="text-xs opacity-80 mt-1">
              out of {total} delegates
            </p>

            <div className="mt-5 bg-white/20 p-3 rounded-xl flex justify-between text-sm">
              <span>{card.value} Attended</span>
              <span>{remaining} Remaining</span>
              <span>{total} Total</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HighlightCards;