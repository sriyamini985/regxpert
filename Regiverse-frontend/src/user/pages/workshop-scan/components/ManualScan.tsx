import React, { useState, useMemo } from 'react';
import ResultsTable from './ResultsTable';
import { Participant } from '../WorkshopScan';

interface Props {
  participants: Participant[];
  onCheckIn: (id: string) => void;
}

const ManualScan: React.FC<Props> = ({ participants, onCheckIn }) => {
  const [search, setSearch] = useState('');

  // 🔍 LIVE FILTER → DIRECT TABLE
  const filtered = useMemo(() => {
    if (!search.trim()) return [];

    const q = search.toLowerCase();

    return participants.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }, [search, participants]);

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <h2 className="font-semibold mb-2 text-sm">Manual Search</h2>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Search name, email, ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded text-sm"
      />

      {/* NO RESULTS */}
      {search && filtered.length === 0 && (
        <p className="text-xs text-gray-500 mt-2">No results found</p>
      )}

      {/* ✅ DIRECT TABLE */}
      {filtered.length > 0 && (
        <div className="mt-3">
          <ResultsTable data={filtered} onCheckIn={onCheckIn} />
        </div>
      )}
    </div>
  );
};

export default ManualScan;


