import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Participant } from '../../Hall Entry & Exit Scan/HallScan';

interface Props {
  participants: Participant[];
  onCheckIn: (id: string) => void;
}

const AutoScan: React.FC<Props> = ({ participants, onCheckIn }) => {
  const [started, setStarted] = useState(false);

  const startScanner = () => {
    setStarted(true);

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        const found = participants.find((p) => p.id === decodedText);

        if (found) {
          onCheckIn(found.id);
        }

        scanner.clear();
      },
      (err) => console.log(err)
    );
  };

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