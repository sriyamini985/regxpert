import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layout/UserLayout";

// Lazy loaded user-specific pages
const UserDashboard = lazy(() => import("./pages/dashboard/index"));
const CheckInStation = lazy(() => import("./pages/check-in-station/index"));
const FoodCounter = lazy(() => import("../pages/food-counter/index"));
const HallScan = lazy(() => import("../pages/hall-entry-exit-scan/HallScan"));
const WorkshopScan = lazy(() => import("../pages/workshop-scan/WorkshopScan"));
const MonoScan = lazy(() => import("../pages/mono-scan/MonoScan"));
const CertificateScan = lazy(() => import("../pages/certificate-scan/CertificateScan"));
const RegisteredList = lazy(() => import("./pages/RegisteredList"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));
const ParticipantManagement = lazy(() => import("./pages/participant-management"));
const BadgePrint = lazy(() => import("./pages/badge-print"));
const ScanCenter = lazy(() => import("./pages/scan-center/ScanCenter"));
const Settings = lazy(() => import("./pages/settings/Settings"));

export default function UserRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-blue-500 animate-pulse text-xs">Loading station...</div>}>
      <Routes>
        {/* All routes are wrapped inside the shared User Layout context */}
        <Route path="/:conferenceSlug" element={<UserLayout />}>
          
          {/* Base Dashboard for the staff user */}
          <Route index element={<UserDashboard />} />
          
          {/* Module Stations */}
          <Route path="scan-center" element={<ScanCenter />} />
          <Route path="check-in" element={<CheckInStation />} />
          <Route path="event-registration" element={<FoodCounter />} />
          <Route path="hall-scan" element={<HallScan />} />
          <Route path="workshop" element={<WorkshopScan />} />
          <Route path="mono-scan" element={<MonoScan />} />
          <Route path="certificate" element={<CertificateScan />} />
          <Route path="RegisteredList" element={<RegisteredList />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="participant-management" element={<ParticipantManagement />} />
          <Route path="badge-print" element={<BadgePrint />} />
          <Route path="settings" element={<Settings />} />

          {/* Fallback internal redirection */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}