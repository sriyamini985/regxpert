import React from 'react';

const ModeSelector = ({ setMode }: any) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      
      <button
        onClick={() => setMode('entry')}
        className="w-full py-3 bg-blue-500 text-white rounded"
      >
        Hall Entry Scan
      </button>

      <button
        onClick={() => setMode('exit')}
        className="w-full py-3 bg-blue-500 text-white rounded"
      >
        Hall Exit Scan
      </button>

    </div>
  );
};

export default ModeSelector;