import { useEffect, useState } from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import LoadingBar from "../../components/ui/LoadingBar";
import AutoScan from "./components/Autoscan";
import ManualScan from "./components/ManualScan";

import { Participant } from "./types/types";

import {
  processQRCheckIn,
  processManualCheckIn,
} from "../../services/checkInService";

const days = [1, 2, 3, 4, 5];

const CheckInStation = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const params = new URLSearchParams(
    location.search
  );

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isLoading] = useState(false);

  const [selectedDay, setSelectedDay] =
    useState<number | null>(
      params.get("day")
        ? Number(params.get("day"))
        : null
    );

  const playBeep = () => {
    new Audio(
      "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
    ).play();
  };

  /* =========================
     URL SYNC
  ========================= */
  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    const day = params.get("day");

    setSelectedDay(
      day ? Number(day) : null
    );
  }, [location.search]);

  /* =========================
     AUTO QR SCAN
  ========================= */
  const handleScan = async (
    qr: string
  ) => {
    if (!selectedDay) return;

    setIsProcessing(true);

    const res =
      await processQRCheckIn(qr);

    if (res.success && res.participant) {
      playBeep();

      setParticipants((prev) =>
        prev.map((p) =>
          p.id ===
          res.participant!.id
            ? {
                ...p,
                status:
                  `kitbag-day-${selectedDay}` as Participant["status"],
              }
            : p
        )
      );
    }

    setIsProcessing(false);
  };

  /* =========================
     MANUAL SCAN
  ========================= */
  const handleCheckIn = async (
    id: string
  ) => {
    if (!selectedDay) return;

    setIsProcessing(true);

    const p = participants.find(
      (x) => x.id === id
    );

    await processManualCheckIn(
      id,
      p?.name || "",
      `kitbag-day-${selectedDay}`
    );

    setParticipants((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status:
                `kitbag-day-${selectedDay}` as Participant["status"],
            }
          : x
      )
    );

    setIsProcessing(false);
  };

  /* =========================
     MOCK DATA
  ========================= */
  useEffect(() => {
    setParticipants([
      {
        id: "REG12345",
        name: "John Doe",
        email: "john@example.com",
        company: "Google",
        status: "pending",
      },

      {
        id: "REG67890",
        name: "Jane Smith",
        email: "jane@example.com",
        company: "Amazon",
        status: "pending",
      },
    ]);
  }, []);

  return (
    <div className="page-bg">
      <LoadingBar
        isLoading={isLoading}
      />

      <main className="pt-24 px-4 max-w-6xl mx-auto">

        {/* TITLE */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">
            KitBag Scan
          </h1>

          <p className="text-gray-500 mt-2">
            Select KitBag Day
          </p>
        </div>

        {/* DAY BUTTONS */}
        {!selectedDay && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

            {days.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);

                  navigate(
                    `/kitbag-scan?day=${day}`
                  );
                }}
                className="bg-white shadow-lg rounded-3xl p-10 hover:scale-105 transition-all border"
              >
                <h2 className="text-2xl font-bold text-blue-600">
                  Day {day}
                </h2>

                <p className="text-gray-500 mt-2">
                  Open Scan
                </p>
              </button>
            ))}

          </div>
        )}

        {/* SCAN SECTION */}
        {selectedDay && (
          <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow p-5">

              <div>
                <h2 className="text-2xl font-bold">
                  Day {selectedDay} KitBag
                  Scan
                </h2>

                <p className="text-gray-500 text-sm">
                  Auto & Manual Scan
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedDay(null);

                  navigate(
                    "/kitbag-scan"
                  );
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-xl"
              >
                Back
              </button>
            </div>

            {/* AUTO SCAN */}
            <AutoScan
              onScan={handleScan}
              isProcessing={
                isProcessing
              }
            />

            {/* MANUAL SCAN */}
            <ManualScan
              participants={
                participants
              }
              onCheckIn={
                handleCheckIn
              }
            />

          </div>
        )}

      </main>
    </div>
  );
};

export default CheckInStation;