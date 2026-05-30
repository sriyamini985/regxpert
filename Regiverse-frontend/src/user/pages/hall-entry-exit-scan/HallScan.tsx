import React, { useState } from 'react';
import ModeSelector from '../hall-entry-exit-scan/components/ModeSelector';
import AutoScan from '../hall-entry-exit-scan/components/AutoScan';
import ManualScan from '../hall-entry-exit-scan/components/ManualScan';

export interface Participant {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'entered' | 'exited' | 'pending';
}

const mockData: Participant[] = [
  {
    id: 'REG123',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Google',
    status: 'pending',
  },
];

const HallScan = () => {
  const [mode, setMode] = useState<'entry' | 'exit' | null>(null);
  const [participants, setParticipants] = useState(mockData);

  const handleScan = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: mode === 'entry' ? 'entered' : 'exited' }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-16 pt-24">
      <div className="max-w-xl mx-auto space-y-6">

        <h1 className="text-lg font-semibold text-center">
          Hall Entry & Exit Scan
        </h1>

        {/* STEP 1 */}
        {!mode && <ModeSelector setMode={setMode} />}

        {/* STEP 2 */}
        {mode && (
          <>
            <div className="text-center text-sm text-gray-500">
              Mode: <span className="font-semibold">{mode.toUpperCase()}</span>
            </div>

            <AutoScan participants={participants} onScan={handleScan} />
            <ManualScan participants={participants} onCheckIn={handleScan} />
          </>
        )}
      </div>
    </div>
  );
};

export default HallScan;