import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Participant } from '../WorkshopScan';

interface Props {
  participants: Participant[];
  onCheckIn: (id: string) => void;
}

const AutoScan: React.FC<Props> = ({ participants, onCheckIn }) => {
  const [started, setStarted] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanner = () => {
    if (scannerRef.current) return;

    setStarted(true);

    // ✅ clear old DOM (important fix)
    const readerEl = document.getElementById('reader');
    if (readerEl) readerEl.innerHTML = '';

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        const found = participants.find((p) => p.id === decodedText);

        if (found) {
          onCheckIn(found.id);
        }

        scanner.clear();
        scannerRef.current = null;
        setStarted(false); // ✅ reset UI
      },
      (err) => console.log(err)
    );
  };

  // ✅ cleanup when leaving page
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <h2 className="font-semibold mb-3">Auto Scan</h2>

      <button
        onClick={startScanner}
        className="w-full bg-blue-500 text-white py-2 rounded mb-3"
      >
        Start Camera
      </button>

      {started && <div id="reader" />}
    </div>
  );
};

export default AutoScan;