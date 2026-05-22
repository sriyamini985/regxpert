import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  onScan: (value: string) => void;
}

const Scanner: React.FC<Props> = ({ onScan }) => {

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    },
  false
);

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      () => {}
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <button
        onClick={startScanner}
        className="w-full bg-green-600 text-white py-3 rounded"
      >
        Scan QR
      </button>

      <div id="reader" className="mt-4" />
    </div>
  );
};

export default Scanner;