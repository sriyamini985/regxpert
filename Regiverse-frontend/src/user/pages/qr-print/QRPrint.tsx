import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";

const QRPrint = () => {
  const [searchParams] =
    useSearchParams();

  const raw =
    searchParams.get("data");

  const participant = raw
    ? JSON.parse(
        decodeURIComponent(raw)
      )
    : null;

  useEffect(() => {
    if (!participant) return;

    const timer = setTimeout(() => {
      window.print();
    }, 200);

    return () => clearTimeout(timer);

  }, [participant]);

  if (!participant) {
    return (
      <div className="p-10">
        No participant found
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            background: white;
          }

          @media print {
            @page {
              margin: 0;
            }
          }
        `}
      </style>

      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white">

        <QRCode
          value={
            participant.regId ||
            participant._id
          }
          size={250}
        />

        <h1 className="text-4xl font-bold mt-6">
          {participant.name}
        </h1>

        <p className="text-xl mt-2">
          {participant.regId ||
            participant._id}
        </p>

      </div>
    </>
  );
};

export default QRPrint;