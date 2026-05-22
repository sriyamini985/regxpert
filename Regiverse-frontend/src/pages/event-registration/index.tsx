import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FoodScan: React.FC = () => {
  const navigate = useNavigate();
  const [openDay, setOpenDay] = useState<number | null>(null);

  const days = Array.from({ length: 5 }, (_, i) => i + 1);
  const meals = ['Breakfast', 'Lunch', 'Dinner'];

  const toggleDay = (day: number) => {
    setOpenDay(openDay === day ? null : day);
  };

  const handleMealClick = (day: number, meal: string) => {
    navigate(`/food-scan/scan?day=${day}&meal=${meal}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Food Scan</h1>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {days.map((day) => (
          <div key={day} className="bg-white shadow-lg rounded-3xl p-10 hover:scale-105 transition-all border">

            {/* DAY BUTTON */}
            <button
              onClick={() => toggleDay(day)}
              className="text-2xl font-bold text-blue-600 text-center w-full"
            >
              Day {day}
            </button>

            {/* DROPDOWN */}
            {openDay === day && (
              <div className="flex flex-col">
                {meals.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => handleMealClick(day, meal)}
                    className="px-3 py-2 text-sm hover:bg-gray-100 border-t"
                  >
                    {meal}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodScan;