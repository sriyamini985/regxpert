import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layout/UserLayout";

// User-specific pages
import UserDashboard from "./pages/dashboard/index";
import CheckInStation from "./pages/check-in-station/index";   // ✅ Fixed: uses user version with real DB
import FoodCounter from "../pages/food-counter/index";          // ✅ Fixed: uses real food-counter page
import HallScan from "../pages/hall-entry-exit-scan/HallScan";
import WorkshopScan from "../pages/workshop-scan/WorkshopScan";
import MonoScan from "../pages/mono-scan/MonoScan";
import CertificateScan from "../pages/certificate-scan/CertificateScan"; // ✅ Already fixed
import RegisteredList from "./pages/RegisteredList";
import AdminDashboard from "./pages/admin-dashboard";
import ParticipantManagement from "./pages/participant-management";
import BadgePrint from "./pages/badge-print";
import ScanCenter from "./pages/scan-center/ScanCenter";
import Settings from "./pages/settings/Settings";

export default function UserRoutes() {
  return (
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
  );
}