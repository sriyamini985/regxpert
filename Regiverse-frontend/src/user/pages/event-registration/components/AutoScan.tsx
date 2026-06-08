import { useState } from "react";

const AutoScan = () => {
  const [scanned, setScanned] = useState(false);

  const handleFakeScan = () => {
    setScanned(true);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Auto Scan (QR)</h2>

      {!scanned ? (
        <button
          onClick={handleFakeScan}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Start Scan
        </button>
      ) : (
        <div className="text-green-600 font-medium">
          ✅ Checked-in: John Doe
        </div>
      )}
    </div>
  );
};

export default AutoScan;
