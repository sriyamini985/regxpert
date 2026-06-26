import { useState } from "react";
import { useSearchParams } from "react-router-dom";


const mockData = [
  { id: "1", name: "John Doe", company: "Google", checked: false },
  { id: "2", name: "Jane Smith", company: "Microsoft", checked: false },
  { id: "3", name: "Arun Kumar", company: "Amazon", checked: false },
];

const ManualSearch = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(mockData);

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
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="font-semibold">Manual Search</h2>

      <input
        placeholder="Search by name..."
        className="w-full border px-3 py-2 rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.company}</p>
            </div>

            <button
              onClick={() => handleCheckIn(p.id)}
              className={`px-3 py-1 rounded ${
                p.checked
                  ? "bg-green-500 text-white"
                  : "bg-indigo-500 text-white"
              }`}
            >
              {p.checked ? "Checked-in" : "Check-in"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualSearch;