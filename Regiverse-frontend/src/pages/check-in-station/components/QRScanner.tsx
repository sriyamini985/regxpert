import { useState } from 'react';

type Props = {
  onScan: (code: string) => void;
  isProcessing?: boolean;
};

const QRScanner = ({ onScan, isProcessing }: Props) => {
  const [scanning, setScanning] = useState(false);

  const handleFakeScan = () => {
    const fakeCode = 'REG12345'; // simulate scan
    onScan(fakeCode);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Auto Scan</h2>

      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Start Scanner
        </button>
      ) : (
        <>
          <div className="h-60 bg-gray-200 flex items-center justify-center rounded mb-3">
            Camera Preview
          </div>

          <button
            onClick={handleFakeScan}
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            Simulate Scan
          </button>

          <button
            onClick={() => setScanning(false)}
            className="w-full mt-2 bg-gray-300 py-2 rounded"
          >
            Stop
          </button>
        </>
      )}
    </div>
  );
};

export default QRScanner;