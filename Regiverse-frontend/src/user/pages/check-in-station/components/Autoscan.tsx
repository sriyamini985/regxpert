import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type Props = {
  onScan: (code: string) => void;
  isProcessing?: boolean;
};

const AutoScan = ({ onScan, isProcessing }: Props) => {
  const scannerRef = useRef<any>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          if (!isProcessing) {
            onScan(decodedText);
            stopScanner();
            setActive(false);
          }
        },
        (error: any) => console.log(error)
      );
    }

    return () => stopScanner();
  }, [active, isProcessing]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Auto Scan</h2>

      {!active ? (
        <button
          onClick={() => setActive(true)}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Start Camera
        </button>
      ) : (
        <>
          <div id="reader" className="w-full" />

          <button
            onClick={() => {
              stopScanner();
              setActive(false);
            }}
            className="w-full mt-3 bg-gray-300 py-2 rounded"
          >
            Stop
          </button>
        </>
      )}
    </div>
  );
};

export default AutoScan;