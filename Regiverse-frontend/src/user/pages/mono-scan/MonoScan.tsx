import React, { useState } from 'react';
import AutoScan from './components/AutoScan';
import ManualScan from './components/ManualScan';

export interface Participant {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'attended' | 'pending' | 'absent';
}

const mockParticipants: Participant[] = [
  { id: 'REG12345', name: 'John Doe', email: 'john@example.com', company: 'Google', status: 'pending' },
  { id: 'REG67890', name: 'Jane Smith', email: 'jane@example.com', company: 'Microsoft', status: 'pending' },
];

const MonoScan = () => {
  const [participants, setParticipants] = useState(mockParticipants);

  const handleCheckIn = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: 'attended' } : p)
    );
  };

  return (
   <div className="min-h-screen bg-gray-50 flex justify-center px-3 pt-24">
      <div className="w-full px-4 max-w-5xl space-y-6">
        <h1 className="text-2xl font-semibold text-center">Mono Scan</h1>
        <AutoScan participants={participants} onCheckIn={handleCheckIn} />
        <ManualScan participants={participants} onCheckIn={handleCheckIn} />
      </div>
    </div>
  );
};

export default MonoScan;