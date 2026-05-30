import { useState } from "react";
import { Participant } from "../types/types";
import ResultsTable from "./ResultsTable";

interface Props {
  participants: Participant[];
  onCheckIn: (id: string) => void;
}

const ManualScan = ({ participants, onCheckIn }: Props) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Participant[]>([]);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const q = value.toLowerCase();

    const filtered = participants.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );

    setResults(filtered);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <h2 className="font-semibold mb-3">Manual Search</h2>

      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
        className="w-full border p-2 rounded mb-4"
      />

      <ResultsTable data={results} onCheckIn={onCheckIn} />
    </div>
  );
};

export default ManualScan;