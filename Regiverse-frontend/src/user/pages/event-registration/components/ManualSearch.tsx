import React, { useState } from "react";

// 1. Strongly typed data interface
interface Participant {
  id: string;
  name: string;
  company: string;
  checked: boolean;
}

// 2. Single source of mock data array
const mockData: Participant[] = [
  { id: "1", name: "John Doe", company: "Google", checked: false },
  { id: "2", name: "Jane Smith", company: "Microsoft", checked: false },
  { id: "3", name: "Arun Kumar", company: "Amazon", checked: false },
];

// 3. Single default component export
export default function ManualSearch() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Participant[]>(mockData);

  const handleCheckIn = (id: string) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, checked: true } : p
      )
    );
  };

  const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Manual Search</h2>

      <input
        type="text"
        placeholder="Search by name..."
        className="w-full border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center border border-slate-100 p-3.5 rounded-lg bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.company}</p>
              </div>

              <button
                onClick={() => handleCheckIn(p.id)}
                disabled={p.checked}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                  p.checked
                    ? "bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {p.checked ? "✓ Checked-in" : "Check-in"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-slate-400 py-6">
            No dynamic match found for "{query}"
          </p>
        )}
      </div>
    </div>
  );
}