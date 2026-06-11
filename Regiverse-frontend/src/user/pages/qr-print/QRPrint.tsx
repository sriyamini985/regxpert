import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

const QRPrint = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("data");
  const participant = raw ? JSON.parse(decodeURIComponent(raw)) : null;
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (!participant || hasPrinted.current) return;
    hasPrinted.current = true;

    const firePrintPipeline = async () => {
      try {
        // Flag backend that badge printing occurred
        await fetch(`${import.meta.env.VITE_API_URL}/api/participants/${participant._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBadgePrinted: true, badgePrintedAt: new Date() })
        });
      } catch (err) {
        console.error("Failed to notify backend tracking engine of print event:", err);
      } finally {
        // Trigger print window presentation
        setTimeout(() => {
          window.print();
        }, 500);
      }
    };

    firePrintPipeline();
  }, [participant]);

  if (!participant) {
    return <div className="p-10">No participant found</div>;
  }

  return (
    <>
      <style>
        {`
          body { margin: 0; background: white; }
          @media print {
            @page { margin: 0; }
            body { margin: 0; }
          }
        `}
      </style>
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">
        <QRCode value={participant.regId || participant._id} size={250} />
        <h1 className="text-4xl font-bold mt-6">{participant.name}</h1>
        <p className="text-xl mt-2">{participant.regId || participant._id}</p>
      </div>
    </>
  );
};

export default QRPrint;