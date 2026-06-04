import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import CheckInStation from "./pages/check-in-station";
import FoodCounter from "./pages/food-counter";
import HallScan from "./pages/hall-entry-exit-scan";
import MonoScan from "./pages/mono-scan";
import QRPrint from "./pages/qr-print";
import CertificateScan from "./pages/certificate-scan";
import WorkshopScan from "./pages/workshop-scan";

export default function UserRoutes() {
  return (
    <Routes>

      <Route
        index
        element={<Navigate to="checkin" replace />}
      />

      <Route element={<UserLayout />}>

        <Route
          path="checkin"
          element={<CheckInStation />}
        />

        <Route
          path="food-scan"
          element={<FoodCounter />}
        />

        <Route
          path="hall-scan"
          element={<HallScan />}
        />

        <Route
          path="mono-scan"
          element={<MonoScan />}
        />

        <Route
          path="qr-print"
          element={<QRPrint />}
        />

        <Route
          path="certificate-scan"
          element={<CertificateScan />}
        />

        <Route
          path="workshop-scan"
          element={<WorkshopScan />}
        />

      </Route>

    </Routes>
  );
}